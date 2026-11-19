
import json
import os
import logging
from datetime import datetime
from typing import Optional

from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    UploadFile,
    Depends
)

from database.db import get_connection
from services.resume_parser import extract_resume_text
from services.analyzer import analyze_resume
from routes.auth_routes import get_current_user


router = APIRouter()
logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 5 * 1024 * 1024

print("RESUME ROUTER FILE LOADED SUCCESSFULLY")


# ==========================================
# HELPER: SAFE JSON LIST
# ==========================================

def safe_json_list(value):

    if not value:
        return []

    try:
        data = json.loads(value)
        return data if isinstance(data, list) else []

    except (json.JSONDecodeError, TypeError):
        return []


# ==========================================
# HELPER: DATE FILTER
# ==========================================

def build_date_filter(start_date, end_date):

    conditions = []
    params = []

    def validate_date(value, field_name):

        try:
            parsed = datetime.strptime(value, "%Y-%m-%d")

            if parsed.strftime("%Y-%m-%d") != value:
                raise ValueError

        except (ValueError, TypeError):

            raise HTTPException(
                status_code=400,
                detail=f"Invalid {field_name}. Use YYYY-MM-DD."
            )

    if start_date:
        validate_date(start_date, "start date")
        conditions.append("date(created_at) >= date(?)")
        params.append(start_date)

    if end_date:
        validate_date(end_date, "end date")
        conditions.append("date(created_at) <= date(?)")
        params.append(end_date)

    if start_date and end_date and start_date > end_date:

        raise HTTPException(
            status_code=400,
            detail="Start date cannot be after end date."
        )

    return (
        (" AND " + " AND ".join(conditions)) if conditions else "",
        params
    )


# ==========================================
# HELPER: FORMAT ANALYSIS
# ==========================================

def format_analysis(row):

    return {
        "id": row["id"],
        "filename": row["filename"],
        "match_score": row["score"],
        "matched_skills": safe_json_list(row["matched_skills"]),
        "missing_skills": safe_json_list(row["missing_skills"]),
        "suggestions": safe_json_list(row["suggestions"]),
        "created_at": row["created_at"]
    }


# ==========================================
# RESUME ANALYSIS API
# ==========================================

@router.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    current_user: dict = Depends(get_current_user)
):

    print("\n========== ANALYZE FUNCTION CALLED ==========")

    if not file.filename or not file.filename.strip():
        raise HTTPException(400, "Please choose a resume file.")

    filename = os.path.basename(
        file.filename.replace("\\", "/")
    ).strip()

    if "." not in filename:
        raise HTTPException(400, "File must be PDF or DOCX.")

    extension = filename.rsplit(".", 1)[-1].lower()

    if extension not in {"pdf", "docx"}:
        raise HTTPException(400, "Only PDF and DOCX files are supported.")

    if not job_description or not job_description.strip():
        raise HTTPException(400, "Please enter a job description.")

    try:
        content = await file.read(MAX_FILE_SIZE + 1)

    except Exception:
        logger.exception("Resume upload failed")
        raise HTTPException(400, "Could not read uploaded file.")

    finally:
        await file.close()

    if not content:
        raise HTTPException(400, "Uploaded file is empty.")

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, "Maximum file size is 5 MB.")

    if extension == "pdf":

        if b"%PDF-" not in content[:1024]:
            raise HTTPException(400, "Invalid PDF file.")

    elif extension == "docx":

        if not content.startswith(b"PK"):
            raise HTTPException(400, "Invalid DOCX document.")

    # --------------------------------------
    # RESUME TEXT EXTRACTION
    # --------------------------------------

    try:

        resume_text = extract_resume_text(content, extension)

        print("\n========== RESUME EXTRACTION DEBUG ==========")
        print("Filename:", filename)
        print("Extension:", extension)
        print("Extracted text length:", len(resume_text))
        print("Extracted resume text:")
        print(resume_text)
        print("=============================================\n")

    except Exception:
        logger.exception("Resume extraction failed")
        raise HTTPException(400, "Could not read the resume.")

    if not resume_text or len(resume_text.strip()) < 30:
        raise HTTPException(
            400,
            "Not enough readable text. Scanned PDFs need OCR."
        )

    # --------------------------------------
    # RESUME ANALYSIS
    # --------------------------------------

    try:

        result = analyze_resume(
            resume_text,
            job_description.strip()
        )

        print("\n========== ANALYSIS DEBUG ==========")
        print("ATS Score:", result.get("match_score"))
        print("Text Similarity:", result.get("text_similarity"))
        print("Skill Coverage:", result.get("skill_coverage"))
        print("Resume Skills:", result.get("resume_skills"))
        print("Job Skills:", result.get("job_skills"))
        print("Matched Skills:", result.get("matched_skills"))
        print("Missing Skills:", result.get("missing_skills"))
        print("====================================\n")

        # DEBUG INFORMATION SENT TO FRONTEND
        result["debug_info"] = {
            "ats_score": result.get("match_score"),
            "text_similarity": result.get("text_similarity"),
            "skill_coverage": result.get("skill_coverage"),
            "resume_skills": result.get("resume_skills"),
            "job_skills": result.get("job_skills"),
            "matched_skills": result.get("matched_skills"),
            "missing_skills": result.get("missing_skills")
        }

    except Exception:
        logger.exception("Resume analysis failed")
        raise HTTPException(500, "Resume analysis failed.")

    # --------------------------------------
    # SAVE ANALYSIS TO DATABASE
    # --------------------------------------

    try:

        with get_connection() as connection:

            cursor = connection.execute(
                """
                INSERT INTO analyses
                (
                    filename,
                    score,
                    matched_skills,
                    missing_skills,
                    suggestions,
                    user_id
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    filename,
                    result["match_score"],
                    json.dumps(result["matched_skills"]),
                    json.dumps(result["missing_skills"]),
                    json.dumps(result["suggestions"]),
                    current_user["id"]
                )
            )

            analysis_id = cursor.lastrowid

        result["analysis_id"] = analysis_id
        result["filename"] = filename

        return result

    except Exception:
        logger.exception("Failed to save analysis")
        raise HTTPException(500, "Could not save resume analysis.")


# ==========================================
# RESUME HISTORY API
# ==========================================

@router.get("/history")
def history(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):

    date_filter, params = build_date_filter(start_date, end_date)

    try:

        with get_connection() as connection:

            rows = connection.execute(
                """
                SELECT *
                FROM analyses
                WHERE user_id = ?
                """
                + date_filter +
                """
                ORDER BY id DESC
                LIMIT 20
                """,
                [current_user["id"]] + params
            ).fetchall()

        return [format_analysis(row) for row in rows]

    except HTTPException:
        raise

    except Exception:
        logger.exception("History retrieval failed")
        raise HTTPException(500, "Could not retrieve history.")


# ==========================================
# DELETE INDIVIDUAL HISTORY
# ==========================================

@router.delete("/history/{analysis_id}")
def delete_analysis(
    analysis_id: int,
    current_user: dict = Depends(get_current_user)
):

    if analysis_id <= 0:
        raise HTTPException(400, "Invalid analysis ID.")

    try:

        with get_connection() as connection:

            cursor = connection.execute(
                """
                DELETE FROM analyses
                WHERE id = ? AND user_id = ?
                """,
                (analysis_id, current_user["id"])
            )

            if cursor.rowcount == 0:
                raise HTTPException(404, "Resume analysis not found.")

        return {
            "message": "Resume analysis deleted successfully.",
            "deleted_id": analysis_id
        }

    except HTTPException:
        raise

    except Exception:
        logger.exception("Delete failed")
        raise HTTPException(500, "Could not delete analysis.")


# ==========================================
# EXPORT DATA
# ==========================================

@router.get("/export")
def export_analyses(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):

    date_filter, params = build_date_filter(start_date, end_date)

    try:

        with get_connection() as connection:

            rows = connection.execute(
                """
                SELECT *
                FROM analyses
                WHERE user_id = ?
                """
                + date_filter +
                """
                ORDER BY id DESC
                """,
                [current_user["id"]] + params
            ).fetchall()

        return [format_analysis(row) for row in rows]

    except HTTPException:
        raise

    except Exception:
        logger.exception("Export failed")
        raise HTTPException(500, "Could not export data.")


# ==========================================
# ANALYTICS DASHBOARD
# ==========================================

@router.get("/analytics")
def analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):

    date_filter, params = build_date_filter(start_date, end_date)

    try:

        with get_connection() as connection:

            rows = connection.execute(
                """
                SELECT score, matched_skills, missing_skills, created_at
                FROM analyses
                WHERE user_id = ?
                """
                + date_filter +
                """
                ORDER BY id ASC
                """,
                [current_user["id"]] + params
            ).fetchall()

    except HTTPException:
        raise

    except Exception:
        logger.exception("Analytics retrieval failed")
        raise HTTPException(500, "Could not retrieve analytics.")

    total = len(rows)

    if total == 0:

        return {
            "total_analyses": 0,
            "average_score": 0,
            "score_distribution": [],
            "skill_summary": {
                "matched": 0,
                "missing": 0
            },
            "history_trend": [],
            "top_missing_skills": []
        }

    scores = [float(row["score"] or 0) for row in rows]

    average_score = round(sum(scores) / total, 1)

    ranges = {
        "0-20": 0,
        "21-40": 0,
        "41-60": 0,
        "61-80": 0,
        "81-100": 0
    }

    for score in scores:

        if score <= 20:
            ranges["0-20"] += 1
        elif score <= 40:
            ranges["21-40"] += 1
        elif score <= 60:
            ranges["41-60"] += 1
        elif score <= 80:
            ranges["61-80"] += 1
        else:
            ranges["81-100"] += 1

    score_distribution = [
        {"range": key, "count": value}
        for key, value in ranges.items()
    ]

    matched_count = 0
    missing_count = 0
    missing_frequency = {}
    history_trend = []

    for row in rows:

        matched = safe_json_list(row["matched_skills"])
        missing = safe_json_list(row["missing_skills"])

        matched_count += len(matched)
        missing_count += len(missing)

        for skill in missing:

            if not isinstance(skill, str):
                continue

            skill = skill.strip().lower()

            if skill:
                missing_frequency[skill] = (
                    missing_frequency.get(skill, 0) + 1
                )

        history_trend.append({
            "date": row["created_at"],
            "score": round(float(row["score"] or 0), 1)
        })

    top_missing_skills = [
        {"skill": skill, "count": count}
        for skill, count in sorted(
            missing_frequency.items(),
            key=lambda item: item[1],
            reverse=True
        )[:10]
    ]

    return {
        "total_analyses": total,
        "average_score": average_score,
        "score_distribution": score_distribution,
        "skill_summary": {
            "matched": matched_count,
            "missing": missing_count
        },
        "history_trend": history_trend,
        "top_missing_skills": top_missing_skills
    }


# ==========================================
# DELETE ALL USER HISTORY
# ==========================================

@router.delete("/history")
def delete_all_history(
    current_user: dict = Depends(get_current_user)
):

    try:

        with get_connection() as connection:

            cursor = connection.execute(
                """
                DELETE FROM analyses
                WHERE user_id = ?
                """,
                (current_user["id"],)
            )

            deleted_count = cursor.rowcount

        return {
            "message": "Your resume history was deleted successfully.",
            "deleted_count": deleted_count
        }

    except Exception:
        logger.exception("Bulk delete failed")
        raise HTTPException(500, "Could not delete history.")

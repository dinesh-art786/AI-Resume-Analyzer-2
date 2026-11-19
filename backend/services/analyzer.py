
import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ==========================================
# SKILLS DATABASE
# ==========================================

SKILLS = [
    "python", "java", "javascript", "typescript", "c++", "c#", "sql",
    "html", "css", "react", "angular", "vue", "node.js", "fastapi",
    "django", "flask", "machine learning", "deep learning",
    "artificial intelligence", "data analysis", "data science",
    "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch",
    "natural language processing", "nlp", "power bi", "tableau",
    "excel", "statistics", "aws", "azure", "docker", "kubernetes",
    "git", "linux", "rest api", "mongodb", "postgresql", "mysql",
    "communication", "leadership", "problem solving",
    "project management", "agile", "testing", "cybersecurity"
]


# ==========================================
# RESUME SECTIONS
# ==========================================

RESUME_SECTIONS = {
    "Summary": [
        "summary", "professional summary", "career objective",
        "profile", "about me"
    ],
    "Skills": [
        "skills", "technical skills", "core competencies",
        "technical expertise"
    ],
    "Experience": [
        "experience", "work experience", "employment history",
        "professional experience"
    ],
    "Education": [
        "education", "academic background", "qualification"
    ],
    "Projects": [
        "projects", "personal projects", "academic projects"
    ],
    "Certifications": [
        "certifications", "certificates", "licenses"
    ]
}


# ==========================================
# ACTION VERBS
# ==========================================

STRONG_ACTION_VERBS = [
    "developed", "created", "designed", "implemented",
    "managed", "led", "built", "improved", "achieved",
    "optimized", "delivered", "analyzed", "automated",
    "engineered", "launched", "increased", "reduced",
    "organized", "coordinated", "executed", "established",
    "transformed", "streamlined", "generated"
]


# ==========================================
# TEXT CLEANING
# ==========================================

def clean_text(text: str):

    if not text:
        return ""

    text = str(text).lower()
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ==========================================
# FIND SKILLS
# ==========================================

def find_skills(text: str):

    text = clean_text(text)

    found = []

    for skill in SKILLS:

        pattern = (
            r"(?<![a-z0-9])"
            + re.escape(skill.lower())
            + r"(?![a-z0-9])"
        )

        if re.search(pattern, text):
            found.append(skill)

    return found


# ==========================================
# CHECK RESUME SECTIONS
# ==========================================

def check_resume_sections(resume_text: str):

    text = clean_text(resume_text)

    section_results = {}

    for section, keywords in RESUME_SECTIONS.items():

        section_results[section] = any(
            re.search(
                r"(?<![a-z])"
                + re.escape(keyword)
                + r"(?![a-z])",
                text
            )
            for keyword in keywords
        )

    present = [
        section
        for section, found in section_results.items()
        if found
    ]

    missing = [
        section
        for section, found in section_results.items()
        if not found
    ]

    return {
        "present_sections": present,
        "missing_sections": missing,
        "section_details": section_results
    }


# ==========================================
# CHECK ACTION VERBS
# ==========================================

def check_action_verbs(resume_text: str):

    text = clean_text(resume_text)

    found_verbs = [
        verb
        for verb in STRONG_ACTION_VERBS
        if re.search(
            r"\b" + re.escape(verb) + r"\b",
            text
        )
    ]

    return found_verbs


# ==========================================
# CHECK MEASURABLE ACHIEVEMENTS
# ==========================================

def check_achievements(resume_text: str):

    text = clean_text(resume_text)

    patterns = [
        r"\b\d+(?:\.\d+)?%",
        r"\b\d+\+",
        r"\b\d+\s+(?:users|customers|clients|projects|employees)\b",
        r"\b(increased|decreased|reduced|improved|saved|generated)\b"
    ]

    return any(
        re.search(pattern, text)
        for pattern in patterns
    )


# ==========================================
# CHECK CONTACT INFORMATION
# ==========================================

def check_contact_information(resume_text: str):

    email_pattern = (
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
    )

    phone_pattern = (
        r"(?<!\d)\+?\d[\d\s().-]{8,}\d(?!\d)"
    )

    email_found = bool(
        re.search(email_pattern, resume_text)
    )

    phone_found = bool(
        re.search(phone_pattern, resume_text)
    )

    return {
        "email": email_found,
        "phone": phone_found,
        "complete": email_found and phone_found
    }


# ==========================================
# RESUME QUALITY ANALYSIS
# ==========================================

def analyze_resume_quality(
    resume_text: str,
    section_analysis: dict,
    action_verbs: list,
    has_achievements: bool
):

    contact = check_contact_information(resume_text)

    sections = section_analysis["section_details"]

    checks = {
        "Email Address": contact["email"],
        "Phone Number": contact["phone"],
        "Education Section": sections.get("Education", False),
        "Experience Section": sections.get("Experience", False),
        "Skills Section": sections.get("Skills", False),
        "Projects Section": sections.get("Projects", False),
        "Measurable Achievements": has_achievements,
        "Strong Action Verbs": len(action_verbs) > 0
    }

    weights = {
        "Email Address": 7.5,
        "Phone Number": 7.5,
        "Education Section": 15,
        "Experience Section": 15,
        "Skills Section": 10,
        "Projects Section": 10,
        "Measurable Achievements": 15,
        "Strong Action Verbs": 20
    }

    quality_score = sum(
        weights[item]
        for item, passed in checks.items()
        if passed
    )

    quality_score = round(quality_score, 1)

    strengths = [
        item
        for item, passed in checks.items()
        if passed
    ]

    improvements = [
        item
        for item, passed in checks.items()
        if not passed
    ]

    if quality_score >= 85:
        quality_level = "Excellent"

    elif quality_score >= 70:
        quality_level = "Good"

    elif quality_score >= 50:
        quality_level = "Average"

    else:
        quality_level = "Needs Improvement"

    return {
        "quality_score": quality_score,
        "quality_level": quality_level,
        "checks": checks,
        "strengths": strengths,
        "improvements": improvements
    }


# ==========================================
# RESUME STRENGTHS AND WEAKNESSES
# ==========================================

def analyze_strengths_weaknesses(
    resume_skills,
    matched_skills,
    missing_skills,
    section_analysis,
    action_verbs,
    has_achievements,
    resume_quality
):

    strengths = []
    weaknesses = []
    priority_improvements = []

    sections = section_analysis["section_details"]

    # --------------------------------------
    # CHECK EDUCATION
    # --------------------------------------

    if sections.get("Education"):

        strengths.append(
            "Your resume includes an Education section."
        )

    else:

        weaknesses.append(
            "Your resume does not clearly include an Education section."
        )

        priority_improvements.append({
            "priority": "High",
            "issue": "Missing Education section",
            "recommendation": (
                "Add your degree, institution name, "
                "graduation year and relevant qualifications."
            )
        })

    # --------------------------------------
    # CHECK EXPERIENCE
    # --------------------------------------

    if sections.get("Experience"):

        strengths.append(
            "Your resume includes an Experience section."
        )

    else:

        weaknesses.append(
            "Your resume does not clearly include an Experience section."
        )

        priority_improvements.append({
            "priority": "High",
            "issue": "Missing Experience section",
            "recommendation": (
                "Add relevant work experience, internships, "
                "training or practical experience."
            )
        })

    # --------------------------------------
    # CHECK SKILLS SECTION
    # --------------------------------------

    if sections.get("Skills"):

        strengths.append(
            "Your resume includes a Skills section."
        )

    else:

        weaknesses.append(
            "Your resume is missing a clearly identified Skills section."
        )

        priority_improvements.append({
            "priority": "High",
            "issue": "Missing Skills section",
            "recommendation": (
                "Add a dedicated skills section containing "
                "your relevant technical and professional skills."
            )
        })

    # --------------------------------------
    # CHECK PROJECTS
    # --------------------------------------

    if sections.get("Projects"):

        strengths.append(
            "Your resume includes a Projects section."
        )

    else:

        weaknesses.append(
            "Your resume does not clearly include a Projects section."
        )

        priority_improvements.append({
            "priority": "Medium",
            "issue": "Missing Projects section",
            "recommendation": (
                "Add academic or personal projects and describe "
                "the technologies and skills you used."
            )
        })

    # --------------------------------------
    # CHECK SKILLS
    # --------------------------------------

    if resume_skills:

        strengths.append(
            f"Your resume contains {len(resume_skills)} recognized skills."
        )

    else:

        weaknesses.append(
            "No recognized skills were detected in your resume."
        )

        priority_improvements.append({
            "priority": "High",
            "issue": "Skills not detected",
            "recommendation": (
                "Include relevant technical and professional skills "
                "that you genuinely possess."
            )
        })

    # --------------------------------------
    # CHECK JOB SKILL MATCH
    # --------------------------------------

    if matched_skills:

        strengths.append(
            f"Your resume matches {len(matched_skills)} skills "
            "from the job description."
        )

    if missing_skills:

        weaknesses.append(
            f"{len(missing_skills)} job-related skills are missing "
            "from your resume."
        )

        priority_improvements.append({
            "priority": "High",
            "issue": "Job-related skill gaps",
            "recommendation": (
                "If you genuinely have these skills, add relevant "
                "examples and evidence: "
                + ", ".join(missing_skills[:8])
            )
        })

    # --------------------------------------
    # CHECK ACTION VERBS
    # --------------------------------------

    if action_verbs:

        strengths.append(
            f"Your resume uses {len(action_verbs)} recognized "
            "strong action verbs."
        )

    else:

        weaknesses.append(
            "Your resume does not contain recognized strong action verbs."
        )

        priority_improvements.append({
            "priority": "Medium",
            "issue": "Weak action language",
            "recommendation": (
                "Use action verbs such as Developed, Designed, "
                "Implemented, Managed and Optimized where appropriate."
            )
        })

    # --------------------------------------
    # CHECK ACHIEVEMENTS
    # --------------------------------------

    if has_achievements:

        strengths.append(
            "Your resume contains measurable achievement indicators."
        )

    else:

        weaknesses.append(
            "Your resume lacks clearly detected measurable achievements."
        )

        priority_improvements.append({
            "priority": "High",
            "issue": "Missing measurable achievements",
            "recommendation": (
                "Where possible, include numbers, percentages, "
                "project results, users supported or time saved."
            )
        })

    # --------------------------------------
    # CHECK CONTACT INFORMATION
    # --------------------------------------

    quality_checks = resume_quality.get("checks", {})

    if (
        quality_checks.get("Email Address")
        and quality_checks.get("Phone Number")
    ):

        strengths.append(
            "Your resume contains both email and phone contact information."
        )

    else:

        weaknesses.append(
            "Your resume may be missing email or phone contact information."
        )

        priority_improvements.append({
            "priority": "High",
            "issue": "Incomplete contact information",
            "recommendation": (
                "Include a professional email address and "
                "a valid phone number."
            )
        })

    # --------------------------------------
    # FALLBACK MESSAGES
    # --------------------------------------

    if not strengths:

        strengths.append(
            "Continue developing your resume with relevant skills, "
            "projects and experience."
        )

    if not weaknesses:

        weaknesses.append(
            "No major weaknesses were detected by the current checks."
        )

    if not priority_improvements:

        priority_improvements.append({
            "priority": "Low",
            "issue": "Continue improving your resume",
            "recommendation": (
                "Keep your resume updated and tailor it to "
                "each job description."
            )
        })

    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "priority_improvements": priority_improvements
    }


# ==========================================
# TEXT SIMILARITY
# ==========================================

def calculate_similarity(resume_text: str, job_description: str):

    resume_text = clean_text(resume_text)
    job_description = clean_text(job_description)

    if not resume_text or not job_description:
        return 0.0

    try:

        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            sublinear_tf=True
        )

        vectors = vectorizer.fit_transform([
            resume_text,
            job_description
        ])

        similarity = cosine_similarity(
            vectors[0:1],
            vectors[1:2]
        )[0][0]

        return float(similarity)

    except ValueError:

        return 0.0


# ==========================================
# JOB READINESS RATING
# ==========================================

def get_job_readiness(score: float):

    if score >= 80:
        return "Excellent"

    elif score >= 65:
        return "Good"

    elif score >= 45:
        return "Average"

    else:
        return "Needs Improvement"


# ==========================================
# MAIN RESUME ANALYSIS
# ==========================================

def analyze_resume(resume_text: str, job_description: str):

    resume_text = clean_text(resume_text)
    job_description = clean_text(job_description)

    if len(resume_text) < 30:
        raise ValueError("Resume contains insufficient readable text.")

    if len(job_description) < 10:
        raise ValueError("Please provide a valid job description.")

    # --------------------------------------
    # TEXT SIMILARITY
    # --------------------------------------

    similarity = calculate_similarity(
        resume_text,
        job_description
    )

    # --------------------------------------
    # SKILL MATCHING
    # --------------------------------------

    resume_skills = find_skills(resume_text)

    job_skills = find_skills(job_description)

    matched = [
        skill
        for skill in job_skills
        if skill in resume_skills
    ]

    missing = [
        skill
        for skill in job_skills
        if skill not in resume_skills
    ]

    coverage = (
        len(matched) / len(job_skills)
        if job_skills else 0.0
    )

    # --------------------------------------
    # ATS SCORE
    # --------------------------------------

    if job_skills:

        score = (
            similarity * 70
            + coverage * 30
        )

    else:

        score = similarity * 100

    score = round(max(0, min(100, score)), 1)

    # --------------------------------------
    # RESUME SECTION CHECK
    # --------------------------------------

    section_analysis = check_resume_sections(
        resume_text
    )

    # --------------------------------------
    # ACTION VERB CHECK
    # --------------------------------------

    action_verbs = check_action_verbs(
        resume_text
    )

    # --------------------------------------
    # ACHIEVEMENT CHECK
    # --------------------------------------

    has_achievements = check_achievements(
        resume_text
    )

    # --------------------------------------
    # RESUME QUALITY ANALYSIS
    # --------------------------------------

    resume_quality = analyze_resume_quality(
        resume_text,
        section_analysis,
        action_verbs,
        has_achievements
    )

    # --------------------------------------
    # STRENGTHS AND WEAKNESSES
    # --------------------------------------

    strengths_weaknesses = analyze_strengths_weaknesses(
        resume_skills,
        matched,
        missing,
        section_analysis,
        action_verbs,
        has_achievements,
        resume_quality
    )

    # --------------------------------------
    # JOB READINESS
    # --------------------------------------

    readiness = get_job_readiness(score)

    # --------------------------------------
    # IMPROVEMENT SUGGESTIONS
    # --------------------------------------

    suggestions = []

    if missing:

        suggestions.append(
            "If you genuinely have these skills, add evidence of them: "
            + ", ".join(missing[:8])
            + "."
        )

    if similarity < 0.25:

        suggestions.append(
            "Tailor your professional summary and experience "
            "to the responsibilities and terminology in the job description."
        )

    if section_analysis["missing_sections"]:

        suggestions.append(
            "Consider adding these resume sections where relevant: "
            + ", ".join(section_analysis["missing_sections"])
            + "."
        )

    if not action_verbs:

        suggestions.append(
            "Use strong action verbs such as Developed, "
            "Implemented, Managed, Designed and Optimized."
        )

    if not has_achievements:

        suggestions.append(
            "Add measurable achievements such as percentages, "
            "project counts, users supported or time saved."
        )

    if not resume_quality["checks"]["Email Address"]:

        suggestions.append(
            "Add a professional email address to your resume."
        )

    if not resume_quality["checks"]["Phone Number"]:

        suggestions.append(
            "Add a valid contact phone number to your resume."
        )

    if not suggestions:

        suggestions.append(
            "Your resume has a good match. Continue improving "
            "your experience descriptions with specific achievements."
        )

    suggestions.append(
        "Use standard ATS-friendly headings and a simple, "
        "readable resume layout."
    )

    # --------------------------------------
    # FINAL RESPONSE
    # --------------------------------------

    return {

        "match_score": score,

        "text_similarity": round(
            similarity * 100, 1
        ),

        "skill_coverage": round(
            coverage * 100, 1
        ),

        "resume_skills": resume_skills,

        "job_skills": job_skills,

        "matched_skills": matched,

        "missing_skills": missing,

        "suggestions": suggestions,

        "job_readiness": readiness,

        "resume_sections": section_analysis,

        "action_verbs": action_verbs,

        "has_measurable_achievements": has_achievements,

        "resume_quality": resume_quality,

        "strengths_weaknesses": strengths_weaknesses

    }

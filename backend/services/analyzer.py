
import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# --------------------------------------------------
# 1. SKILL ALIASES
# --------------------------------------------------

SKILL_ALIASES = {
    "python": ["python", "py"],
    "java": ["java"],
    "javascript": ["javascript", "js"],
    "typescript": ["typescript", "ts"],
    "c++": ["c++", "cpp"],
    "c#": ["c#", "c sharp"],
    "sql": ["sql"],
    "html": ["html"],
    "css": ["css"],
    "react": ["react", "reactjs", "react.js"],
    "angular": ["angular"],
    "vue": ["vue", "vuejs", "vue.js"],
    "node.js": ["node.js", "nodejs", "node js"],
    "fastapi": ["fastapi"],
    "django": ["django"],
    "flask": ["flask"],
    "machine learning": ["machine learning", "ml"],
    "deep learning": ["deep learning"],
    "artificial intelligence": ["artificial intelligence", "ai"],
    "data analysis": ["data analysis"],
    "data science": ["data science"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    "tensorflow": ["tensorflow"],
    "pytorch": ["pytorch"],
    "nlp": ["nlp", "natural language processing"],
    "power bi": ["power bi", "powerbi"],
    "tableau": ["tableau"],
    "excel": ["excel", "microsoft excel"],
    "statistics": ["statistics", "statistical analysis"],
    "aws": ["aws", "amazon web services"],
    "azure": ["azure", "microsoft azure"],
    "docker": ["docker"],
    "kubernetes": ["kubernetes", "k8s"],
    "git": ["git"],
    "linux": ["linux"],
    "rest api": ["rest api", "restful api", "rest apis"],
    "mongodb": ["mongodb", "mongo db"],
    "postgresql": ["postgresql", "postgres"],
    "mysql": ["mysql"],
    "communication": ["communication", "communication skills"],
    "leadership": ["leadership"],
    "problem solving": ["problem solving", "problem-solving"],
    "project management": ["project management"],
    "agile": ["agile"],
    "testing": ["testing", "software testing"],
    "cybersecurity": ["cybersecurity", "cyber security"],
}


SKILLS = list(SKILL_ALIASES.keys())


# --------------------------------------------------
# 2. RESUME SECTIONS
# --------------------------------------------------

RESUME_SECTIONS = [
    "education",
    "experience",
    "work experience",
    "skills",
    "technical skills",
    "projects",
    "certifications",
    "achievements",
    "summary",
    "objective",
]


# --------------------------------------------------
# 3. ACTION VERBS
# --------------------------------------------------

STRONG_ACTION_VERBS = [
    "developed",
    "created",
    "designed",
    "implemented",
    "managed",
    "built",
    "optimized",
    "improved",
    "analyzed",
    "led",
    "delivered",
    "engineered",
    "automated",
    "configured",
    "maintained",
    "deployed",
    "tested",
    "coordinated",
    "achieved",
    "increased",
    "reduced",
    "streamlined",
    "integrated",
    "launched",
    "executed",
]


# --------------------------------------------------
# 4. TEXT CLEANING
# --------------------------------------------------

def clean_text(text):
    if not text:
        return ""

    text = str(text).lower()
    text = text.replace("\n", " ")
    text = text.replace("\t", " ")
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# --------------------------------------------------
# 5. CHECK WHETHER A TERM EXISTS
# --------------------------------------------------

def contains_term(text, term):
    text = clean_text(text)
    term = clean_text(term)

    if not text or not term:
        return False

    pattern = (
        r"(?<![a-z0-9])"
        + re.escape(term)
        + r"(?![a-z0-9])"
    )

    return re.search(pattern, text) is not None


# --------------------------------------------------
# 6. FIND SKILLS
# --------------------------------------------------

def find_skills(text):
    text = clean_text(text)

    found_skills = []

    for skill, aliases in SKILL_ALIASES.items():
        for alias in aliases:
            if contains_term(text, alias):
                found_skills.append(skill)
                break

    return sorted(set(found_skills))


# --------------------------------------------------
# 7. CHECK RESUME SECTIONS
# --------------------------------------------------

def check_resume_sections(resume_text):
    text = clean_text(resume_text)

    found_sections = []

    for section in RESUME_SECTIONS:
        if contains_term(text, section):
            found_sections.append(section)

    missing_sections = [
        section
        for section in ["education", "experience", "skills", "projects"]
        if section not in found_sections
    ]

    return found_sections, missing_sections


# --------------------------------------------------
# 8. CHECK ACTION VERBS
# --------------------------------------------------

def check_action_verbs(resume_text):
    text = clean_text(resume_text)

    found_verbs = []

    for verb in STRONG_ACTION_VERBS:
        if contains_term(text, verb):
            found_verbs.append(verb)

    return found_verbs


# --------------------------------------------------
# 9. CHECK MEASURABLE ACHIEVEMENTS
# --------------------------------------------------

def check_achievements(resume_text):
    text = clean_text(resume_text)

    has_numbers = bool(
        re.search(r"\b\d+(\.\d+)?%?\b", text)
    )

    achievement_words = [
        "increased",
        "decreased",
        "reduced",
        "improved",
        "saved",
        "generated",
        "achieved",
        "growth",
        "performance",
        "efficiency",
    ]

    has_achievement_words = any(
        contains_term(text, word)
        for word in achievement_words
    )

    return has_numbers and has_achievement_words


# --------------------------------------------------
# 10. CHECK CONTACT INFORMATION
# --------------------------------------------------

def check_contact_information(resume_text):
    text = str(resume_text or "")

    email_found = bool(
        re.search(
            r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
            text
        )
    )

    phone_found = bool(
        re.search(
            r"(\+?\d[\d\s().-]{7,}\d)",
            text
        )
    )

    return email_found, phone_found


# --------------------------------------------------
# 11. RESUME QUALITY ANALYSIS
# --------------------------------------------------

def analyze_resume_quality(resume_text):
    sections, missing_sections = check_resume_sections(
        resume_text
    )

    action_verbs = check_action_verbs(resume_text)

    achievements = check_achievements(resume_text)

    email_found, phone_found = check_contact_information(
        resume_text
    )

    score = 0

    # Resume sections
    score += min(len(sections) * 10, 40)

    # Action verbs
    score += min(len(action_verbs) * 5, 25)

    # Measurable achievements
    if achievements:
        score += 20

    # Contact information
    if email_found:
        score += 7

    if phone_found:
        score += 8

    score = min(score, 100)

    return {
        "quality_score": score,
        "sections": sections,
        "missing_sections": missing_sections,
        "action_verbs": action_verbs,
        "has_measurable_achievements": achievements,
        "has_email": email_found,
        "has_phone": phone_found,
    }


# --------------------------------------------------
# 12. TF-IDF TEXT SIMILARITY
# --------------------------------------------------

def calculate_similarity(resume_text, job_description):
    resume_text = clean_text(resume_text)
    job_description = clean_text(job_description)

    if not resume_text or not job_description:
        return 0.0

    try:
        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=5000,
        )

        tfidf_matrix = vectorizer.fit_transform([
            resume_text,
            job_description,
        ])

        similarity = cosine_similarity(
            tfidf_matrix[0:1],
            tfidf_matrix[1:2],
        )[0][0]

        return round(float(similarity) * 100, 1)

    except ValueError:
        return 0.0


# --------------------------------------------------
# 13. IMPROVED KEYWORD MATCHING
# --------------------------------------------------

def calculate_keyword_match(resume_text, job_description):
    resume_text = clean_text(resume_text)
    job_description = clean_text(job_description)

    stop_words = {
        "the", "and", "for", "with", "you", "your", "our",
        "are", "is", "was", "were", "will", "can", "must",
        "should", "have", "has", "had", "this", "that",
        "from", "into", "about", "who", "what", "when",
        "where", "need", "needed", "looking", "seeking",
        "candidate", "ability", "work", "working",
        "good", "strong", "knowledge", "skills",
    }

    # Extract individual meaningful words.
    words = re.findall(
        r"\b[a-zA-Z][a-zA-Z0-9+#.]*\b",
        job_description,
    )

    keywords = {
        word.lower()
        for word in words
        if len(word) > 2 and word.lower() not in stop_words
    }

    # Add recognized multi-word technical skills.
    for skill in SKILLS:
        if contains_term(job_description, skill):
            keywords.add(skill.lower())

    if not keywords:
        return 0.0, [], []

    matched_keywords = []
    missing_keywords = []

    for keyword in sorted(keywords):
        if contains_term(resume_text, keyword):
            matched_keywords.append(keyword)
        else:
            missing_keywords.append(keyword)

    score = (
        len(matched_keywords) / len(keywords)
    ) * 100

    return (
        round(score, 1),
        matched_keywords,
        missing_keywords,
    )


# --------------------------------------------------
# 14. JOB READINESS
# --------------------------------------------------

def get_job_readiness(match_score):
    if match_score >= 85:
        return "Excellent"

    elif match_score >= 70:
        return "Good"

    elif match_score >= 50:
        return "Average"

    else:
        return "Needs Improvement"


# --------------------------------------------------
# 15. STRENGTHS AND WEAKNESSES
# --------------------------------------------------

def analyze_strengths_weaknesses(
    resume_text,
    matched_skills,
    missing_skills,
    sections,
    action_verbs,
    achievements,
    email_found,
    phone_found,
):
    strengths = []
    weaknesses = []
    priority_improvements = []

    if matched_skills:
        strengths.append(
            f"Your resume matches {len(matched_skills)} job-related skills."
        )

    if sections:
        strengths.append(
            "Your resume contains recognizable sections."
        )

    if action_verbs:
        strengths.append(
            f"Your resume uses {len(action_verbs)} recognized action verbs."
        )

    if achievements:
        strengths.append(
            "Your resume contains measurable achievement evidence."
        )

    if email_found and phone_found:
        strengths.append(
            "Your resume contains email and phone contact information."
        )

    if missing_skills:
        weaknesses.append(
            "Your resume is missing some skills required by the job description."
        )

        priority_improvements.append({
            "priority": "High",
            "issue": "Missing job-related skills",
            "recommendation": (
                "Add relevant missing skills only if you genuinely possess them."
            ),
        })

    if "skills" not in sections and "technical skills" not in sections:
        weaknesses.append(
            "Your resume does not clearly include a Skills section."
        )

        priority_improvements.append({
            "priority": "High",
            "issue": "Missing Skills section",
            "recommendation": (
                "Add a clearly labelled Skills section where relevant to your background."
            ),
        })

    if not achievements:
        weaknesses.append(
            "Measurable achievements were not clearly detected."
        )

        priority_improvements.append({
            "priority": "Medium",
            "issue": "Missing measurable achievements",
            "recommendation": (
                "Include genuine results using numbers, percentages, or measurable outcomes."
            ),
        })

    if not email_found or not phone_found:
        weaknesses.append(
            "Your resume may be missing contact information."
        )

    if not action_verbs:
        weaknesses.append(
            "Your resume could use stronger action verbs."
        )

    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "priority_improvements": priority_improvements,
    }


# --------------------------------------------------
# 16. MAIN RESUME ANALYSIS FUNCTION
# --------------------------------------------------

def analyze_resume(resume_text, job_description):

    resume_text = str(resume_text or "")
    job_description = str(job_description or "")

    if not resume_text.strip():
        raise ValueError("Resume text is empty.")

    if not job_description.strip():
        raise ValueError("Job description is empty.")

    # Detect skills
    resume_skills = find_skills(resume_text)
    job_skills = find_skills(job_description)

    matched_skills = [
        skill for skill in job_skills
        if skill in resume_skills
    ]

    missing_skills = [
        skill for skill in job_skills
        if skill not in resume_skills
    ]

    # Skill coverage
    if job_skills:
        skill_coverage = (
            len(matched_skills) / len(job_skills)
        ) * 100
    else:
        skill_coverage = 0.0

    skill_coverage = round(skill_coverage, 1)

    # Text similarity
    text_similarity = calculate_similarity(
        resume_text,
        job_description,
    )

    # Keyword matching
    keyword_match, matched_keywords, missing_keywords = (
        calculate_keyword_match(
            resume_text,
            job_description,
        )
    )

    # Resume structure and evidence
    sections, missing_sections = check_resume_sections(
        resume_text
    )

    action_verbs = check_action_verbs(resume_text)

    achievements = check_achievements(resume_text)

    email_found, phone_found = check_contact_information(
        resume_text
    )

    # Experience evidence score
    experience_evidence = 0

    if (
        "experience" in sections
        or "work experience" in sections
        or "projects" in sections
    ):
        experience_evidence += 50

    if action_verbs:
        experience_evidence += 25

    if achievements:
        experience_evidence += 25

    # Resume structure score
    resume_structure = min(
        len(sections) / 4 * 100,
        100,
    )

    experience_evidence = round(
        experience_evidence, 1
    )

    resume_structure = round(
        resume_structure, 1
    )

    # ATS score calculation
    if job_skills:
        match_score = (
            skill_coverage * 0.40
            + text_similarity * 0.25
            + keyword_match * 0.20
            + experience_evidence * 0.10
            + resume_structure * 0.05
        )

    else:
        match_score = (
            text_similarity * 0.60
            + keyword_match * 0.30
            + resume_structure * 0.10
        )

    match_score = round(
        max(0, min(match_score, 100)),
        1,
    )

    # Resume quality
    resume_quality = analyze_resume_quality(
        resume_text
    )

    # Strengths and weaknesses
    strengths_weaknesses = analyze_strengths_weaknesses(
        resume_text,
        matched_skills,
        missing_skills,
        sections,
        action_verbs,
        achievements,
        email_found,
        phone_found,
    )

    # Suggestions
    suggestions = []

    if missing_skills:
        suggestions.append(
            "Consider adding relevant missing skills if you have those skills."
        )

    if not achievements:
        suggestions.append(
            "Add measurable achievements to demonstrate your impact."
        )

    if "skills" not in sections and "technical skills" not in sections:
        suggestions.append(
            "Add a clearly labelled Skills section."
        )

    if not action_verbs:
        suggestions.append(
            "Use strong action verbs to describe your work and projects."
        )

    if not email_found or not phone_found:
        suggestions.append(
            "Make sure your contact information is clearly visible."
        )

    if not suggestions:
        suggestions.append(
            "Continue tailoring your resume to the specific job description."
        )

    job_readiness = get_job_readiness(
        match_score
    )

    # Final result
    return {
        "match_score": match_score,

        "text_similarity": text_similarity,

        "skill_coverage": skill_coverage,

        "resume_skills": resume_skills,

        "job_skills": job_skills,

        "matched_skills": matched_skills,

        "missing_skills": missing_skills,

        "suggestions": suggestions,

        "job_readiness": job_readiness,

        "resume_sections": sections,

        "action_verbs": action_verbs,

        "has_measurable_achievements": achievements,

        "resume_quality": resume_quality,

        "strengths_weaknesses": strengths_weaknesses,

        "keyword_match": keyword_match,

        "matched_keywords": matched_keywords,

        "missing_keywords": missing_keywords,

        "score_breakdown": {
            "skill_match": skill_coverage,
            "text_similarity": text_similarity,
            "keyword_match": keyword_match,
            "experience_evidence": experience_evidence,
            "resume_structure": resume_structure,
        },
    }

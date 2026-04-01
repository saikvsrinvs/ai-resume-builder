import re
from collections import Counter

STOPWORDS = {
    "the","and","for","with","that","this","from","your","have","has","will","are","you","our","their","they",
    "into","using","able","role","work","works","candidate","looking","strong","skills","skill","knowledge","experience",
    "build","building","applications","application","software","engineer","engineering","developer","development","good",
    "should","must","can","real","user","users","projects","project","team","teams","job","resume","text","content","based"
}

PHRASE_CANDIDATES = [
    "data structures", "object oriented programming", "rest api", "rest apis",
    "problem solving", "web development", "machine learning", "version control",
    "dynamic rendering", "dom manipulation",
]

def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()

def tokenize(text: str):
    words = re.findall(r"[a-zA-Z][a-zA-Z\+\#\.]{1,}", text.lower())
    return [w for w in words if w not in STOPWORDS and len(w) > 2]

def extract_keywords(job_description: str):
    jd = normalize(job_description)
    phrases = [p for p in PHRASE_CANDIDATES if p in jd]
    word_counts = Counter(tokenize(job_description))
    words = [w for w, _ in word_counts.most_common(20)]
    merged = []
    for item in phrases + words:
        if item not in merged:
            merged.append(item)
    return merged[:12]

def analyze_ats_match(resume_text: str, job_description: str):
    resume = normalize(resume_text)
    keywords = extract_keywords(job_description)
    matched, missing = [], []
    for kw in keywords:
        (matched if kw in resume else missing).append(kw)

    score = round((len(matched) / len(keywords)) * 100) if keywords else 0

    if score >= 80:
        suggestion = "Strong match. Keep wording natural and make sure your best projects support the role."
    elif score >= 60:
        suggestion = "Good base. Add a few missing terms naturally in skills or project descriptions."
    else:
        suggestion = "Low match. Update summary, skills, and projects to reflect the main requirements in the job description."

    return {
        "score": score,
        "matched_keywords": matched,
        "missing_keywords": missing,
        "suggestion": suggestion,
    }

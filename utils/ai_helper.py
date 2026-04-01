import os
import re
from typing import List, Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

def _normalize_space(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()

def _clean_bullets(lines: List[str]) -> str:
    cleaned = []
    for line in lines:
        line = re.sub(r"^[-•*]\s*", "", line.strip())
        line = _normalize_space(line)
        if line:
            cleaned.append(f"- {line}")
    return "\n".join(cleaned[:3])

def _fallback_objective(target_role: str, skills: str, education: str) -> str:
    role = target_role or "Software Engineer"
    skill_items = [s.strip() for s in re.split(r",|\n", skills) if s.strip()]
    skill_text = ", ".join(skill_items[:4]) if skill_items else "problem solving and software development"
    edu_text = _normalize_space(education.split("\n")[0]) if education.strip() else "a computer science background"
    return (
        f"Motivated candidate seeking a {role} role with strengths in {skill_text}. "
        f"Eager to apply practical development skills, learn quickly, and contribute to real-world software projects using {edu_text}."
    )

def _fallback_project(project_name: str, tech_stack: str, project_purpose: str, target_role: str) -> str:
    name = project_name or "Project"
    tech = tech_stack or "relevant web technologies"
    purpose = project_purpose or "solve a practical user problem"
    role = target_role or "software engineering"
    bullets = [
        f"Built {name} using {tech} to {purpose}.",
        "Implemented core application logic, structured content flow, and user-focused features for better usability.",
        f"Designed the project to support {role} expectations with practical functionality and clean organization.",
    ]
    return _clean_bullets(bullets)

def _try_gemini(prompt: str) -> Optional[str]:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        text = getattr(response, "text", "") or ""
        text = text.strip()
        return text or None
    except Exception:
        return None

def generate_objective_text(target_role: str, skills: str, education: str) -> str:
    prompt = f"""
Write one concise professional resume summary.

Target role: {target_role}
Skills: {skills}
Education: {education}

Rules:
- 2 sentences maximum
- professional but natural
- no fake numbers
- no buzzword stuffing
- plain text only
""".strip()

    result = _try_gemini(prompt)
    if result:
        return _normalize_space(result)
    return _fallback_objective(target_role, skills, education)

def generate_project_text(project_name: str, tech_stack: str, project_purpose: str, target_role: str) -> str:
    prompt = f"""
Write exactly 3 resume bullet points.

Project: {project_name}
Tech: {tech_stack}
Purpose: {project_purpose}
Role: {target_role}

STRICT RULES:
- ONLY 3 lines
- NO headings
- NO numbering
- NO bold (**)
- NO extra text
- Each line starts with a strong action verb
- Plain text only
"""

    result = _try_gemini(prompt)

    if result:
        lines = []
        for line in result.splitlines():
            line = line.strip()

            # remove unwanted things
            line = re.sub(r"\*\*", "", line)  # remove bold
            line = re.sub(r"^[-•]\s*", "", line)  # remove bullets
            line = re.sub(r"^\d+\.\s*", "", line)  # remove numbering
            line = re.sub(r"Here are.*", "", line, flags=re.IGNORECASE)

            if line:
                lines.append(line)

        return "\n".join(lines[:3])

    return _fallback_project(project_name, tech_stack, project_purpose, target_role)
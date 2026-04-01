from flask import Flask, render_template, request, jsonify
from utils.ai_helper import generate_objective_text, generate_project_text
from utils.ats import analyze_ats_match

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("main.html")

@app.post("/api/generate-objective")
def generate_objective():
    data = request.get_json(silent=True) or {}
    target_role = (data.get("target_role") or "").strip()
    skills = (data.get("skills") or "").strip()
    education = (data.get("education") or "").strip()

    if not target_role and not skills and not education:
        return jsonify({"ok": False, "error": "Enter role, skills, or education first."}), 400

    try:
        result = generate_objective_text(target_role, skills, education)
        return jsonify({"ok": True, "result": result})
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc)}), 500

@app.post("/api/generate-project-description")
def generate_project_description():
    data = request.get_json(silent=True) or {}
    project_name = (data.get("project_name") or "").strip()
    tech_stack = (data.get("tech_stack") or "").strip()
    project_purpose = (data.get("project_purpose") or "").strip()
    target_role = (data.get("target_role") or "").strip()

    if not project_name and not project_purpose:
        return jsonify({"ok": False, "error": "Enter project name or purpose first."}), 400

    try:
        result = generate_project_text(project_name, tech_stack, project_purpose, target_role)
        return jsonify({"ok": True, "result": result})
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc)}), 500

@app.post("/api/analyze-ats")
def analyze_ats():
    data = request.get_json(silent=True) or {}
    resume_text = data.get("resume_text") or ""
    job_description = data.get("job_description") or ""

    if not resume_text.strip() or not job_description.strip():
        return jsonify({"ok": False, "error": "Enter resume content and job description first."}), 400

    try:
        result = analyze_ats_match(resume_text, job_description)
        return jsonify({"ok": True, **result})
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)

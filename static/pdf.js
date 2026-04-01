const $ = (id) => document.getElementById(id);

function formatText(text) {
  return String(text || "").replace(/\n/g, "<br>");
}

document.addEventListener("DOMContentLoaded", function () {
  const els = {
    fullName: $("fullName"),
    targetRole: $("targetRole"),
    address: $("address"),
    phone: $("phone"),
    email: $("email"),
    linkedin: $("linkedin"),
    github: $("github"),
    skills: $("skills"),
    objective: $("objective"),
    experience: $("experience"),
    certifications: $("certifications"),
    education: $("education"),
    projectName: $("projectName"),
    projectTech: $("projectTech"),
    projectPurpose: $("projectPurpose"),
    projectDescription: $("projectDescription"),
    jobDescription: $("jobDescription"),
    generateObjectiveBtn: $("generateObjectiveBtn"),
    generateProjectBtn: $("generateProjectBtn"),
    addProjectBtn: $("addProjectBtn"),
    clearProjectBtn: $("clearProjectBtn"),
    analyzeAtsBtn: $("analyzeAtsBtn"),
    statusObjective: $("statusObjective"),
    statusProject: $("statusProject"),
    statusATS: $("statusATS"),
    atsScore: $("atsScore"),
    matchedKeywords: $("matchedKeywords"),
    missingKeywords: $("missingKeywords"),
    atsSuggestion: $("atsSuggestion"),
    savedProjectsList: $("savedProjectsList"),
    previewName: $("previewName"),
    previewRole: $("previewRole"),
    previewContact: $("previewContact"),
    previewAddress: $("previewAddress"),
    previewObjective: $("previewObjective"),
    previewSkills: $("previewSkills"),
    previewProjects: $("previewProjects"),
    previewExperience: $("previewExperience"),
    previewCertifications: $("previewCertifications"),
    previewEducation: $("previewEducation"),
  };

  const projects = [];
  let editingIndex = -1;

  function splitByCommaOrLine(text) {
    return String(text || "")
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function splitBullets(text) {
    return String(text || "")
      .split("\n")
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);
  }

  function setStatus(target, message, isError = false) {
    if (!target) return;
    target.textContent = message;
    target.style.color = isError ? "#a12626" : "#4b4b4b";
    window.setTimeout(() => {
      if (target.textContent === message) {
        target.textContent = "";
      }
    }, 2500);
  }

  function typeText(element, text, speed = 16) {
    return new Promise((resolve) => {
      if (!element) {
        resolve();
        return;
      }

      const value = String(text || "");
      element.textContent = "";
      element.classList.add("typing-cursor");
      let i = 0;

      const timer = window.setInterval(() => {
        element.textContent += value.charAt(i);
        i += 1;

        if (i >= value.length) {
          window.clearInterval(timer);
          element.classList.remove("typing-cursor");
          resolve();
        }
      }, speed);
    });
  }

  function typeIntoTextarea(element, text, speed = 8) {
    return new Promise((resolve) => {
      if (!element) {
        resolve();
        return;
      }

      const value = String(text || "");
      element.value = "";
      let i = 0;
      const timer = window.setInterval(() => {
        element.value += value.charAt(i);
        i += 1;

        if (i >= value.length) {
          window.clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  }

  function updatePreview() {
    if (!els.previewName) return;

    els.previewName.textContent = els.fullName.value.trim() || "Your Name";
    els.previewRole.textContent = els.targetRole.value.trim() || "Target Role";

    const contactParts = [
      els.phone.value.trim(),
      els.email.value.trim(),
      els.linkedin.value.trim(),
      els.github.value.trim(),
    ].filter(Boolean);

    els.previewContact.textContent =
      contactParts.join(" | ") || "Phone | Email | LinkedIn | GitHub";

    els.previewAddress.innerHTML = formatText(els.address.value.trim());

    els.previewObjective.innerHTML = formatText(
      els.objective.value.trim() || "Your summary will appear here."
    );

    const skillItems = splitByCommaOrLine(els.skills.value);
    els.previewSkills.textContent =
      skillItems.join(", ") || "Your skills will appear here.";

    els.previewExperience.innerHTML = formatText(
      els.experience.value.trim() || "Your experience will appear here."
    );

    const certItems = splitByCommaOrLine(els.certifications.value);
    els.previewCertifications.textContent =
      certItems.join(", ") || "Your certifications will appear here.";

    els.previewEducation.innerHTML = formatText(
      els.education.value.trim() || "Your education will appear here."
    );
  }

  function renderKeywordPills(container, items) {
    if (!container) return;
    container.innerHTML = "";
    if (!items || !items.length) {
      container.textContent = "—";
      return;
    }

    items.forEach((item) => {
      const span = document.createElement("span");
      span.className = "keyword-pill";
      span.textContent = item;
      container.appendChild(span);
    });
  }

  function renderProjectsStatic() {
    if (!els.previewProjects) return;
    els.previewProjects.innerHTML = "";

    if (!projects.length) {
      els.previewProjects.innerHTML =
        '<div class="empty-note">Add your projects to show them here.</div>';
      return;
    }

    projects.forEach((project) => {
      const wrapper = document.createElement("div");
      wrapper.className = "project-block";

      const title = document.createElement("div");
      title.className = "project-title";
      title.textContent = project.tech
        ? `${project.name} | ${project.tech}`
        : project.name;

      wrapper.appendChild(title);

      const ul = document.createElement("ul");
      ul.className = "list-clean";

      project.bullets.forEach((bullet) => {
        const li = document.createElement("li");
        li.textContent = bullet;
        ul.appendChild(li);
      });

      wrapper.appendChild(ul);
      els.previewProjects.appendChild(wrapper);
    });
  }

  async function renderProjectsWithTyping() {
    if (!els.previewProjects) return;
    els.previewProjects.innerHTML = "";

    if (!projects.length) {
      const empty = document.createElement("div");
      empty.className = "empty-note";
      empty.textContent = "Add your projects to show them here.";
      els.previewProjects.appendChild(empty);
      return;
    }

    for (const project of projects) {
      const wrapper = document.createElement("div");
      wrapper.className = "project-block";

      const title = document.createElement("div");
      title.className = "project-title";
      title.textContent = project.tech
        ? `${project.name} | ${project.tech}`
        : project.name;
      wrapper.appendChild(title);

      const ul = document.createElement("ul");
      ul.className = "list-clean";
      wrapper.appendChild(ul);
      els.previewProjects.appendChild(wrapper);

      for (const bullet of project.bullets) {
        const li = document.createElement("li");
        ul.appendChild(li);
        await typeText(li, bullet, 10);
      }
    }
  }

  function renderSavedProjectsList() {
    if (!els.savedProjectsList) return;
    els.savedProjectsList.innerHTML = "";

    if (!projects.length) {
      els.savedProjectsList.innerHTML =
        '<div class="empty-note">No projects added yet.</div>';
      return;
    }

    projects.forEach((project, index) => {
      const item = document.createElement("div");
      item.className = "saved-project-item";

      const title = document.createElement("div");
      title.className = "saved-project-title";
      title.textContent = project.name;
      item.appendChild(title);

      const meta = document.createElement("div");
      meta.className = "saved-project-meta";
      meta.textContent = project.tech || "No tech stack entered";
      item.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "saved-project-actions";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "edit-btn";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => {
        els.projectName.value = project.name;
        els.projectTech.value = project.tech;
        els.projectPurpose.value = "";
        els.projectDescription.value = project.bullets.join("\n");
        editingIndex = index;
        setStatus(els.statusProject, "Editing project...");
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        projects.splice(index, 1);
        if (editingIndex === index) {
          editingIndex = -1;
        } else if (editingIndex > index) {
          editingIndex -= 1;
        }
        renderSavedProjectsList();
        renderProjectsStatic();
        setStatus(els.statusProject, "Project deleted.");
      });

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      item.appendChild(actions);
      els.savedProjectsList.appendChild(item);
    });
  }

  async function generateObjective() {
    setStatus(els.statusObjective, "Generating summary...");
    try {
      const response = await fetch("/api/generate-objective", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_role: els.targetRole.value,
          skills: els.skills.value,
          education: els.education.value,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to generate summary.");
      }

      els.objective.value = data.result;
      await typeText(els.previewObjective, data.result, 14);
      setStatus(els.statusObjective, "Summary generated.");
    } catch (error) {
      setStatus(els.statusObjective, error.message, true);
    }
  }

  async function generateProjectDescription() {
    setStatus(els.statusProject, "Generating project bullets...");
    try {
      const response = await fetch("/api/generate-project-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: els.projectName.value,
          tech_stack: els.projectTech.value,
          project_purpose: els.projectPurpose.value,
          target_role: els.targetRole.value,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to generate project description.");
      }

      await typeIntoTextarea(els.projectDescription, data.result, 7);
      setStatus(els.statusProject, "Project bullets generated.");
    } catch (error) {
      setStatus(els.statusProject, error.message, true);
    }
  }

  async function addProject() {
    const name = els.projectName.value.trim();
    const tech = els.projectTech.value.trim();
    const bullets = splitBullets(els.projectDescription.value);

    if (!name || !bullets.length) {
      setStatus(
        els.statusProject,
        "Enter project name and bullet points first.",
        true
      );
      return;
    }

    if (editingIndex === -1) {
      const duplicate = projects.some(
        (project) => project.name.toLowerCase() === name.toLowerCase()
      );

      if (duplicate) {
        setStatus(
          els.statusProject,
          "Project with same name already exists.",
          true
        );
        return;
      }

      projects.push({ name, tech, bullets });
      setStatus(els.statusProject, "Project added.");
    } else {
      const duplicate = projects.some(
        (project, index) =>
          index !== editingIndex &&
          project.name.toLowerCase() === name.toLowerCase()
      );

      if (duplicate) {
        setStatus(
          els.statusProject,
          "Project with same name already exists.",
          true
        );
        return;
      }

      projects[editingIndex] = { name, tech, bullets };
      editingIndex = -1;
      setStatus(els.statusProject, "Project updated.");
    }

    renderSavedProjectsList();
    await renderProjectsWithTyping();
    clearProjectFields(false);
  }

  function clearProjectFields(showMessage = true) {
    els.projectName.value = "";
    els.projectTech.value = "";
    els.projectPurpose.value = "";
    els.projectDescription.value = "";
    editingIndex = -1;
    if (showMessage) {
      setStatus(els.statusProject, "Project fields cleared.");
    }
  }

  async function analyzeATS() {
    setStatus(els.statusATS, "Analyzing ATS match...");
    try {
      const response = await fetch("/api/analyze-ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: $("resumeTextSource").innerText,
          job_description: els.jobDescription.value,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to analyze ATS.");
      }

      els.atsScore.textContent = `${data.score}%`;
      renderKeywordPills(els.matchedKeywords, data.matched_keywords || []);
      renderKeywordPills(els.missingKeywords, data.missing_keywords || []);
      els.atsSuggestion.textContent = data.suggestion || "";
      setStatus(els.statusATS, "ATS analysis complete.");
    } catch (error) {
      setStatus(els.statusATS, error.message, true);
    }
  }

  function printResumeOnly() {
    const resumeElement = $("resumeTextSource");
    if (!resumeElement) return;

    const resumeHtml = resumeElement.outerHTML;
    const printWindow = window.open("", "_blank", "width=900,height=1200");
    if (!printWindow) {
      setStatus(els.statusATS, "Allow popups to download PDF.", true);
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Resume</title>
  <style>
    body { margin: 0; background: white; font-family: Arial, Helvetica, sans-serif; color: #111; }
    .resume-sheet { max-width: 850px; margin: 0 auto; padding: 36px 40px; }
    .resume-header { border-bottom: 2px solid #202020; padding-bottom: 12px; text-align: center; }
    .resume-header h1 { margin: 0; font-size: 32px; }
    .resume-header h2 { margin: 6px 0; font-size: 18px; }
    .resume-header p { margin: 0; line-height: 1.5; color: #444; }
    .preview-address { margin-top: 4px !important; color: #555; }
    .resume-section { margin-top: 18px; }
    .resume-section h3 { font-size: 15px; text-transform: uppercase; border-bottom: 1px solid #d7d7d7; padding-bottom: 6px; margin: 0 0 10px; }
    .project-block { margin-bottom: 16px; }
    .project-title { font-weight: 700; margin-bottom: 6px; }
    .list-clean { padding-left: 18px; margin: 0; }
    .list-clean li { margin-bottom: 5px; line-height: 1.5; }
    p { margin: 0; line-height: 1.55; white-space: pre-wrap; }
    .empty-note { display: none; }
    @page { margin: 14mm; }
  </style>
</head>
<body>
${resumeHtml}
<script>
window.onload = () => {
  window.print();
  window.onafterprint = () => window.close();
};
<\/script>
</body>
</html>`);
    printWindow.document.close();
  }

  [
    els.fullName,
    els.targetRole,
    els.address,
    els.phone,
    els.email,
    els.linkedin,
    els.github,
    els.skills,
    els.objective,
    els.experience,
    els.certifications,
    els.education,
  ].forEach((input) => {
    if (input) {
      input.addEventListener("input", updatePreview);
    }
  });

  if (els.generateObjectiveBtn)
    els.generateObjectiveBtn.addEventListener("click", generateObjective);
  if (els.generateProjectBtn)
    els.generateProjectBtn.addEventListener("click", generateProjectDescription);
  if (els.addProjectBtn)
    els.addProjectBtn.addEventListener("click", addProject);
  if (els.clearProjectBtn)
    els.clearProjectBtn.addEventListener("click", () =>
      clearProjectFields(true)
    );
  if (els.analyzeAtsBtn)
    els.analyzeAtsBtn.addEventListener("click", analyzeATS);

  const pdfBtn = document.querySelector(".pdf-btn");
  if (pdfBtn) {
    pdfBtn.addEventListener("click", printResumeOnly);
  }

  updatePreview();
  renderSavedProjectsList();
  renderProjectsStatic();
  renderKeywordPills(els.matchedKeywords, []);
  renderKeywordPills(els.missingKeywords, []);
});
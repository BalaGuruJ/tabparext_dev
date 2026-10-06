# tabPagExt Project Instructions

## 1. Project Identity & Purpose
- **Project Name:** `tabPagExt`
- **Purpose:** Tableau Dashboard Extension / future pagination-report extension prototype.

## 2. Architectural Boundaries
- **Runtime Source:** Only `src/` and `extension/`.
- **Development-Only Tooling:** Under `dev/` and `.gemini/` (`.gemini/commands/` and `.gemini/skills/`).
- **Environment State:** `.env` (strictly environment-specific, never committed or exposed).
- **Independence:** Runtime code must **never** depend on `dev/`, `.gemini/`, Gemini CLI, Gemini skills, Gemini commands, or development governance artifacts. Conversely, development governance must never reside in `src/`.

## 3. Technology Stack & Dependencies
- **Development Server:** Python's built-in `http.server` (lightweight Python-first approach).
- **Node/npm:** Intentionally excluded unless explicitly authorized in future phases.
- **Dependencies:** Keep dependencies minimal; do not add unapproved Python packages or virtual environments to runtime code.

## 4. Engineering & Governance Rules
- **No Unfounded Assumptions:** Do not invent architecture or requirements. Prefer investigation before implementation when behavior or requirements are uncertain.
- **Narrow Scoping:** Keep changes narrowly scoped to the requested task. Do not modify unrelated files or perform unrequested refactoring.
- **Evidence-Based:** Distinguish facts from assumptions. Do not manufacture defects.
- **Validation:** Validate changes thoroughly after implementation.
- **Git Operations:** Human review is required before commit. **Do not** create automatic `git push` automation or perform pushes.

## 5. Status Notice
*Note: This `GEMINI.md` file provides project-level development guidance for Gemini CLI and is strictly development tooling. It is NOT part of the Tableau extension runtime.*

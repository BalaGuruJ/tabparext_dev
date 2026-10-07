# tabPagExt Development & Governance

This document outlines the strict architectural separation between runtime/production-candidate source code and development-only tooling for the `tabPagExt` project.

## Directory Structure & Purpose

- **`.gemini/`**: Official Gemini CLI project-discoverable configuration.
  - `.gemini/commands/`: Custom Gemini CLI custom commands and workflows (`/investigate`, `/validate`, `/task`).
  - `.gemini/skills/`: Project-local Agent Skills (`tabpagext-investigation`, `tabpagext-validation`).
- **`dev/`**: Supporting development artifacts, governance, and validation scripts.
  - `dev/governance/`: Development-phase governance rules, architecture decisions, and lifecycle policies.
  - `dev/validation/`: Pure validation and test scripts to verify runtime implementation.
  - `dev/scripts/`: Developer utilities and helper scripts (excluding git push automation).
  - `dev/investigations/`: Evidence reports, analysis artifacts, and research.

## Directory Separation

### 1. RUNTIME / PRODUCTION-CANDIDATE SOURCE
- **`extension/`**: Contains Tableau extension manifest files (e.g., `pagination.trex`).
- **`src/`**: Contains static web extension assets (`index.html`, `app.js`, `styles.css`).
- *Constraint*: This code must remain lightweight, framework/dependency independent, and must **never** import, execute, read, or depend on anything inside `dev/`, `.gemini/`, or Gemini CLI tooling.

### 2. DEVELOPMENT-ONLY TOOLING AND GOVERNANCE (`dev/` & `.gemini/`)
- *Constraint*: Both `dev/` and `.gemini/` are source-controlled and committed to Git, but their contents are strictly decoupled from the runtime extension.

### 3. ENVIRONMENT ONLY
- **`.env`**: Environment-specific configuration and secrets (ignored by Git).
- **`.env.example`**: Template for environment configuration (tracked in Git).

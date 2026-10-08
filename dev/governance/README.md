# tabPagExt Governance Model

## Core Principles
1. **Separation of Concerns:** Runtime/source code (`src/`, `extension/`) and development tooling (`dev/`) are strictly separated. Runtime code must never depend on Gemini CLI or governance artifacts.
2. **Read-Only Investigation:** Investigation tasks are strictly read-only. Facts must be distinguished from assumptions without modifying code or governance files.
3. **Read-Only Validation:** Validation tasks inspect project state and report PASS/FAIL without modifying runtime implementation or configuration.
4. **Narrow Scoping:** Implementation tasks are strictly bounded in scope and file targets. Unrelated refactoring is prohibited.
5. **Evidence-Based Quality:** No defect may be invented or assumed without empirical evidence.
6. **No Unrequested Cleanup:** Do not perform cleanup outside the bounds of the active task.
7. **Environment Isolation:** Environment state (`.env`) remains outside Git; only `.env.example` is source-controlled.
8. **Human-Controlled Git Operations:** Git push and commit are always deliberate human actions. Automated git push tools are strictly prohibited.
9. **Version-Controlled Governance:** Project development rules, commands, and skills reside in `dev/` and are tracked in Git.
10. **Runtime Independence:** The Tableau extension runtime remains framework-independent and lightweight.

## Development Lifecycle
```
INVESTIGATE
    ->
IMPLEMENT
    ->
VALIDATE
    ->
HUMAN REVIEW
    ->
COMMIT/PUSH
```

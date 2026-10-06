# tabpagext-closure Skill

## Purpose

Provides the mandatory governed phase-closure workflow for `tabPagExt`.

Phase closure is a human-gated governance operation. A phase must not be
considered closed merely because implementation is complete, validation
passes, or the probing session finishes.

Closure requires:
- independent validation with `PASS`;
- closure-record placeholder creation;
- exactly 3 human-knowledge probing rounds;
- evidence recording;
- explicit human acceptance.

## Lifecycle Steps

1. **Validation Check**
   - Confirm that independent validation for the specified phase reports
     `PASS`.
   - If validation is not `PASS`, stop the closure workflow.

2. **Placeholder Creation**
   - Identify the canonical phase closure artifact.
   - Create or update the closure-record placeholder before any probing begins.
   - The placeholder must indicate that closure review is in progress.
   - Do not mark the phase `CLOSED` at this stage.

3. **Three-Round Human-Knowledge Probing Session**

   Conduct exactly 3 rounds.

   **Round 1 — Objective, Scope & Boundaries**
   - Test the human's understanding of the phase objective, scope,
     deliverables, and explicit boundaries.

   **Round 2 — Evidence, Validation & Acceptance**
   - Test the human's understanding of the evidence produced, validation
     results, acceptance criteria, and known findings.

   **Round 3 — Architecture, Non-Goals & Readiness**
   - Test the human's understanding of architectural boundaries,
     non-goals, unresolved items, and why the phase is or is not ready
     to close.

   Each round requires an actual human response.

4. **Evidence Recording**
   - Record the human's responses and closure rationale in the closure
     artifact.
   - Preserve independent validation evidence.
   - Preserve relevant findings, deviations, and outstanding issues.
   - Never fabricate, infer, or substitute human responses.

5. **Human Gate & Acceptance**
   - After all 3 rounds are completed, explicitly request human acceptance.
   - Validation `PASS` does not equal human acceptance.
   - Completion of the probing rounds does not equal human acceptance.
   - Do not infer acceptance from silence or continuation.

6. **Phase Closure**
   - Only after explicit human acceptance may the closure artifact be
     updated to `CLOSED`.
   - If acceptance is not given, leave the phase open and record the
     appropriate pending state.

## Strict Constraints

- **Explicit Human Gate:** Gemini must never mark a phase `CLOSED`
  autonomously.
- **Three Rounds Mandatory:** The probing session must contain exactly
  3 rounds — no fewer and no additional rounds.
- **Placeholder First:** The closure placeholder must exist before
  probing begins.
- **Validation Gate:** Closure cannot begin when independent validation
  is not `PASS`.
- **Evidence Integrity:** Do not delete, conceal, fabricate, or rewrite
  prior validation evidence merely to achieve closure.
- **Non-Interference:** Do not modify runtime application code
  (`src/`, `extension/`) or unrelated pre-existing files.
- **Governance Scope:** Do not implement future-phase functionality as
  part of closure.
- **No Git Automation:** Do not commit or push changes.
- **No Self-Approval:** Gemini implementation or validation completion
  must never be treated as human acceptance.
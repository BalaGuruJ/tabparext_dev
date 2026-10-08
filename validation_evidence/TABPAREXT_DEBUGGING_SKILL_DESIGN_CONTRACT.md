# TABPAREXT Debugging Skill — Design & Contract

## Purpose
Create a reusable Gemini CLI skill for evidence-driven TABPAREXT runtime debugging across:
Google Cloud Shell → runtime/test scripts → local validation server → human validation → Windows/Tableau Desktop → Tableau Extensions API → TWB/XML parsed/reference representation.

The skill is a supporting investigation capability, not a general repository debugging agent.

## Phase 03 Context
Phase 03 establishes correspondence between:
- Tableau Extensions API runtime representation
- TWB/XML design-time representation

Correspondence areas:
Dashboard; Dashboard size; Dashboard objects/zones; Worksheet name; Worksheet ID;
Datasource identity; Logical tables; Physical connections; Field definitions;
Calculated status; Calculation formula; Field instance/shelf token; Worksheet shelves;
Evaluated table schema; Evaluated table data; Parameters; Filters; Runtime filter values;
Marks/encodings; Selected/highlighted marks.

Rules:
- runtime-only information must not be invented in TWB
- design-time-only information must not be assumed available from the API
- partial correspondence remains partial
- unresolved correspondence remains unresolved
- no heuristic identity equivalence

Important unresolved questions:
- Q1: Can runtime DataTable.columns[].fieldId be reliably correlated with the relevant TWB/XML column-instance binding?
- Q2: Can dashboard.objects[].id be reliably correlated with TWB zone identity?

The skill investigates these through evidence and must not manufacture answers.

## Evidence Model
Primary evidence:
1. validation_evidence/activity.log
2. validation_evidence/phase03_evidence.json
3. TWB/XML parsed evidence when explicitly provided/available
4. runtime/test-script state
5. human Windows/Tableau observations
6. test results

activity.log is an append-oriented activity/audit history with stable structure and evolving contents.
phase03_evidence.json is a dynamic runtime snapshot for a validation/capture round.
The human owns validation evidence. The skill reads evidence and must not fabricate or silently alter it.

## Required Capabilities

### Evidence Triage
Identify available, missing, sufficient, contradictory, or insufficient evidence.

### Runtime Diagnosis
Classify the likely boundary:
raw runtime code; runtime/test script; local HTTP/server; browser/extension;
Tableau Desktop; Tableau Extensions API; TWB/XML parser/reference interpretation;
validation procedure; evidence collection; unknown.
Do not prematurely assign root cause.

### Controlled Reproduction
When evidence is insufficient, propose the smallest useful human-controlled Tableau test and wait for the human result.

### Before/After Comparison
Compare validation rounds and identify changed, unchanged, expected, unexpected, and missing changes.

### TWB/XML ↔ Extensions API Correspondence Analysis
Compare runtime evidence against TWB/XML evidence.
Classify correspondence as:
CONFIRMED, STRONG, PARTIAL, UNRESOLVED, CONTRADICTED, INSUFFICIENT EVIDENCE.
Names alone must not establish identity equivalence.

### Mapping Impact Analysis
When evidence challenges a Phase 03 mapping, identify the affected concept/row,
current assumption, challenging evidence, proposed classification, confidence,
and additional evidence required. Recommend changes; do not silently apply them.

### Raw-Code Impact Analysis
Identify potentially affected source files/functions, current assumptions,
proposed behavior, whether code change is actually required, and recommended tests.
Code changes require a separate explicit implementation task.

### Test-Gap Detection
Identify conclusions lacking a proving test and recommend the smallest additional test.

### Regression Detection
Identify regressions using before/after evidence.

### Root Cause vs Symptom
Explicitly distinguish:
SYMPTOM, EVIDENCE, HYPOTHESIS, ROOT CAUSE, CONFIRMED FACT.
Never label a hypothesis as root cause.

### No-Code-Change Conclusion
The skill may conclude that no raw-code change is recommended.

### Backtracking Timeline
When evidence permits:
baseline → code/test change → validation round → observation → hypothesis → controlled test → new evidence → conclusion.

### Debugging Summary
Include issue/symptom, evidence reviewed, reproduction, human observations,
environment classification, root-cause status, mapping impact, mapping recommendation,
raw-code impact, test recommendation, confidence, remaining uncertainty,
and recommended next action.

## Recommendation Contract
When a mapping issue is detected, provide:

**Mapping Recommendation**
- affected mapping concept/row
- current classification
- proposed classification
- evidence
- confidence
- reason

**Raw-Code Recommendation**
- affected script(s)
- affected behavior
- current assumption
- proposed change
- tests required
- whether an implementation task is recommended

**Test Recommendation**
- smallest test needed to confirm the proposal

Recommendations never automatically become code changes.

## Human Governance
Required loop:
Evidence → investigation → recommendation → human review → explicit implementation task if needed
→ implementation → unit/regression tests → Windows/Tableau validation → new evidence
→ correspondence re-check → human acceptance.

If human validation is required, stop and request the test/observation.

## Access Boundary
Allowed read:
- src/
- validation/
- validation_evidence/

Allowed write:
- raw runtime/test-script areas only when a future explicit implementation task authorizes modification.

validation_evidence/ is read-only input.

Do not access or mutate:
- dev/
- dev/references/
- fixtures/
- governance
- contracts
- design documents
- .gemini/commands/
- .gemini/skills/
- unrelated project files

The skill must not modify governance, contracts, design, fixtures, references, or other skills,
and must not become a general repository debugging agent.

## Relationship to Phase 03
The skill is not part of the frozen Phase 03 design/contract.
It is a supporting investigation capability.

If it identifies a possible mapping problem:
1. report evidence
2. recommend mapping change
3. identify potential raw-code impact
4. recommend tests
5. wait for human decision

It must not automatically rewrite the frozen Phase 03 design/contract.

## Validation Evidence Placeholders
Expected inputs:
- validation_evidence/activity.log
- validation_evidence/phase03_evidence.json

Do not fabricate runtime evidence. The human manually supplies real Windows/Tableau validation contents.

## Implementation Target
Create:
`.gemini/skills/tabpagext-debugging/SKILL.md`

Follow existing TABPAREXT Gemini CLI conventions and naming style.
Inspect existing relevant skills and GEMINI.md before implementation, but do not modify existing governance files.
Do not create an agent unless repository conventions demonstrate that a skill cannot satisfy the purpose.

## Acceptance Criteria
- requested skill exists at the specified path
- access boundary is preserved
- no general repository debugging scope
- evidence is distinguished from inference
- TWB/XML ↔ Extensions API correspondence analysis is included
- mapping recommendations are included
- raw-code impact recommendations are included
- test recommendations are included
- human-validation gates are included
- automatic mapping/design/contract changes are prohibited
- raw-code changes require a separate explicit implementation task
- validation evidence is read-only
- no unrelated files are modified

Do not commit or push as part of this task.

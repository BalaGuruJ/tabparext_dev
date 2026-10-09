# tabpagext-debugging Skill

## Purpose

Provides an evidence-driven debugging and backtracking protocol for the
TABPAREXT repository.

The primary purpose is to determine whether observed Tableau runtime behavior
is consistent with the TWB/XML parsed representation, identify the affected
Phase 03 correspondence mapping when it is not, and recommend the smallest
mapping, code, and test changes required to resolve the finding.

This skill is a supporting investigation capability, not a general repository
debugging agent.

---

## Scope & Access Boundary

### Allowed Read

- `src/`
- `validation/`
- `validation_evidence/`

`validation_evidence/` is read-only human-provided evidence.

### Allowed Write

Executing `python3 dev/scripts/inspect_twb_canonical.py` (which refreshes `dev/validation/phase03_canonical_inspection.json` and regenerates `validation_evidence/PHASE_03_CORRESPONDENCE_REPORT.md` with a 22-row, 3-column table) is integrated into `/tabPagExt_debug`.
Only raw runtime/test-script areas may be modified when a separate, explicit implementation task authorizes the modification.

### Strictly Prohibited

Do NOT modify:

- `dev/`
- `dev/references/`
- `fixtures/`
- governance files
- contracts
- design documents
- `.gemini/commands/`
- `.gemini/skills/`
- unrelated project files

Do NOT automatically modify:

- mappings
- design
- contracts
- source code
- validation evidence

---

## Core Debugging Principle

Always separate:

1. **Observation**
2. **Evidence**
3. **Hypothesis**
4. **Correspondence finding**
5. **Recommendation**
6. **Human decision**
7. **Implementation**
8. **Validation**

Never convert an observation directly into a code change.

---

## Phase 03 Correspondence Context

Phase 03 establishes correspondence between:

- Tableau Extensions API runtime representation
- TWB/XML design-time representation

Canonical TWB evidence is treated as a first-class correspondence evidence layer, explicitly incorporating:
- `dev/validation/phase03_canonical_inspection.json`
- `validation_evidence/PHASE_03_CORRESPONDENCE_REPORT.md`

### Six Canonical Structures
Investigations must recognize and evaluate the six canonical metadata structures:
1. **Worksheets** (explicit name and UUID provenance)
2. **Datasources** (canonical name, caption, version)
3. **Tables / Relations** (logical objects and table relations)
4. **Fields** (282 canonical fields with datatype, role, type, hidden status, default aggregation, and worksheets)
5. **Metadata Columns** (metadata-record elements)
6. **Column-Instances** (1074 worksheet-scoped aggregation/derivation tokens)

Relevant correspondence areas include:

- Dashboard
- Dashboard size
- Dashboard objects/zones
- Worksheet name
- Worksheet ID
- Datasource identity
- Logical tables
- Physical connections
- Field definitions
- Calculated status
- Calculation formula
- Field instance / shelf token
- Worksheet shelves
- Evaluated table schema
- Evaluated table data
- Parameters
- Filters
- Runtime filter values
- Marks / encodings
- Selected/highlighted marks

### Evidence Progression
Correspondence evaluation must follow and enforce the strict evidence progression:
`SOURCE EXISTS → STRUCTURAL SIMILARITY → SEMANTIC CORRESPONDENCE → IDENTITY CORRESPONDENCE → CONFIRMED`

### Anti-Heuristic Rules & Classification Constraints
- Runtime-only information must not be invented in TWB/XML.
- Design-time-only information must not be assumed available from the API.
- Partial correspondence must remain partial.
- Unresolved correspondence must remain unresolved.
- **Do not treat matching names, IDs, UUIDs, counts, positions, or the mere coexistence of runtime and canonical records as proof of identity or correspondence.**
- **DIRECT classification requires explicit supporting evidence.**
- No heuristic identity mapping may be invented.

### Important unresolved questions

**Q1**

Can runtime `DataTable.columns[].fieldId` be reliably correlated with the
relevant TWB/XML `column-instance` binding? *(Preserved as unresolved unless empirical evidence proves otherwise.)*

**Q2**

Can `dashboard.objects[].id` be reliably correlated with TWB zone identity? *(Preserved as unresolved unless empirical evidence proves otherwise.)*

The skill must investigate these questions through evidence and controlled
validation. It must not manufacture an answer.

---

## Evidence Sources

Use available evidence from:

1. `validation_evidence/activity.log`
2. `validation_evidence/phase03_evidence.json`
3. `dev/validation/phase03_canonical_inspection.json` (First-class canonical TWB evidence layer)
4. `validation_evidence/PHASE_03_CORRESPONDENCE_REPORT.md` (Authoritative correspondence audit report)
5. TWB/XML parsed evidence when explicitly available
6. runtime/test-script state
7. human Windows/Tableau Desktop observations
8. unit/regression test results
9. previous validation-round evidence when available

### Evidence handling

`activity.log` is an activity/audit history.

`phase03_evidence.json` is a runtime evidence snapshot and may represent
the latest validation round.

The human owns validation evidence.

The skill must:

- read evidence
- identify missing evidence
- identify contradictory evidence
- never fabricate evidence
- never silently alter evidence

---

# Debugging Workflow

## 0. Initial Execution Sequence (Report & Canonical Refresh)

Upon invoking `/tabPagExt_debug`:
1. Execute `python3 dev/scripts/inspect_twb_canonical.py`.
2. This parses `dev/fixtures/twb_fixture.twb` into `dev/validation/phase03_canonical_inspection.json`.
3. It regenerates `validation_evidence/PHASE_03_CORRESPONDENCE_REPORT.md` from canonical JSON plus runtime JSON (`validation_evidence/phase03_evidence.json`), overwriting Section 3 with an exact 22-row, 3-column comparison table.
4. Read and evaluate the refreshed JSON evidence and Markdown report before proceeding to analysis.

## 1. Establish the Symptom

Record:

- expected behavior
- observed behavior
- when it occurred
- validation environment
- relevant code/test state

Do not assign root cause yet.

---

## 2. Triage Evidence

Determine:

- evidence available
- evidence missing
- evidence sufficient
- evidence contradictory
- evidence requiring human validation

If evidence is insufficient, do not guess.

---

## 3. Identify the Suspected Boundary

Consider:

- raw runtime code
- runtime/test script
- local HTTP/server
- browser/extension
- Tableau Desktop
- Tableau Extensions API
- TWB/XML parsing/reference interpretation
- validation procedure
- evidence collection
- unknown

Do not prematurely classify the root cause.

---

## 4. Build the Smallest Reproduction

When required, propose the smallest controlled test.

Example:

1. capture baseline
2. change one Tableau worksheet property
3. capture again
4. compare runtime evidence
5. compare against TWB/XML
6. ask the human to report the observed Tableau behavior

Stop and wait for the human result when human validation is required.

---

## 5. Compare Evidence

Perform before/after comparison where multiple rounds exist.

Identify:

- changed values
- unchanged values
- expected changes
- unexpected changes
- missing expected changes

---

# TWB/XML ↔ Tableau API Correspondence Investigation

This is the primary analytical function of the skill.

For each relevant mapping:

1. identify the current mapping assumption
2. obtain the runtime evidence
3. obtain the TWB/XML evidence
4. compare the representations
5. determine whether the observed behavior supports the mapping
6. identify contradictions or gaps
7. determine whether additional human testing is required

Use only these correspondence statuses:

- `CONFIRMED`
- `STRONG`
- `PARTIAL`
- `DERIVED`
- `DESIGN_TIME_ONLY`
- `UNRESOLVED`
- `CONTRADICTED`
- `INSUFFICIENT EVIDENCE`

**Anti-Heuristic Rule:**
- Do not treat matching names, IDs, UUIDs, counts, positions, or the mere coexistence of runtime and canonical records as proof of correspondence.
- `DIRECT` classification requires explicit supporting evidence following the evidence progression (`SOURCE EXISTS → STRUCTURAL SIMILARITY → SEMANTIC CORRESPONDENCE → IDENTITY CORRESPONDENCE → CONFIRMED`).

---

# Mapping Impact Analysis

If evidence challenges an existing Phase 03 mapping, produce a:

## Mapping Recommendation

Include:

- affected mapping concept/row
- current classification
- observed evidence
- why the evidence challenges the mapping
- proposed classification
- confidence
- remaining uncertainty
- additional validation required

Example outcome:

```text
Current:
fieldId ↔ TWB column-instance = DIRECT

Finding:
Controlled validation does not establish reliable identity equivalence.

Recommendation:
fieldId ↔ TWB column-instance = UNRESOLVED

Reason:
Runtime fieldId changes/behaves independently of the tested TWB identity.

Confidence:
Medium

Additional test:
Perform controlled shelf movement and capture both representations.
```

The skill recommends the mapping change.

It does NOT change the mapping itself.

---

# Raw-Code Impact Analysis

After identifying a mapping finding, determine whether the current
implementation depends on the affected assumption.

Produce:

## Raw-Code Recommendation

Include:

- affected source file(s)
- affected function(s), if identifiable
- current implementation assumption
- observed consequence
- proposed implementation behavior
- whether code modification is actually required
- recommended unit/regression tests
- whether a separate implementation task should be created

The skill must explicitly allow:

> **No raw-code change recommended.**

A mapping clarification does not automatically imply a source-code defect.

---

# Test Recommendation

For every unresolved or proposed correction, recommend the smallest
test capable of confirming the conclusion.

Prefer controlled Tableau tests where runtime behavior is involved.

Example:

```text
Baseline capture
→ move Product from Rows to Columns
→ capture
→ compare fieldId
→ compare TWB column-instance
→ report human observation
```

Do not request broad exploratory testing when one controlled test is sufficient.

---

# Regression Detection

When previous evidence exists:

- compare previous and current behavior
- identify newly broken behavior
- identify preserved behavior
- determine whether the change is related to the current investigation

Do not call something a regression without supporting evidence.

---

# Root Cause Discipline

Always distinguish:

- `SYMPTOM`
- `EVIDENCE`
- `HYPOTHESIS`
- `ROOT CAUSE`
- `CONFIRMED FACT`

A hypothesis must never be presented as a confirmed root cause.

---

# Environment Diagnosis

When appropriate, determine whether the issue is more likely associated with:

- Cloud Shell
- local HTTP server
- extension runtime
- browser
- Tableau Desktop
- Tableau Extensions API
- TWB/XML parser
- validation procedure
- evidence collection
- source code

Environment differences must be considered before recommending source-code changes.

---

# Backtracking

When sufficient evidence exists, reconstruct:

```text
baseline
→ code/test change
→ validation round
→ observed behavior
→ hypothesis
→ controlled test
→ new evidence
→ correspondence finding
→ recommendation
→ human decision
```

Use evidence timestamps/activity history when available.

---

# Human Validation Gate

The human is the final validation authority.

Required loop:

```text
Evidence
→ Investigation
→ Mapping/Code/Test Recommendation
→ Human Review
→ Explicit Implementation Task if required
→ Implementation
→ Unit/Regression Tests
→ Windows/Tableau Validation
→ New Evidence
→ Correspondence Re-check
→ Human Acceptance
```

If additional Tableau testing is required:

1. provide the smallest controlled test
2. clearly state what observation is required
3. stop
4. wait for the human result

Do not assume the result.

---

# Recommendation Contract

Every meaningful debugging conclusion should contain:

## Finding

What was observed and what evidence supports it.

## Mapping Recommendation

- affected mapping
- current classification
- proposed classification
- evidence
- confidence
- reason

## Raw-Code Recommendation

- affected script(s)
- affected behavior
- current assumption
- proposed change
- tests
- implementation-task recommendation

## Test Recommendation

Smallest test required to confirm the conclusion.

## Status

One of:

- Confirmed
- Partially confirmed
- Unresolved
- Contradicted
- Insufficient evidence
- No code change recommended

---

# Final Debugging Summary

When an investigation reaches a stopping point, produce:

- Issue / symptom
- Evidence reviewed
- Human observations
- Environment classification
- Reproduction performed
- Correspondence finding
- Mapping impact
- Mapping recommendation
- Raw-code impact
- Raw-code recommendation
- Test recommendation
- Root-cause status
- Confidence
- Remaining uncertainty
- Recommended next action

Do not claim closure when required human validation has not occurred.

---

# Governance Rule

This skill investigates and recommends.

It does not autonomously:

- change mappings
- rewrite Phase 03 design
- rewrite contracts
- modify governance
- modify validation evidence
- modify unrelated files
- implement raw-code fixes without an explicit implementation task

The debugging skill's job is to make the next human/implementation decision
**better informed by evidence**.

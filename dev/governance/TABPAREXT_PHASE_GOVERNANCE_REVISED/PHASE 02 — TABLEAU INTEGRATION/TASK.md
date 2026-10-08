# TABPAREXT — PHASE 02 TASK

## Tableau Integration & Data Access

**Phase:** 02 — Tableau Integration & Data  
**Lifecycle:** TASK DEFINITION  
**Status:** Ready for Human Review  
**Source of Truth:** Phase 02 `DESIGN.md` and `PHASE_CONTRACT.md`

---

## Purpose

Define the controlled implementation sequence for establishing the verified Tableau
Extensions API runtime and data-access boundary.

Phase 02 must be implemented incrementally.

Each milestone requires implementation and validation before the next milestone is
authorized.

---

## Task Sequence

### Task 02.01 — Tableau Extensions API Initialization

Establish the smallest verified Tableau runtime connection.

Scope:

- load the required Tableau Extensions API;
- call `tableau.extensions.initializeAsync()`;
- report initialization success/failure visibly;
- verify behavior inside Tableau Desktop.

Out of scope:

- worksheet discovery;
- data extraction;
- mock data architecture;
- report-engine integration.

**Gate:** Successful independent Tableau Desktop runtime validation.

---

### Task 02.02 — Dashboard & Worksheet Discovery

After Task 02.01 passes, investigate and implement:

- active dashboard access;
- `dashboard.worksheets`;
- worksheet enumeration;
- worksheet identity/name information;
- verified worksheet selection behavior.

Do not assume worksheet behavior from TWB evidence alone.

**Gate:** Independent Tableau Desktop runtime validation.

---

### Task 02.03 — Worksheet Data Retrieval

After Task 02.02 passes, investigate and implement the first verified worksheet
data-access mechanism.

Initial candidate:

```text
worksheet.getSummaryDataAsync()
```

Determine through Tableau Desktop runtime evidence:

- returned columns;
- field metadata;
- data types;
- values;
- null handling;
- row/volume behavior;
- relevant runtime limitations;
- error behavior.

Do not assume summary data is equivalent to all underlying Tableau data.

**Gate:** Independent runtime validation.

---

### Task 02.04 — Canonical Runtime Data Boundary

After Task 02.03 passes, define and implement the minimal Tableau-independent
representation required by later TABPAREXT report processing.

The representation should preserve verified information such as:

- worksheet identity;
- field identity;
- field/display information where available;
- data type;
- values;
- null values;
- relevant provenance/context.

Tableau API objects must not cross into the later report engine.

**Gate:** Independent validation.

---

### Task 02.05 — Standalone Development Support

Only if demonstrated to be useful during Tasks 02.01–02.04, evaluate whether an
explicit standalone/mock provider is required.

If implemented:

- it must remain clearly separate from live Tableau runtime;
- it must use deterministic test data;
- TWB-derived fixture data may be used for testing;
- mock behavior must never be treated as Tableau runtime evidence.

This task is optional and evidence-driven.

---

## Governance Boundaries

All implementation must remain consistent with the Phase 02
`DESIGN.md` and `PHASE_CONTRACT.md`.

Do not:

- implement pagination;
- implement grouping or LOD calculations;
- implement subtotals/grand totals;
- implement report designer functionality;
- implement PDF generation;
- introduce production deployment architecture;
- promote unverified Tableau capabilities to guaranteed capabilities.

Additional dependencies or Node/npm tooling are neither required nor prohibited.
Any such requirement must be justified by implementation evidence and reviewed
before adoption.

---

## Repository Boundaries

Runtime implementation belongs under the repository's established runtime
locations, including:

```text
src/
extension/
```

Development governance artifacts remain under the established governance
locations.

Do not modify unrelated repository areas.

---

## Execution Rule

Only one Phase 02 task may be actively implemented at a time.

The sequence is:

```text
02.01
  ↓
Independent Validation
  ↓
Human Review
  ↓
02.02
  ↓
Independent Validation
  ↓
Human Review
  ↓
02.03
  ↓
...
```

A later task must not be implemented merely because the previous task's code
exists. Its preceding validation/review gate must be satisfied.

---

## Git Boundary

Implementation tasks must not:

- commit changes;
- push changes;
- rewrite unrelated history;
- discard unrelated work.

Git operations remain human-controlled under the repository's Git governance
skill.

---

## Phase Closure

Completion of the task sequence does not automatically close Phase 02.

Phase closure requires:

- independent validation;
- completion of required review artifacts;
- documented runtime evidence;
- human review;
- explicit human acceptance;
- formal Phase 02 closure.
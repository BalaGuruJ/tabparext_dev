# TASK: Phase 03 — TWB ↔ Extensions API Correspondence Foundation

**Project:** `tabPagExt` / `tabparext_dev`  
**Phase:** 03  
**Source of Truth:** Phase 03 `DESIGN.md` and `PHASE_CONTRACT.md`

---

## 1. Objective

Establish the controlled correspondence foundation between:

```text
Tableau .twb design-time structure
              ↕
Phase 03 correspondence model
              ↕
Tableau Extensions API runtime objects
```

The implementation must validate the correspondence defined by the frozen Phase 03 Design and Contract using the controlled workbook target.

No new architectural decisions may be introduced.

---

## 2. Controlled Validation Target

Use only:

```text
TWB fixture:
dev/fixtures/twb_fixture.twb

Dashboard:
validation

Worksheet:
test_worksheet
```

The TWB fixture is authoritative for controlled design-time structure.

Live Tableau Desktop is authoritative for runtime evidence.

---

## 3. Required Correspondence Coverage

The correspondence foundation must cover the entities defined by the frozen Design/Contract:

- Dashboard
- Dashboard Objects / Zones
- Worksheet
- Datasource Identity
- Datasource Extract
- Logical Tables
- Physical Connections
- Field Definitions
- Calculated Field Status
- Calculation Formula boundary
- Field Instance / Shelf Token boundary
- Worksheet Shelves
- Evaluated Table Schema
- Evaluated Table Data
- Parameters
- Declarative Filters
- Filter Runtime Values
- Mark / Encoding Definition
- Selected Marks
- Highlighted Marks

Every correspondence must retain its contractual classification:

```text
DIRECT
DERIVED
PARTIAL
RUNTIME_ONLY
DESIGN_TIME_ONLY
NO_EQUIVALENT
UNKNOWN
```

Do not change classifications without explicit human approval.

---

## 4. Evidence Requirements

Establish the correspondence through two distinct evidence sources.

### 4.1 Design-Time Evidence

Inspect:

```text
dev/fixtures/twb_fixture.twb
```

Capture only the TWB structures required by the frozen correspondence matrix.

### 4.2 Runtime Evidence

Capture the relevant Extensions API values from the live Tableau Desktop session using:

```text
Dashboard: validation
Worksheet: test_worksheet
```

Runtime evidence must remain distinguishable from TWB evidence.

The Python local server is only an asset-serving mechanism and must not be treated as runtime evidence.

---

## 5. Mandatory Boundary Preservation

The implementation must preserve all frozen architectural boundaries.

### TWB vs Runtime

Do not treat static TWB structure as live runtime state or data.

### Logical vs Physical

Keep:

```text
getLogicalTablesAsync()
```

separate from:

```text
getConnectionSummariesAsync()
```

### Calculated Status vs Formula

Runtime calculated-field status may be captured through:

```text
Field.isCalculatedField
Field.columnType
```

Calculation formulas remain design-time TWB information.

Do not reconstruct or execute formulas.

### Field Definition vs Field Instance

Do not treat:

```text
DataTable.Column
```

as a direct equivalent of a TWB:

```text
column-instance
```

### Evaluated Data

Do not represent evaluated runtime data as TWB fixture data.

---

## 6. Q1 and Q2 — Evidence Only, No Resolution

### Q1 — Field-to-Instance Binding

Capture the actual runtime representation of:

```text
DataTable.columns[].fieldId
```

where required for evidence.

The task must **not** create or apply a heuristic to bind runtime columns to TWB `column-instance` tokens.

### Q2 — Dashboard Layout Equivalence

Capture relevant dashboard-object evidence where required.

The task must **not** establish pixel-level or other complex layout equivalence.

Q1 and Q2 remain unresolved architectural questions unless explicitly changed through a future human-approved design revision.

---

## 7. Implementation Constraints

Use the **smallest implementation necessary** to establish the required evidence and correspondence.

Before adding new runtime infrastructure, inspect existing project capabilities and reuse them where appropriate.

Any implementation must:

- preserve the existing runtime architecture,
- keep Tableau API objects outside the canonical plain-JavaScript boundary,
- keep validation/evidence tooling separate from runtime architecture,
- avoid unnecessary parser infrastructure,
- avoid unnecessary dependencies.

---

## 8. Explicit Prohibited Scope

Do not:

- build a generic TWB parser,
- build a complete Tableau semantic graph,
- build report designer UI,
- implement grouping,
- implement LOD logic,
- implement subtotals or grand totals,
- implement pagination,
- implement page templates,
- implement PDF rendering,
- implement final visual reconstruction,
- mutate Tableau workbooks,
- execute or reconstruct Tableau/DAX/M/workbook formulas,
- treat TWB fixtures as evaluated runtime data,
- resolve Q1 or Q2 through unapproved heuristics,
- implement the Debugging / Environment-Gap Skill backlog item.

---

## 9. Required Deliverables

Produce only the artifacts necessary to demonstrate the Phase 03 correspondence foundation.

At minimum:

1. **Runtime/design-time evidence capture mechanism**, if existing project capabilities are insufficient.
2. **Correspondence validation/mapping output** showing the relationship between the controlled TWB structure and live API evidence.
3. **Evidence summary** identifying:
   - confirmed correspondences,
   - derived/partial correspondences,
   - runtime-only information,
   - design-time-only information,
   - unknowns/gaps.
4. Explicit recording of the observed runtime values relevant to:
   - `DataTable.columns[].fieldId`
   - `DashboardObject.id`

Do not create additional governance documents unless required by the existing project conventions.

---

## 10. Validation Chain

The implementation must support this evidence chain:

```text
Controlled TWB fixture
        ↓
Static XML inspection
        ↓
Live Tableau Desktop / Extensions API capture
        ↓
Correspondence comparison
        ↓
Classification
        ↓
Human review
```

The evidence must clearly identify which observations came from the TWB and which came from live Tableau Desktop.

---

## 11. Acceptance Criteria

The task is complete only when:

1. All required correspondence entities are addressed.
2. The contractual classification is preserved for every correspondence.
3. Static TWB evidence and runtime API evidence are clearly separated.
4. Dashboard `validation` and worksheet `test_worksheet` are used as the controlled validation target.
5. Runtime evidence is obtained from Tableau Desktop where required.
6. `getLogicalTablesAsync()` and `getConnectionSummariesAsync()` remain correctly separated.
7. Calculated-field status and calculation formula remain correctly separated.
8. Field definitions and field instances remain correctly separated.
9. Evaluated runtime data is not represented as TWB data.
10. The actual runtime observations for `DataTable.columns[].fieldId` and `DashboardObject.id` are recorded.
11. Q1 and Q2 remain unresolved; no unapproved heuristic or layout-equivalence rule is introduced.
12. No prohibited Phase 03 scope is implemented.
13. The resulting evidence is sufficient for independent human review against the frozen Design and Contract.

---

## 12. Human Validation Gate

Implementation is **not considered accepted** when the artifacts are merely generated.

The human reviewer must inspect the evidence and determine:

- whether the correspondence matches the frozen matrix,
- whether runtime and TWB evidence are correctly separated,
- whether classifications are justified,
- whether Q1/Q2 were kept unresolved,
- whether the implementation remained within contract.

Only after explicit human acceptance may Phase 03 proceed to its next governance step.

---

## 13. Backlog Boundary

The following remains outside this task:

**Debugging / Environment-Gap Custom Skill**

Purpose:

```text
Cloud Shell
    ↓
Human validation
    ↓
Windows + Tableau Desktop
```

The future skill will assist with debugging, issue summarization, environment-difference analysis, and backtracking.

It will have read/write access only to raw runtime and test-script areas.

It is **not to be implemented or modified by this task**.

---

## 14. Completion Rule

Do not commit or push as part of this task.

After implementation and validation, report:

1. files created/modified,
2. correspondence evidence produced,
3. runtime observations,
4. unresolved Q1/Q2 status,
5. validation results,
6. any deviations from the frozen Design/Contract.

Stop for human review.
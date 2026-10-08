# PHASE 03 — REPORT DESIGNER: PHASE CONTRACT

**Project:** `tabPagExt` / `tabpagext_dev`  
**Phase:** 03  
**Contract Status:** FROZEN — SUBJECT TO HUMAN ACCEPTANCE  
**Design Authority:** Phase 03 `DESIGN.md`

---

## 1. Purpose

Phase 03 establishes a controlled **correspondence model** between Tableau workbook (`.twb`) design-time structures and live Tableau Extensions API runtime objects.

The correspondence foundation is intended to support later:

- report configuration,
- analytics,
- grouping,
- pagination,
- rendering.

Phase 03 does **not** establish that TWB and Extensions API representations are identical.

---

## 2. Authority and Boundaries

### 2.1 Runtime Authority

Live Tableau Desktop execution through the Tableau Extensions API is authoritative for:

- runtime behavior,
- runtime object values,
- evaluated runtime state,
- evaluated worksheet data.

### 2.2 Design-Time Authority

The `.twb` workbook structure is authoritative for:

- static workbook structure,
- design-time declarations,
- worksheet configuration,
- datasource declarations,
- calculation definitions,
- view/encoding structures.

### 2.3 Correspondence Boundary

The Phase 03 model must explicitly distinguish:

- design-time information,
- runtime information,
- derived correspondence,
- unresolved correspondence.

No one-to-one equivalence may be assumed unless explicitly classified as `DIRECT`.

---

## 3. Controlled Validation Target

The Phase 03 controlled target is:

```text
Dashboard: validation
Worksheet: test_worksheet
Fixture: dev/fixtures/twb_fixture.twb
```

The fixture is authoritative for the controlled **design-time** comparison.

Live Tableau Desktop remains authoritative for runtime evidence.

---

# 4. Correspondence Classification

All Phase 03 correspondence must use one of the following classifications.

| Classification | Contract Meaning |
|---|---|
| **DIRECT** | Clear correspondence exists between API and TWB constructs/properties. |
| **DERIVED** | Correspondence requires computation, traversal, normalization, or transformation. |
| **PARTIAL** | Semantics overlap but one representation contains information unavailable in the other. |
| **RUNTIME_ONLY** | Information exists only during live Tableau execution. |
| **DESIGN_TIME_ONLY** | Information exists in the TWB but is not exposed by the Extensions API. |
| **NO_EQUIVALENT** | No counterpart exists in the other representation. |
| **UNKNOWN** | Available evidence is insufficient to establish correspondence safely. |

These classifications are contractual and must not be silently converted into equality.

---

# 5. Authoritative Correspondence Matrix

The following matrix is contractually authoritative for Phase 03.

| Domain / Entity | Extensions API Construct | TWB / XML Construct | Classification |
|---|---|---|---|
| Dashboard | `dashboard.name` | `/workbook/dashboards/dashboard/@name` | **DIRECT** |
| Dashboard Size | `dashboard.size` | `/workbook/dashboards/dashboard/size` (`@maxwidth`, `@maxheight`) | **DIRECT** |
| Dashboard Objects / Zones | `dashboard.objects[]` — `id`, `name`, `type`, `position`, `size`, `isFloating`, `isVisible` | `/workbook/dashboards/dashboard/zones//zone` — `@id`, `@name`, `@type-v2`, `@x`, `@y`, `@w`, `@h` | **DERIVED** |
| Worksheet Name | `worksheet.name` | `/workbook/worksheets/worksheet/@name` | **DIRECT** |
| Worksheet ID | API internal/session worksheet ID | `/workbook/worksheets/worksheet/simple-id/@uuid` | **PARTIAL** |
| Datasource Identity | `dataSource.name`, `dataSource.id` | `/workbook/datasources/datasource/@caption`, `/workbook/datasources/datasource/@name` | **DIRECT** |
| Datasource Extract | `dataSource.isExtract` | datasource extract/connection declarations and Hyper connection information | **DERIVED** |
| Logical Tables | `dataSource.getLogicalTablesAsync()` → `LogicalTable {id, caption}` | `/workbook/datasources/datasource/connection/objects/object` — `@id`, `@caption` | **DIRECT** |
| Physical Connections | `dataSource.getConnectionSummariesAsync()` → `ConnectionSummary[]` | `/workbook/datasources/datasource/connection/named-connections/named-connection/connection` | **DERIVED** |
| Field Definition | `dataSource.fields[]` / `Field` — `id`, `name`, `dataType`, `role`, `description`, `semanticRole`, etc. | datasource columns and worksheet datasource-dependency columns | **DIRECT** |
| Calculated Field Status | `Field.isCalculatedField`, `Field.columnType` | `<column><calculation ... /></column>` | **DIRECT** |
| Calculation Formula | No Extensions API formula property established | `<column>/<calculation ...>` including formula | **DESIGN_TIME_ONLY** |
| Field Instance / Shelf Token | No first-class `FieldInstance` class established in the bundled API | worksheet `datasource-dependencies/column-instance` — `@column`, `@derivation`, `@name`, `@type` | **DESIGN_TIME_ONLY** |
| Worksheet Shelves | `worksheet.getSummaryColumnsInfoAsync()` / summary projection metadata | worksheet `table/rows`, `table/cols` and related view structures | **PARTIAL** |
| Evaluated Table Schema | `DataTable.columns[]` — `fieldName`, `fieldId`, `dataType`, `index`, `isReferenced` | Derived from worksheet column instances, rows, cols, panes and encodings | **DERIVED** |
| Evaluated Table Data | `DataTable.data` | No TWB equivalent | **RUNTIME_ONLY** |
| Parameters | `dashboard.getParametersAsync()` → `Parameter[]` | parameter definitions / parameter-related datasource declarations | **PARTIAL** |
| Declarative Filters | `worksheet.getFiltersAsync()` → `Filter[]` | worksheet view filter/slice structures | **PARTIAL** |
| Filter Runtime Values | categorical filter applied values / selection state | No equivalent for current live user state | **RUNTIME_ONLY** |
| Mark / Encoding Definition | `worksheet.getVisualSpecificationAsync()` where available | worksheet panes / mark / encoding structures | **PARTIAL** |
| Selected Marks | `worksheet.getSelectedMarksAsync()` | No TWB equivalent | **RUNTIME_ONLY** |
| Highlighted Marks | `worksheet.getHighlightedMarksAsync()` | No TWB equivalent | **RUNTIME_ONLY** |

The matrix above must remain aligned with the frozen Phase 03 Design.

---

# 6. Mandatory Architectural Distinctions

## 6.1 Logical Tables vs Physical Connections

The following are separate concepts:

```text
Logical model
    getLogicalTablesAsync()
        ↕
    TWB connection/objects/object

Physical connection
    getConnectionSummariesAsync()
        ↕
    TWB named-connections/connection
```

`getLogicalTablesAsync()` must not be treated as a connection-summary operation.

---

## 6.2 Calculated Status vs Formula

The Extensions API may expose calculated-field status:

```text
Field.isCalculatedField
Field.columnType
```

The calculation formula remains a design-time TWB concern.

Phase 03 must not reconstruct, execute, or infer a runtime formula from the Extensions API.

---

## 6.3 Field Definition vs Field Instance

A base field and its worksheet/shelf usage are distinct concepts.

TWB `column-instance` structures must not be assumed to be directly equivalent to summary `DataTable.Column` objects.

---

## 6.4 Evaluated Data

The TWB is a structural/design-time artifact.

Evaluated worksheet data belongs to the live runtime:

```text
TWB
  → static/design-time structure

Extensions API
  → live runtime metadata/state/data
```

A TWB fixture must never be treated as a replacement for live evaluated data.

---

# 7. Runtime Evidence Boundary

The following are explicitly **runtime-unverified** until validated in Tableau Desktop:

### Q1 — `DataTable.columns[].fieldId`

Determine the actual runtime representation for `test_worksheet`.

In particular, establish whether a value such as:

```text
[Sales Amount]
```

or:

```text
[sum:Sales Amount:qk]
```

or another representation is returned.

No deterministic field-to-instance heuristic may be frozen before this evidence exists.

### Q2 — `DashboardObject.id`

Determine the runtime representation of the dashboard object ID corresponding to fixture zone `3`.

No assumption may be made regarding string/number representation until runtime evidence is captured.

---

# 8. Dashboard Layout Boundary

TWB dashboard zones use a normalized coordinate representation, while Extensions API dashboard objects expose runtime position and size.

Phase 03 therefore does **not** establish pixel-level layout equivalence.

The initial structural correspondence may consider:

- zone identity,
- parent/child hierarchy,
- worksheet membership,
- ordering/topology.

Pixel-level equivalence remains deferred unless a later report-layout requirement establishes a need for it.

---

# 9. Validation Contract

The Phase 03 validation chain is:

```text
TWB fixture
    ↓
Static XML inspection
    ↓
Live Tableau Desktop / Extensions API capture
    ↓
Correspondence comparison
    ↓
Evidence classification
```

Runtime evidence must originate from the live Tableau Desktop session.

The Python local server is an **asset-serving mechanism only**. It is not authoritative runtime evidence.

Validation tooling must remain separate from the runtime architecture.

---

# 10. Contract Acceptance Criteria

Phase 03 satisfies this contract only when:

1. The correspondence model covers all entities defined in the authoritative matrix.
2. Each correspondence retains its assigned classification.
3. Static TWB evidence is distinguishable from live runtime evidence.
4. The controlled target remains:
   - Dashboard `validation`
   - Worksheet `test_worksheet`
5. Runtime evidence is captured from Tableau Desktop where runtime behavior is required.
6. Q1 and Q2 remain explicitly unresolved until their required runtime evidence is obtained.
7. Any discovered correspondence gap or unknown is explicitly documented rather than inferred.
8. Logical-table and physical-connection semantics remain separate.
9. Calculated-field status and calculation formula remain separate.
10. Field definitions and field instances remain separate.
11. Evaluated runtime data is never represented as TWB fixture data.
12. No prohibited Phase 03 scope is introduced.

---

# 11. Prohibited Scope

Phase 03 must not:

- build a generic TWB parser,
- construct a complete Tableau semantic graph,
- execute Tableau/DAX/M/workbook formulas,
- reconstruct calculation formulas through unsupported runtime inference,
- assume API/TWB equality for `DERIVED` or `PARTIAL` mappings,
- implement report configuration UI,
- implement grouping,
- implement LOD logic,
- implement subtotals/grand totals,
- implement pagination,
- implement page templates,
- implement PDF rendering,
- implement pixel-perfect dashboard recreation,
- mutate Tableau workbooks,
- treat TWB fixtures as evaluated runtime data,
- introduce production deployment work.

---

# 12. Backlog — Debugging / Environment-Gap Skill

The following is a **backlog item only** and is excluded from the Phase 03 contract scope.

### Objective

Create a custom Gemini CLI skill for future debugging and issue backtracking across:

```text
Google Cloud Shell
        ↓
Human validation gate
        ↓
Windows + Tableau Desktop
```

The skill should assist with:

- runtime issue summarization,
- environment-vs-code-vs-Tableau diagnosis,
- preservation of debugging evidence,
- reproduction-context summaries,
- later backtracking of discrepancies between Cloud Shell and local validation.

### Access Boundary

The future skill must have **read/write access only to raw runtime and test-script areas**.

It must not modify:

- phase design documents,
- phase contracts,
- governance documents,
- governance configuration,
- unrelated documentation,
- reference repositories,
- unrelated project files.

This backlog item must not be implemented as part of the Phase 03 contract.

---

# 13. Contract Status

**STATUS: READY FOR HUMAN ACCEPTANCE**

This contract is derived from the frozen Phase 03 Design.

The Design remains the architectural source of truth.

This Contract converts that Design into binding Phase 03 scope, boundaries, validation requirements, acceptance criteria, and prohibited scope.

No Phase 03 implementation task may begin until this Contract receives explicit human acceptance.

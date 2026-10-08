# TABPAREXT — Phase 03 Design
## Tableau TWB ↔ Extensions API Correspondence & Equivalence Foundation

**Lifecycle:** DESIGN — READY FOR HUMAN REVIEW  
**Project:** `tabPagExt` / `tabparext_dev`  
**Phase:** 03  
**Authoritative runtime:** Tableau Desktop + Tableau Extensions API  
**Authoritative design-time reference:** `.twb` workbook structure  
**Validation fixture:** `dev/fixtures/twb_fixture.twb`  
**Validation target:** Dashboard `validation` / Worksheet `test_worksheet`

---

## 1. Purpose

Phase 03 establishes a controlled **correspondence model** between Tableau workbook (`.twb`) design-time structures and the live Tableau Extensions API runtime objects.

The purpose is **not** to prove that TWB and the Extensions API are identical representations.

The purpose is to establish, for each relevant Tableau construct:

- what exists in the TWB,
- what exists in the Extensions API,
- how the two can be related,
- what information is derived or transformed,
- what exists only at runtime,
- what exists only at design time,
- and what cannot currently be mapped with sufficient evidence.

This correspondence foundation will support later report configuration, analytics, grouping, pagination, and rendering work.

---

## 2. Architectural Principle

The correspondence model is:

```text
              DESIGN TIME
              Tableau .twb
                   │
                   │ correspondence
                   ▼
        ┌─────────────────────────┐
        │  Phase 03 Mapping Model │
        │                         │
        │ DIRECT                  │
        │ DERIVED                 │
        │ PARTIAL                 │
        │ RUNTIME_ONLY            │
        │ DESIGN_TIME_ONLY        │
        │ NO_EQUIVALENT            │
        │ UNKNOWN                 │
        └─────────────────────────┘
                   ▲
                   │ correspondence
                   │
              LIVE RUNTIME
       Tableau Extensions API
```

The model must not assume that every TWB construct has an API equivalent, or that every API runtime object has a TWB equivalent.

---

## 3. Authority and Evidence Rules

### 3.1 Runtime authority

Live Tableau Desktop execution through the Extensions API is authoritative for runtime behavior and runtime object values.

### 3.2 Design-time authority

The `.twb` is authoritative for static workbook structure and declarations.

### 3.3 Fixture

The controlled Phase 03 fixture is:

```text
dev/fixtures/twb_fixture.twb
```

Target:

```text
Dashboard: validation
Worksheet: test_worksheet
```

The fixture is the design-time reference for controlled correspondence validation.

### 3.4 Reference repository

`dev/references/` contains TabParKnowledge material for reference only.

It is **not** authoritative Phase 03 runtime evidence and its workbooks must not be treated as Phase 03 fixtures.

---

## 4. Scope

### In scope

- Tableau dashboard correspondence
- Dashboard object / zone correspondence
- Worksheet correspondence
- Datasource correspondence
- Datasource logical-table correspondence
- Physical connection correspondence
- Field-definition correspondence
- Field-instance / shelf-token investigation
- Summary/evaluated table schema correspondence
- Evaluated runtime data distinction
- Parameter correspondence
- Filter correspondence
- Mark / encoding correspondence
- Selected/highlighted mark distinction
- Calculated-field status correspondence
- Calculation formula boundary
- Explicit classification of known and unresolved mappings

### Out of scope

- Full generic TWB parser
- Full workbook semantic-model reconstruction
- Report designer UI
- Report grouping implementation
- LOD implementation
- Subtotals / grand totals implementation
- Pagination implementation
- Page layout engine
- PDF generation
- Final visual reconstruction
- Production deployment
- Treating TWB fixtures as runtime data
- Executing Tableau formulas, DAX, M, or other workbook expressions

---

## 5. Correspondence Classification

| Classification | Meaning |
|---|---|
| **DIRECT** | A clear correspondence exists between the API construct/property and TWB construct/property. |
| **DERIVED** | Alignment requires computation, hierarchy traversal, normalization, or transformation. |
| **PARTIAL** | The two representations overlap but one exposes information absent from the other. |
| **RUNTIME_ONLY** | Information exists only in live Tableau execution and has no static TWB equivalent. |
| **DESIGN_TIME_ONLY** | Information exists in the TWB but is not exposed by the Extensions API. |
| **NO_EQUIVALENT** | A construct exists in one representation without a counterpart in the other. |
| **UNKNOWN** | Available evidence is insufficient to establish the correspondence safely. |

Classification is part of the architecture and must not be silently converted into equality.

---

# 6. Authoritative Correspondence Matrix

The following table is the Phase 03 baseline correspondence model.

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

---

## 7. Critical Architectural Distinctions

### 7.1 Logical tables are not physical connections

These are separate layers.

```text
Datasource
├── Logical model
│   └── getLogicalTablesAsync()
│       ↕
│       TWB connection/objects/object
│
└── Physical connection
    └── getConnectionSummariesAsync()
        ↕
        TWB named-connections/connection
```

`getLogicalTablesAsync()` must not be implemented or documented as a connection-summary operation.

---

### 7.2 Calculated-field status vs calculation formula

The Extensions API can expose that a field is calculated:

```text
Field.isCalculatedField
Field.columnType
```

However, the calculation formula itself is not established as an Extensions API property.

Therefore:

```text
Calculated status → API/runtime correspondence
Calculation formula → TWB/design-time information
```

The report engine must not depend on executing or reconstructing formulas from the runtime API.

---

### 7.3 Field definition vs field instance

A base field and its visualization/shelf usage are distinct concepts.

The TWB may contain worksheet `column-instance` structures such as aggregation/derivation tokens.

Phase 03 must not incorrectly treat a summary `DataTable.Column` as a direct equivalent of a TWB `column-instance`.

This is an explicit correspondence area requiring runtime evidence before deterministic binding rules are established.

---

### 7.4 Evaluated data is runtime data

The TWB describes workbook structure; it does not contain the evaluated worksheet result set.

Therefore:

```text
TWB → expected/static structure
Extensions API → live evaluated runtime state/data
```

A TWB fixture must never be used as a substitute for live runtime data.

---

## 8. Controlled Fixture Findings

Static inspection of the Phase 03 fixture established:

- `test_worksheet` defines **6 columns**.
- `test_worksheet` contains **6 column instances** under datasource dependencies.
- `test_worksheet` contains **4 slices**.
- `test_worksheet` contains **1 rows entry**: `[none:Product:nk]`.
- `test_worksheet` contains an empty `<cols>` structure.
- Dashboard `validation` contains **2 main zones** in the primary layout:
  - root zone `4` (`layout-basic`)
  - child worksheet zone `3` (`test_worksheet`).

The bundled Extensions API library also establishes:

- `getLogicalTablesAsync()` exists.
- `getConnectionSummariesAsync()` exists.
- `Field.isCalculatedField` exists.
- No `FieldInstance` class was found.
- No calculation-formula getter was found.

These are static/code inspection findings. They do not constitute live Desktop runtime verification.

---

## 9. Runtime Evidence Boundary

The following remain runtime-unverified and must not be represented as established facts until validated in Tableau Desktop:

### 9.1 `DataTable.columns[].fieldId`

The exact runtime value for `test_worksheet` must be established.

Specifically, determine whether it corresponds to:

```text
[Sales Amount]
```

or a worksheet instance/derivation token such as:

```text
[sum:Sales Amount:qk]
```

or another representation.

### 9.2 `DashboardObject.id`

The exact runtime representation of the dashboard object ID must be established.

In particular, determine whether fixture zone ID `3` is surfaced as a string, number, or another API representation.

---

# 10. Open Architectural Questions

Only the following questions remain open at this design stage.

## Q1 — Field-to-Instance Binding

How should runtime summary `DataTable.Column` objects be associated with TWB worksheet `column-instance` tokens?

Possible future strategies include:

- deterministic mapping through field ID plus aggregation/derivation metadata,
- base-field correspondence with separately modeled instance metadata,
- another evidence-supported mapping.

**No heuristic should be frozen until live runtime evidence establishes the actual API values.**

## Q2 — Dashboard Layout Equivalence

What level of layout equivalence is required?

TWB zone coordinates use a normalized workbook coordinate system, while Extensions API dashboard objects expose rendered/runtime position and size.

Phase 03 should initially treat:

```text
parent-child hierarchy
zone identity
worksheet membership
ordering/topology
```

as the more stable structural correspondence.

Pixel-level equivalence should remain a separate question unless later report-layout requirements demonstrate that it is necessary.

---

# 11. Phase 03 Design Boundary

Phase 03 establishes the **correspondence foundation**, not the final report model.

The future architecture may consume this foundation as:

```text
TWB / design-time structure
          │
          ▼
  Correspondence Model
          ▲
          │
Extensions API / runtime
          │
          ▼
 Canonical runtime data
          │
          ▼
 Future Report Engine
 ├── report configuration
 ├── grouping / analytics
 ├── pagination
 └── rendering
```

The correspondence layer must preserve the distinction between:

- design-time metadata,
- runtime metadata,
- evaluated runtime data,
- derived correspondence,
- unresolved correspondence.

---

# 12. Validation Strategy

Validation must use the same controlled workbook in Tableau Desktop.

Minimum validation chain:

```text
Phase 03 TWB fixture
        ↓
static XML inspection
        ↓
Extensions API runtime capture
        ↓
correspondence comparison
        ↓
evidence classification
```

Runtime evidence must be captured from the live Tableau Desktop session.

The Python local server only serves the extension assets; it is not itself authoritative evidence of browser-side Extensions API behavior.

Validation tooling/capture mechanisms must remain separate from the runtime architecture.

---

# 13. Future Implementation Guardrails

Any implementation derived from this design must:

1. Keep Tableau API objects outside the future canonical plain-JavaScript boundary.
2. Preserve raw runtime values without silently rewriting them into TWB semantics.
3. Treat DAX, M, Tableau formulas, and other expressions as opaque strings.
4. Never execute workbook expressions as part of metadata extraction.
5. Avoid generic TWB parser construction unless a later task explicitly establishes that requirement.
6. Avoid assuming API/TWB one-to-one equality where the matrix says DERIVED or PARTIAL.
7. Keep unresolved runtime questions explicitly unresolved until evidence is obtained.
8. Keep `dev/` and `.gemini/` tooling outside runtime dependencies.

---

# 14. Phase 03 Non-Goals

The following are explicitly deferred:

- Generic workbook parser
- Complete Tableau semantic graph
- Report configuration UI
- Grouping and aggregation engine
- LOD engine
- Subtotal/grand-total engine
- Pagination
- Page templates
- PDF rendering
- Pixel-perfect dashboard recreation
- Production packaging/deployment
- Automated mutation of Tableau workbooks
- Treating TWB data as evaluated runtime data

---

# 15. Backlog — Debugging / Environment-Gap Skill

Create a dedicated custom Gemini CLI skill for future debugging and issue backtracking across:

```text
Google Cloud Shell environment
        ↓
human validation gate
        ↓
Windows + Tableau Desktop environment
```

### Purpose

The skill should help:

- summarize runtime/debugging issues,
- distinguish likely environment differences from runtime-code issues,
- preserve evidence needed for later backtracking,
- summarize the known state and reproduction context,
- assist with debugging when Cloud Shell and local Tableau Desktop validation produce different observations.

### Access boundary

The debugging skill must have **read/write access only to raw runtime and test-script areas**.

It must not modify or govern:

- Phase design documents
- Phase contracts
- governance files
- `.gemini` governance configuration
- unrelated development documentation
- reference repositories
- fixtures unless explicitly included in the future task scope

This is a backlog item and is **not part of the current Phase 03 implementation scope**.

---

# 16. Design Status

**STATUS: READY FOR HUMAN REVIEW**

This document freezes the Phase 03 architectural correspondence baseline while explicitly retaining the two runtime questions above as unresolved.

No implementation task should be generated from this document until the human review gate is completed.

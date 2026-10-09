# Phase 03 Correspondence Reconciliation Report

## 1. Executive Summary
This report presents the reconciled Phase 03 correspondence model for `tabPagExt`, mapping Tableau workbook (`.twb`) design-time structures against live Tableau Extensions API runtime objects. 

In accordance with Phase 03 governance (`PHASE_CONTRACT.md` and `DESIGN.md`), this document evaluates all **22 authoritative correspondence rows**, preserving strict boundaries between static design-time XML metadata (`dev/validation/phase03_canonical_inspection.json`, derived from `dev/fixtures/twb_fixture.twb`) and live runtime API observations (`validation_evidence/phase03_evidence.json`).

---

## 2. Canonical Inspection & Evidence Metrics Overview
- **Design-Time TWB Source:** `dev/fixtures/twb_fixture.twb` (Dashboard: `validation`, Worksheet: `test_worksheet`)
- **Canonical Inspection Evidence:** `dev/validation/phase03_canonical_inspection.json` (90 worksheets, 2 datasources, 3 logical/physical relations, 282 canonical fields, 11 metadata records, 1074 column instances)
- **Runtime Evidence:** `validation_evidence/phase03_evidence.json` (Dashboard name `validation`, objects, worksheet `test_worksheet`, `dataTableColumns`, `summaryColumnsInfo`)

---

## 3. Authoritative Correspondence Matrix (22 Rows)

| Domain / Entity | Extensions API Construct | TWB / XML Construct | Contract Classification | Evidence Status & Limitations |
|---|---|---|---|---|
| **Dashboard** | `dashboard.name` | `/workbook/dashboards/dashboard/@name` | **DIRECT** | Evidenced by dashboard name `"validation"` in runtime evidence and TWB inspection. |
| **Dashboard Size** | `dashboard.size` | `/workbook/dashboards/dashboard/size` (`@maxwidth`, `@maxheight`) | **DIRECT** | Evidenced by TWB dashboard size configuration; runtime size object empty in current capture (`validation_evidence/phase03_evidence.json`). |
| **Dashboard Objects / Zones** | `dashboard.objects[]` — `id`, `name`, `type`, `position`, `size`, `isFloating`, `isVisible` | `/workbook/dashboards/dashboard/zones//zone` — `@id`, `@name`, `@type-v2`, `@x`, `@y`, `@w`, `@h` | **DERIVED** | Evidenced by runtime dashboard objects (zone 3 `test_worksheet`, zone 4 `Tiled`, zone 9 extension) mapped from TWB zones. Normalized coordinate translation required. |
| **Worksheet Name** | `worksheet.name` | `/workbook/worksheets/worksheet/@name` | **DIRECT** | Evidenced by worksheet name `"test_worksheet"` across runtime and TWB inspection (90 worksheets). |
| **Worksheet ID** | API internal/session worksheet ID | `/workbook/worksheets/worksheet/simple-id/@uuid` | **PARTIAL** | TWB supplies static UUID (`uuid` in canonical inspection); runtime API exposes session/internal worksheet ID. No direct cross-reference without session mapping. |
| **Datasource Identity** | `dataSource.name`, `dataSource.id` | `/workbook/datasources/datasource/@caption`, `/workbook/datasources/datasource/@name` | **DIRECT** | Evidenced by datasource captions and names (e.g., `federated.0yylszc1nyju5o130dues14408ct` vs `Retail Sales Data Extract`). |
| **Datasource Extract** | `dataSource.isExtract` | datasource extract/connection declarations and Hyper connection information | **DERIVED** | Derived from connection extract tags (`tables_relations` in TWB inspection). Runtime API `isExtract` property requires live execution check. |
| **Logical Tables** | `dataSource.getLogicalTablesAsync()` → `LogicalTable {id, caption}` | `/workbook/datasources/datasource/connection/objects/object` — `@id`, `@caption` | **DIRECT** | Evidenced in TWB connection objects (`tables_relations`). Runtime API method `getLogicalTablesAsync()` provides corresponding logical table metadata. |
| **Physical Connections** | `dataSource.getConnectionSummariesAsync()` → `ConnectionSummary[]` | `/workbook/datasources/datasource/connection/named-connections/named-connection/connection` | **DERIVED** | Derived from TWB named connections and Hyper connections. Separate from logical tables. |
| **Field Definition** | `dataSource.fields[]` / `Field` — `id`, `name`, `dataType`, `role`, `description`, `semanticRole`, etc. | datasource columns and worksheet datasource-dependency columns | **DIRECT** | Evidenced by 282 canonical fields in TWB inspection and runtime field objects. |
| **Calculated Field Status** | `Field.isCalculatedField`, `Field.columnType` | `<column><calculation ... /></column>` | **DIRECT** | Design-time TWB inspection identifies calculation elements under columns. Runtime API properties (`Field.isCalculatedField`) reflect calculated status when invoked live. |
| **Calculation Formula** | No Extensions API formula property established | `<column>/<calculation ...>` including formula | **DESIGN_TIME_ONLY** | Evidenced strictly in design-time TWB inspection XML calculation strings. Not exposed by the Extensions API; never reconstructed or executed at runtime. |
| **Field Instance / Shelf Token** | No first-class `FieldInstance` class established in the bundled API | worksheet `datasource-dependencies/column-instance` — `@column`, `@derivation`, `@name`, `@type` | **DESIGN_TIME_ONLY** | Evidenced by 1074 canonical TWB column instances capturing worksheet-scoped derivation/aggregation tokens. No first-class API class exists. |
| **Worksheet Shelves** | `worksheet.getSummaryColumnsInfoAsync()` / summary projection metadata | worksheet `table/rows`, `table/cols` and related view structures | **PARTIAL** | Evidenced by runtime `summaryColumnsInfo` (`phase03_evidence.json`) combined with static TWB `table/rows` and `table/cols` structures. |
| **Evaluated Table Schema** | `DataTable.columns[]` — `fieldName`, `fieldId`, `dataType`, `index`, `isReferenced` | Derived from worksheet column instances, rows, cols, panes and encodings | **DERIVED** | Evidenced by runtime `dataTableColumns` (`phase03_evidence.json`, e.g., `[federated...].[sum:Sales Amount:qk]`) derived from worksheet structure and summary projection. |
| **Evaluated Table Data** | `DataTable.data` | No TWB equivalent | **RUNTIME_ONLY** | Live evaluated runtime data rows/cells. Has no static TWB counterpart; TWB fixtures cannot supply evaluated runtime data. |
| **Parameters** | `dashboard.getParametersAsync()` → `Parameter[]` | parameter definitions / parameter-related datasource declarations | **PARTIAL** | TWB defines parameter datasource/columns; runtime API exposes parameters via `getParametersAsync()`. |
| **Declarative Filters** | `worksheet.getFiltersAsync()` → `Filter[]` | worksheet view filter/slice structures | **PARTIAL** | TWB defines view slices/filters; runtime API exposes active filters via `getFiltersAsync()`. |
| **Filter Runtime Values** | categorical filter applied values / selection state | No equivalent for current live user state | **RUNTIME_ONLY** | Live user interaction state and applied runtime filter values. Exists only during live runtime execution. |
| **Mark / Encoding Definition** | `worksheet.getVisualSpecificationAsync()` where available | worksheet panes / mark / encoding structures | **PARTIAL** | TWB mark/encoding structures overlap with runtime visual specifications where supported by API versions. |
| **Selected Marks** | `worksheet.getSelectedMarksAsync()` | No TWB equivalent | **RUNTIME_ONLY** | Live runtime user selection state. Exists only during execution; no static TWB equivalent. |
| **Highlighted Marks** | `worksheet.getHighlightedMarksAsync()` | No TWB equivalent | **RUNTIME_ONLY** | Live runtime user highlight state. Exists only during execution; no static TWB equivalent. |

---

## 4. Calculated Field Status & Formula Discussion
In accordance with Phase 03 governance requirements:
- **Design-Time Calculation Parsing:** Canonical TWB inspection (`phase03_canonical_inspection.json`) parses calculation definitions and formulas from static XML metadata (e.g., `<calculation ...>`).
- **Runtime API Evidence:** Runtime evidence (`phase03_evidence.json`) captures observed runtime field metadata (`dataTableColumns`, `summaryColumnsInfo`), such as `[federated.0yylszc1nyju5o130dues14408ct].[sum:Sales Amount:qk]`. 
- **Distinction Maintained:** Claims regarding `Field.isCalculatedField` and `Field.columnType` are recognized as API properties when executing live, but calculation formulas remain strictly restricted to design-time TWB inspection. No runtime formula execution, inference, or reconstruction is permitted.

---

## 5. Architectural Boundaries & Q1 / Q2 Status
1. **Logical vs. Physical Separation:** Maintained. Logical tables (`getLogicalTablesAsync()`) are strictly separated from physical connection summaries (`getConnectionSummariesAsync()`).
2. **Calculated Status vs. Formula:** Maintained. Calculated field status in runtime API vs. calculation formula in TWB design-time XML.
3. **Field Definition vs. Field Instance:** Maintained. Base datasource fields (282 canonical fields) are kept distinct from worksheet column instances (1074 column instances).
4. **Q1 (Field-to-Instance Binding):** **UNRESOLVED**. Canonical inspection provides design-time column instances and runtime evaluated columns, but no heuristic matching or programmatic binding between runtime `fieldId` (e.g., `[federated...].[sum:Sales Amount:qk]`) and static TWB column instances has been frozen or applied.
5. **Dashboard Layout Equivalence (Q2):** **UNRESOLVED**. Dashboard objects and zone metadata are captured, but pixel-level or coordinate normalization equivalence is deferred.

---

## 6. Evidence Limitations & Conclusion
- **Limitations:** TWB fixtures provide static structural blueprints (`validation`), while runtime evidence (`phase03_evidence.json`) provides live API capture for `test_worksheet`. Unimplemented or uncaptured API calls (such as parameters, filters, and marks) remain classified strictly according to the authoritative contract without unsupported emulation.
- **Conclusion:** The reconciled correspondence report successfully covers all 22 authoritative rows with exact contractual classifications, preserves all mandatory architectural boundaries, and retains Q1 and Q2 as unresolved.

# Phase 03 Correspondence Reconciliation Report

**Report Run ID:** `PH03-RUN-0015`
**Generated At:** `2026-10-10T07:32:56.695670+00:00`

## 1. Executive Summary
This report presents the reconciled Phase 03 correspondence model for `tabPagExt`, mapping Tableau workbook (`.twb`) design-time structures against live Tableau Extensions API runtime objects.

In accordance with Phase 03 governance (`PHASE_CONTRACT.md` and `DESIGN.md`), this document evaluates all **22 authoritative correspondence rows**, preserving strict boundaries between static design-time XML metadata (`dev/validation/phase03_canonical_inspection.json`, derived from `dev/fixtures/twb_fixture.twb`) and live runtime API observations (`validation_evidence/phase03_evidence.json`).

---

## 2. Canonical Inspection & Evidence Metrics Overview
- **Design-Time TWB Source:** `dev/fixtures/twb_fixture.twb` (Dashboard: `validation`, Worksheet: `test_worksheet`)
- **Canonical Inspection Evidence:** `dev/validation/phase03_canonical_inspection.json` (91 worksheets, 2 datasources, 3 logical/physical relations, 282 canonical fields, 11 metadata records, 1080 column instances)
- **Runtime Evidence:** `validation_evidence/phase03_evidence.json` (Dashboard name `validation`, objects, worksheet `test_worksheet`, `dataTableColumns`, `summaryColumnsInfo`)

---

## 3. Authoritative Correspondence Matrix (22 Rows)

| Correspondence Row | API Runtime JSON Value | TWB Canonical JSON Value |
|---|---|---|
| **Dashboard Name**<br>*(DIRECT — Matched)* | `dashboard.dashboardName` = "validation" | `structures.dashboards` (10 dashboards present; "validation" present) |
| **Dashboard Size**<br>*(DIRECT — Unpopulated in Runtime)* | `dashboard.dashboardSize` = {} | Missing in Canonical JSON |
| **Dashboard Objects / Zones**<br>*(DERIVED — UNRESOLVED Q2)* | `dashboard.objects` (3 objects: id 3 `test_worksheet` [worksheet], id 4 `Tiled` [blank], id 9 `Tableau Pagination Extension` [extension]) | Missing in Canonical JSON (UNRESOLVED Q2 — zone identity mapping deferred) |
| **Worksheet Name**<br>*(DIRECT — Runtime Worksheet Discovered)* | `worksheet.worksheetName` = "test_worksheet" | `structures.worksheets` (91 worksheets present; "test_worksheet" present) |
| **Worksheet ID**<br>*(PARTIAL — UNRESOLVED Q1)* | Missing in Runtime JSON (Runtime API session worksheet ID not captured) | `structures.worksheets[].uuid` (91 UUIDs present in canonical worksheets; UNRESOLVED Q1) |
| **Datasource Identity**<br>*(DIRECT — Matched Name / Caption)* | `dataTableColumns[0].fieldId` contains datasource ID `federated.0yylszc1nyju5o130dues14408ct` | `structures.datasources`: `Parameters` (caption: ""), `federated.0yylszc1nyju5o130dues14408ct` (caption: "Retail Sales Data Extract") |
| **Datasource Extract**<br>*(DERIVED — Unpopulated in Runtime)* | Missing in Runtime JSON (`dataSource.isExtract` property not captured) | `structures.tables_relations` (3 relation/extract connection declarations present) |
| **Logical Tables**<br>*(DIRECT — Unpopulated in Runtime)* | Missing in Runtime JSON (`getLogicalTablesAsync()` results not captured) | `structures.tables_relations` (3 logical object/relation nodes present) |
| **Physical Connections**<br>*(DERIVED — Unpopulated in Runtime)* | Missing in Runtime JSON (`getConnectionSummariesAsync()` results not captured) | `structures.tables_relations` (3 physical connection & extract declarations present) |
| **Field Definition**<br>*(DIRECT — Observed Field Schemas)* | `dataTableColumns`: `Product` (string), `SUM(Sales Amount)` (float) | `structures.fields` (282 canonical fields defined across datasources) |
| **Calculated Field Status**<br>*(DIRECT — Design-Time Parsing Only)* | Missing in Runtime JSON (`Field.isCalculatedField` property not captured) | `structures.fields` (`<calculation>` elements present under columns) |
| **Calculation Formula**<br>*(DESIGN_TIME_ONLY — No API Property)* | Not Exposed in Extensions API (DESIGN_TIME_ONLY) | `structures.fields[].calculation` (XML calculation strings present for 282 fields) |
| **Field Instance / Shelf Token**<br>*(DESIGN_TIME_ONLY — No API Property)* | Not Exposed in Extensions API (DESIGN_TIME_ONLY) | `structures.column_instances` (1080 column-instance derivation tokens present) |
| **Worksheet Shelves**<br>*(PARTIAL — Runtime Summary Info Present)* | `worksheet.summaryColumnsInfo`: `Product`, `SUM(Sales Amount)` | Missing in Canonical JSON (Worksheet shelf view structures not in canonical JSON) |
| **Evaluated Table Schema**<br>*(DERIVED — UNRESOLVED Q1)* | `worksheet.dataTableColumns`: `Product` [`[federated.0yylszc1nyju5o130dues14408ct].[none:Product:nk]`], `SUM(Sales Amount)` [`[federated.0yylszc1nyju5o130dues14408ct].[sum:Sales Amount:qk]`] | `structures.column_instances` (1080 column instances; UNRESOLVED Q1 — no heuristic binding to fieldId) |
| **Evaluated Table Data**<br>*(RUNTIME_ONLY — Live Runtime Data Present)* | `worksheet.totalRowCount` = 150 rows | No static TWB equivalent (RUNTIME_ONLY) |
| **Parameters**<br>*(PARTIAL — Unpopulated in Runtime)* | Missing in Runtime JSON (`getParametersAsync()` results not captured) | `structures.datasources`: `Parameters` datasource present |
| **Declarative Filters**<br>*(PARTIAL — Unpopulated in Runtime)* | Missing in Runtime JSON (`getFiltersAsync()` results not captured) | Missing in Canonical JSON |
| **Filter Runtime Values**<br>*(RUNTIME_ONLY — Unpopulated in Runtime)* | Missing in Runtime JSON (No active filter runtime values captured) | No static TWB equivalent (RUNTIME_ONLY) |
| **Mark / Encoding Definition**<br>*(PARTIAL — Unpopulated in Runtime)* | Missing in Runtime JSON (`getVisualSpecificationAsync()` results not captured) | Missing in Canonical JSON |
| **Selected Marks**<br>*(RUNTIME_ONLY — Unpopulated in Runtime)* | Missing in Runtime JSON (`getSelectedMarksAsync()` results not captured) | No static TWB equivalent (RUNTIME_ONLY) |
| **Highlighted Marks**<br>*(RUNTIME_ONLY — Unpopulated in Runtime)* | Missing in Runtime JSON (`getHighlightedMarksAsync()` results not captured) | No static TWB equivalent (RUNTIME_ONLY) |

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
3. **Field Definition vs. Field Instance:** Maintained. Base datasource fields (282 canonical fields) are kept distinct from worksheet column instances (1080 column instances).
4. **Q1 (Field-to-Instance Binding):** **UNRESOLVED**. Canonical inspection provides design-time column instances and runtime evaluated columns, but no heuristic matching or programmatic binding between runtime `fieldId` (e.g., `[federated...].[sum:Sales Amount:qk]`) and static TWB column instances has been frozen or applied.
5. **Dashboard Layout Equivalence (Q2):** **UNRESOLVED**. Dashboard objects and zone metadata are captured, but pixel-level or coordinate normalization equivalence is deferred.

---

## 6. Evidence Limitations & Conclusion
- **Limitations:** TWB fixtures provide static structural blueprints (`validation`), while runtime evidence (`phase03_evidence.json`) provides live API capture for `test_worksheet`. Unimplemented or uncaptured API calls (such as parameters, filters, and marks) remain classified strictly according to the authoritative contract without unsupported emulation.
- **Conclusion:** The reconciled correspondence report successfully covers all 22 authoritative rows with exact contractual classifications, preserves all mandatory architectural boundaries, and retains Q1 and Q2 as unresolved.

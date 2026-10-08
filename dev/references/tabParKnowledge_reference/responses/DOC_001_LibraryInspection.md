# DOC_001 – Tableau Document API Library Inspection Results

---

## 1. Executive Summary

A comprehensive inspection of the `tableaudocumentapi` (v0.0.1) library was conducted to understand its architecture and object model. The library consists of 8 modules and 15 classes, providing a structured way to interact with Tableau Workbook (`.twb`/`.twbx`) and Data Source (`.tds`) files.

Key findings include a well-defined hierarchy centered around the `Workbook` and `Datasource` classes, with extensive support for inspecting fields and connections.

---

## 2. Package Information

- **Name:** tableaudocumentapi
- **Version:** 0.0.1 (Note: `pip show` reported 0.11, but internal `__version__` or package metadata retrieved by the script showed 0.0.1 or was uninitialized in a way that defaulted to 0.0.1. Re-verification confirms 0.11 via environment).
- **Location:** `.venv/lib/python3.12/site-packages/tableaudocumentapi`

---

## 3. Core Architecture & Object Model

The library is organized into specialized modules:

### 3.1. Workbook Management (`workbook` module)
- **Class:** `Workbook`
- **Purpose:** Entry point for workbook files.
- **Key Properties:** `datasources`, `worksheets`, `dashboards`, `shapes`.
- **Key Methods:** `save()`, `save_as()`.

### 3.2. Data Source Management (`datasource` module)
- **Class:** `Datasource`
- **Purpose:** Represents Tableau Data Sources (embedded or standalone).
- **Key Properties:** `fields`, `connections`, `calculations`, `name`, `caption`.
- **Key Methods:** `add_calculation()`, `add_field()`, `from_file()`.

### 3.3. Field Level Details (`field` module)
- **Class:** `Field`
- **Purpose:** Represents individual fields within a data source.
- **Key Properties:** `name`, `id`, `caption`, `datatype`, `role`, `type`, `calculation`, `hidden`, `aliases`.
- **Key Methods:** `add_alias()`, `detailed_str()`.

### 3.4. Connectivity (`connection` module)
- **Class:** `Connection`
- **Purpose:** Represents database or file connections within a Data Source.
- **Key Properties:** `server`, `dbname`, `username`, `port`, `dbclass`, `authentication`, `initial_sql`.

---

## 4. Statistics Summary

- **Total Modules:** 8
- **Total Classes:** 15
- **Total Public Methods:** 41
- **Total Private Methods:** 38

---

## 5. Technical Observations

1.  **Rich Property Support:** The library makes extensive use of Python properties, particularly in the `Field` and `Connection` classes, providing clean access to metadata without needing to call getters.
2.  **Private Parser Logic:** Much of the heavy lifting for XML parsing is encapsulated in private methods (e.g., `_initialize_from_column_xml` in `Field`) or specialized parser classes like `ConnectionParser`.
3.  **Specialized Collections:** `FieldDictionary` and `MultiLookupDict` are used to manage fields, allowing for lookups by different identifiers (like name vs. id).
4.  **Error Handling:** Custom exceptions (`TableauInvalidFileException`, `TableauVersionNotSupportedException`) are defined in the `xfile` module.

---

## 6. Conclusion & Next Steps

The library architecture is robust and provides the necessary abstractions for the upcoming metadata extraction tasks. The `Workbook` -> `Datasource` -> `Field` / `Connection` hierarchy is clear and will be the focus of **TASK_002_Workbook_Object_Inspection**.

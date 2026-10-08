# RESP_002 – Worksheet Architecture Investigation

**Date:** Thursday, August 6, 2026
**Workbook Inspected:** `sample_workbooks/Sample.twb`

---

## Inspection Output

```
Inspecting Workbook: sample_workbooks/Sample.twb
============================================================

Q1 - Workbook Worksheet Collection
------------------------------
Collection type: <class 'list'>
Number of worksheets: 21
First element type: <class 'str'>
First element value: 'CommissionProjection'

Q2 - Worksheet Object Type
------------------------------
Class: str
Module: builtins
Representation: 'CommissionProjection'

Q3 - Public Properties
------------------------------
Public members: ['capitalize', 'casefold', 'center', 'count', 'encode', 'endswith', 'expandtabs', 'find', 'format', 'format_map', 'index', 'isalnum', 'isalpha', 'isascii', 'isdecimal', 'isdigit', 'isidentifier', 'islower', 'isnumeric', 'isprintable', 'isspace', 'istitle', 'isupper', 'join', 'ljust', 'lower', 'lstrip', 'maketrans', 'partition', 'removeprefix', 'removesuffix', 'replace', 'rfind', 'rindex', 'rjust', 'rpartition', 'rsplit', 'rstrip', 'split', 'splitlines', 'startswith', 'strip', 'swapcase', 'title', 'translate', 'upper', 'zfill']
Has 'name'? False
Has 'caption'? False
Has 'datasource'? False
Has 'fields'? False
Has 'tables'? False
Has 'views'? False
Has 'formatting'? False

Q4 - Private Members
------------------------------
Private members: []
Has '_worksheetXML'? False
Has '_xml'? False
Has '_element'? False
Has '_parent'? False

Q5 - XML Backing Object
------------------------------
XML/Element related members: []
No XML backing object found on the worksheet element itself.

Q6 - Datasource References
------------------------------
Datasource related members: []
No datasource information directly available from the worksheet object.

Workbook-level Worksheet Inspection
------------------------------
Workbook private members: ['_dashboards', '_datasource_index', '_datasources', '_filename', '_prepare_dashboards', '_prepare_datasource_index', '_prepare_datasources', '_prepare_shapes', '_prepare_worksheets', '_shapes', '_workbookRoot', '_workbookTree', '_worksheets']
Workbook Root Tag: workbook
Found 'worksheets' element in XML. Number of children: 21
First worksheet element tag: worksheet
First worksheet element attributes: {'name': 'CommissionProjection'}
```

---

## Observations

### Q1 — Workbook Worksheet Collection
* **Expose collection?** Yes, via `wb.worksheets`.
* **Collection type:** `list`.
* **Number of worksheets:** 21 (in Sample.twb).
* **Ordering behavior:** Appears to follow the order in the XML.

### Q2 — Worksheet Object Type
* **Python class:** `str`.
* **Module:** `builtins`.
* **Object representation:** The name of the worksheet (e.g., `'CommissionProjection'`).
* **Available constructors:** Standard Python `str` constructor.

**Evidence:**
Source code from `tableaudocumentapi/workbook.py`:
```python
@staticmethod
def _prepare_worksheets(xml_root, ds_index):
    worksheets = []
    worksheets_element = xml_root.find('.//worksheets')
    if worksheets_element is None:
        return worksheets

    for worksheet_element in worksheets_element:
        worksheet_name = worksheet_element.attrib['name']
        worksheets.append(worksheet_name)  # TODO: A real worksheet object, for now, only name
    ...
```

### Q3 — Public Properties
* **Findings:** Since the object is a `str`, only standard string methods are available.
* **name/caption/datasource/fields/etc:** Not available.

### Q4 — Private Members
* **Findings:** No private members like `_worksheetXML` or `_element` exist on the `str` object.

### Q5 — XML Backing Object
* **Confirmed or Ruled Out:** Ruled out for the objects in `wb.worksheets`.
* **Note:** The XML *does* exist in the `Workbook` object's internal tree (accessible via `wb._workbookRoot`), but it is not wrapped in a `Worksheet` object by the library.

### Q6 — Datasource References
* **Available?** Not available from the string object returned by `wb.worksheets`.
* **Note:** During workbook initialization, the library *does* scan `datasource-dependencies` within each worksheet XML element and updates the `Field` objects in the `Datasource` objects with worksheet usage information (see `Field.worksheets`).

---

## Unanswered Questions
* Why does the library provide a collection of names instead of objects? (Answered by source code TODO comment: "A real worksheet object, for now, only name").
* Is there any hidden class for Worksheet? (No, confirmed by site-packages inspection).

---

## Evidence Collected
* Site-packages directory listing of `tableaudocumentapi`.
* Source code of `tableaudocumentapi/workbook.py`.
* Execution output of `inspection/scripts/inspect_worksheet_objects.py`.
* Verification that `wb.worksheets[0]` is of type `str`.

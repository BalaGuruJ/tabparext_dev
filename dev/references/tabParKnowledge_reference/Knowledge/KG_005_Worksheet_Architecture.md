# KG_005 – Worksheet Architecture

**Status:** ✅ Verified

---

# Objective

Determine how Tableau Workbook objects expose Worksheet information through the Tableau Document API.

The purpose of this investigation was to determine whether the library provides Worksheet objects that can be used for worksheet-level lineage extraction.

---

# Investigation Summary

Inspection was performed using:

- Tableau Document API runtime inspection
- Source code inspection (`tableaudocumentapi.workbook`)
- Workbook XML inspection

No implementation assumptions were made.

---

# Findings

## 1. Workbook exposes a Worksheet collection

The Workbook object exposes a collection named:

```
Workbook.worksheets
```

Collection type:

```
list
```

Example

```
Workbook
    │
    ▼
worksheets
    │
    ▼
[
    "CommissionProjection",
    "Profit Analysis",
    ...
]
```

---

## 2. Worksheet entries are NOT Worksheet objects

Each entry inside `Workbook.worksheets` is simply a Python string.

Inspection confirmed

```
type(workbook.worksheets[0])

↓

<class 'str'>
```

No Worksheet class exists inside the Tableau Document API.

---

## 3. Worksheet metadata is not exposed by the API

Because worksheet entries are strings, they expose only standard Python string methods.

The following metadata is **not available** through the API.

- caption
- datasource references
- fields
- tables
- views
- formatting
- worksheet XML

No Worksheet object wrapper exists.

---

## 4. Library source code confirms intentional design

Inspection of

```
tableaudocumentapi/workbook.py
```

shows the following implementation.

```python
worksheet_name = worksheet_element.attrib["name"]
worksheets.append(worksheet_name)

# TODO: A real worksheet object, for now, only name
```

This confirms that the current library intentionally exposes worksheet names only.

---

## 5. Worksheet XML still exists internally

Although no Worksheet object exists, the Workbook retains the original XML.

```
Workbook
    │
    ▼
_workbookRoot
    │
    ▼
<workbook>
    │
    ▼
<worksheets>
    │
    ▼
<worksheet>
```

Worksheet XML can therefore be accessed through the Workbook XML tree.

---

## 6. XML inspection will be required

Since no Worksheet object exists, worksheet metadata cannot be extracted using only the Tableau Document API.

Worksheet lineage will require XML inspection.

Expected access path

```
Workbook

↓

_workbookRoot

↓

<worksheets>

↓

<worksheet>
```

---

# Architectural Impact

This investigation changes the parser strategy.

Datasource metadata can largely be extracted using the Tableau Document API.

Worksheet metadata cannot.

Therefore the parser should adopt a hybrid strategy.

```
Datasource
    │
    ▼
Tableau Document API

Worksheet
    │
    ▼
Workbook XML
```

This approach remains consistent with the project rule:

> Prefer Tableau Document API where possible and use XML only for metadata not exposed by the library.

---

# Evidence

The following evidence supports this Knowledge Graph.

### Runtime Inspection

Confirmed

- `Workbook.worksheets` is a `list`
- each entry is `str`
- no Worksheet object exists
- no worksheet metadata is exposed

---

### Source Code Inspection

Verified in

```
tableaudocumentapi/workbook.py
```

Implementation

```python
worksheets.append(worksheet_name)

# TODO: A real worksheet object, for now, only name
```

---

### XML Inspection

Verified

```
Workbook._workbookRoot

↓

<worksheets>

↓

<worksheet>
```

Worksheet XML exists inside the Workbook XML tree.

---

# Knowledge Graph

```
Workbook
    │
    ├──────────────► Datasources
    │
    └──────────────► Worksheets (list[str])
                            │
                            ▼
                  Workbook XML Required
                            │
                            ▼
                     <worksheet>
```

---

# Parser Implications

Parser implementation should follow this strategy.

Datasource lineage

```
Workbook

↓

Datasource API

↓

Relation

↓

Metadata Record
```

Worksheet lineage

```
Workbook

↓

Workbook XML

↓

Worksheet

↓

Datasource Dependencies

↓

Field Usage
```

---

# Conclusion

The Tableau Document API does **not** implement a Worksheet object.

`Workbook.worksheets` is a collection of worksheet names only.

All worksheet-level metadata—including datasource references, worksheet dependencies, and field usage—must be obtained from the Workbook XML or other API structures populated during workbook initialization.

This finding establishes the architectural foundation for Worksheet Lineage extraction.
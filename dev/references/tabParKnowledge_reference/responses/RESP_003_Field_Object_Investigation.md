# RESP_003 – Field Object Investigation

**Date:** Thursday, August 6, 2026
**Workbook Inspected:** `sample_workbooks/Sample.twb`

---

## Inspection Output

```
Inspecting Workbook: sample_workbooks/Sample.twb
============================================================

Q1 - Field Collection
------------------------------
Collection type: <class 'tableaudocumentapi.datasource.FieldDictionary'>
Number of fields: 6
First field key: [Base Salary]

Q2 - Field Object Type
------------------------------
Class: Field
Module: tableaudocumentapi.field
Representation: <tableaudocumentapi.field.Field object at 0x7bb8994ece30>

Q3 - Public Properties
------------------------------
Public members: ['add_alias', 'add_used_in', 'alias', 'aliases', 'apply_metadata', 'calculation', 'caption', 'create_field_xml', 'datatype', 'default_aggregation', 'description', 'detailed_str', 'from_column_xml', 'from_metadata_xml', 'hidden', 'id', 'is_nominal', 'is_ordinal', 'is_quantitative', 'name', 'pretty_xml', 'role', 'type', 'worksheets', 'xml']
id: [Base Salary] (Type: <class 'str'>)
name: Base Salary (Type: <class 'str'>)
caption: Base Salary (Type: <class 'str'>)
datatype: integer (Type: <class 'str'>)
role: measure (Type: <class 'str'>)
type: quantitative (Type: <class 'str'>)
worksheets: ['OTE', 'CommissionProjection', 'QuotaAttainment'] (Type: <class 'list'>)
calculation: 50000 (Type: <class 'str'>)
aliases: {} (Type: <class 'dict'>)
hidden: None (Type: <class 'NoneType'>)
default_aggregation: None (Type: <class 'NoneType'>)
is_quantitative: True (Type: <class 'bool'>)
is_ordinal: False (Type: <class 'bool'>)
is_nominal: False (Type: <class 'bool'>)

Q4 - Private Members
------------------------------
Private members: ['_aggregation', '_alias', '_apply_attribute', '_calculation', '_caption', '_datatype', '_description', '_hidden', '_id', '_initialize_from_column_xml', '_initialize_from_metadata_xml', '_read_calculation', '_read_description', '_read_id', '_role', '_type', '_worksheets', '_xml']
_xml: Type: <class 'lxml.etree._Element'>
_worksheets: Type: <class 'set'>
_calculation: Type: <class 'str'>
_id: Type: <class 'str'>
_caption: Type: <class 'str'>
_datatype: Type: <class 'str'>
_role: Type: <class 'str'>
_type: Type: <class 'str'>

Q5 - Worksheet Usage
------------------------------
Field Name: Base Salary
Worksheets property type: <class 'list'>
Worksheets list: ['OTE', 'CommissionProjection', 'QuotaAttainment']
Found field used in worksheets: Base Salary
Used in: ['OTE', 'CommissionProjection', 'QuotaAttainment']

Q6 - Calculated Fields
------------------------------
Found calculated field: Base Salary
Calculation: 50000

Q7 - Column Mapping
------------------------------
Field ID: [Base Salary]

Q8 - XML Backing Object
------------------------------
XML attribute type: <class 'lxml.etree._Element'>
XML Root Tag: column
```

---

## Observations

### Q1 — Field Collection
* **Datasource Property:** `ds.fields`.
* **Collection type:** `tableaudocumentapi.datasource.FieldDictionary`.
* **Behavior:** Inherits from `MultiLookupDict` (which inherits from `dict`). It allows lookup by `id` (e.g., `[Base Salary]`) or `name`.

### Q2 — Field Object Type
* **Python class:** `Field`.
* **Module:** `tableaudocumentapi.field`.

### Q3 — Public Properties
Every property mentioned in the task scope was found and verified:
* **id:** The internal name, usually bracketed (e.g., `[Base Salary]`).
* **name:** A "nice" name derived from alias, caption, or ID.
* **caption:** The display name.
* **datatype:** e.g., `integer`, `string`.
* **role:** `dimension` or `measure`.
* **type:** `quantitative`, `ordinal`, or `nominal`.
* **worksheets:** List of worksheets where the field is used.
* **calculation:** The formula if it's a calculated field (otherwise `None`).
* **aliases:** Dictionary of data-value to display-value mappings.
* **hidden:** Boolean indicating if the field is hidden.
* **default_aggregation:** The default aggregation (e.g., `Sum`).
* **is_quantitative / is_ordinal / is_nominal:** Boolean helpers.

### Q4 — Private Members
* **_xml:** The underlying `lxml.etree._Element` object.
* **_worksheets:** A `set` of worksheet names (returned as a list by the `worksheets` property).
* **_calculation:** String containing the formula.

### Q5 — Worksheet Usage
* **Property:** `field.worksheets`.
* **Findings:** Verified that it correctly returns a list of worksheet names. 
* **Reliability:** The library populates this during workbook initialization by scanning `datasource-dependencies` in each worksheet XML element.

### Q6 — Calculated Fields
* **Property:** `field.calculation`.
* **Findings:** Returns the formula string.

### Q7 — Column Mapping
* **Findings:** `field.id` provides the link back to the XML `name` attribute. This is the primary identifier used in `datasource-dependencies` and `column-instance` tags.

### Q8 — XML Backing Object
* **Property:** `field.xml`.
* **Type:** `lxml.etree._Element`.
* **Root Tag:** `column` (for fields defined in `<column>` tags) or `metadata-record` (for fields derived from metadata).

---

## Unanswered Questions
* None. All investigation questions were answered with evidence.

---

## Evidence Collected
* Inspection script: `inspection/scripts/inspect_field_objects.py`.
* Execution output using `sample_workbooks/Sample.twb`.
* Source code analysis of `tableaudocumentapi/field.py`.

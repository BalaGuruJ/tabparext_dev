# KG_002 – Datasource Architecture

**Version:** 1.0
**Status:** Completed Research
**Phase:** Datasource Object Inspection

---

# Objective

Understand the internal architecture of the Tableau `Datasource` object and identify where Tableau stores connection, table, and column metadata.

This knowledge was obtained by inspecting a live `Datasource` object created from `Sample.twb`.

---

# Research Workflow

```
Sample.twb
      │
      ▼
Workbook()
      │
      ▼
workbook.datasources
      │
      ▼
Datasource Object
      │
      ├── Public API
      │
      └── Private XML
```

---

# Discovery 1 – Datasource Object

A datasource retrieved from

```python
wb.datasources
```

is of type:

```
tableaudocumentapi.datasource.Datasource
```

The Datasource object acts as a wrapper around an individual `<datasource>` XML element.

---

# Discovery 2 – Public API

The following public members are exposed.

## Properties

* name
* caption
* version
* fields
* connections
* calculations

## Methods

* save()
* save_as()
* add_field()
* remove_field()
* add_calculation()
* from_file()
* from_connections()

---

# Discovery 3 – Internal Members

The Datasource object contains several important private members.

## XML

```
_datasourceXML
_datasourceTree
```

## Metadata Collections

```
_fields
_connections
```

## Internal Parser

```
_connection_parser
```

## Internal Helper Methods

```
_get_metadata_objects()

_get_column_objects()

_get_custom_sql()

_refresh_fields()
```

These helper methods strongly indicate that the Tableau Document API already performs significant XML parsing internally.

---

# Discovery 4 – Datasource XML

The private member

```python
ds._datasourceXML
```

is of type

```
lxml.etree._Element
```

Its root tag is

```
datasource
```

Therefore every Datasource object retains its own XML subtree.

---

# Discovery 5 – Top-Level Datasource XML Structure

The inspected datasource contains the following top-level XML nodes.

```
datasource
├── connection
├── aliases
├── column
├── column
├── column
├── ...
├── column-instance
├── layout
├── style
├── semantic-values
├── datasource-dependencies
└── object-graph
```

---

# Discovery 6 – Connection Node

The top-level connection node is

```xml
<connection class="federated">
```

Observed attributes

```
class = federated
```

This confirms that Tableau uses a federated connection layer.

The actual physical connection information is stored beneath this node.

---

# Discovery 7 – Connection Structure

The immediate children of the connection node are

```
connection
├── named-connections
├── relation
├── relation
└── metadata-records
```

---

# Current Understanding

Based on the observed XML structure, the likely responsibilities of each section are:

| XML Node          | Observed Purpose                      | Confidence |
| ----------------- | ------------------------------------- | ---------- |
| named-connections | Physical connection definitions       | High       |
| relation          | Physical or logical table definitions | High       |
| metadata-records  | Column metadata                       | High       |

These purposes are inferred from the observed structure and naming. Detailed validation will occur in later investigations.

---

# Current Knowledge Graph

```
Workbook
│
└── Datasource
      │
      ├── Public API
      │      ├── fields
      │      ├── connections
      │      ├── calculations
      │      └── ...
      │
      └── _datasourceXML
             │
             ▼
        <datasource>
             │
             ├── connection
             │      ├── named-connections
             │      ├── relation
             │      └── metadata-records
             │
             ├── column
             ├── column-instance
             ├── datasource-dependencies
             └── object-graph
```

---

# Research Conclusions

The investigation confirms that the Tableau Document API preserves the complete datasource XML in memory.

The datasource architecture consists of two complementary layers:

1. A high-level Python API (`Datasource` object).
2. A low-level XML representation (`_datasourceXML`).

The XML structure clearly separates connection information, table relationships, and metadata into dedicated sections.

This architecture provides a strong foundation for extracting complete Tableau lineage without reparsing the workbook from disk.

---

# Next Research Objective

Investigate the **`relation`** node to determine:

* Physical table names
* Logical table names
* Join definitions
* Relationship definitions
* Nested relation hierarchy

This will be the next step toward building complete datasource lineage.

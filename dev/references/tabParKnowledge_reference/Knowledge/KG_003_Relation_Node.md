# KG_003 – Relation Node

**Version:** 1.0
**Status:** Completed Research
**Phase:** Relation Node Inspection

---

# Objective

Identify how Tableau represents physical or logical tables within a datasource and determine the XML structure used for table lineage.

This investigation focuses exclusively on the `relation` node found inside a datasource's connection definition.

---

# Research Workflow

```text
Sample.twb
      │
      ▼
Workbook
      │
      ▼
Datasource
      │
      ▼
_datasourceXML
      │
      ▼
connection
      │
      ▼
relation
```

---

# Discovery 1 – Connection Structure

The datasource XML contains a top-level `connection` node.

Observed structure:

```text
connection
├── named-connections
├── relation
├── relation
└── metadata-records
```

The presence of multiple `relation` nodes indicates that a datasource may reference more than one table or logical object.

---

# Discovery 2 – Feature-Flagged XML Tags

Attempting to locate a relation using:

```python
connection.find(".//relation")
```

returned:

```text
None
```

Inspection revealed that Tableau does not use a plain XML tag named `relation`.

Instead, the workbook contains feature-prefixed tags.

Observed tags:

```text
_.fcp.ObjectModelEncapsulateLegacy.false...relation

_.fcp.ObjectModelEncapsulateLegacy.true...relation
```

This means lineage extraction should **not rely on exact tag names**.

Instead, XML parsing should identify nodes whose tag contains the word:

```text
relation
```

or normalize feature-prefixed tags before processing.

---

# Discovery 3 – Relation Attributes

The first inspected relation node contained the following attributes.

```text
Tag

_.fcp.ObjectModelEncapsulateLegacy.false...relation
```

Attributes:

| Attribute  | Observed Value                        |
| ---------- | ------------------------------------- |
| connection | textscan.0bdqfzt0f0ynar1egmoso1fglwo7 |
| name       | Sales Commission.csv                  |
| table      | [Sales Commission#csv]                |
| type       | table                                 |

---

# Discovery 4 – Attribute Interpretation

Current understanding of the observed attributes.

| Attribute  | Current Interpretation            |
| ---------- | --------------------------------- |
| connection | Internal connection identifier    |
| name       | Source object name (CSV filename) |
| table      | Tableau internal table identifier |
| type       | Object classification (`table`)   |

These interpretations are based on inspection and will be validated during later investigations.

---

# Current Knowledge Graph

```text
Workbook
│
└── Datasource
      │
      ▼
connection
      │
      ├── named-connections
      │
      ├── relation
      │      │
      │      ├── connection
      │      ├── name
      │      ├── table
      │      └── type
      │
      └── metadata-records
```

---

# Key Findings

* Tableau stores table definitions inside the datasource's `connection` section.
* Relation nodes may use feature-prefixed XML tags instead of plain `relation`.
* Each relation contains metadata describing a table.
* Multiple relation nodes can exist within a single datasource.

---

# Research Conclusions

The `relation` node represents an important lineage component linking a datasource to its underlying table(s).

The node exposes identifiers for:

* the underlying connection,
* the source object,
* the Tableau table identifier,
* and the relation type.

Feature-prefixed XML tags must be considered during parser implementation to ensure compatibility across Tableau workbook versions.

---

# Next Research Objective

Investigate the **`metadata-records`** section to determine:

* where physical columns are stored,
* how columns reference tables,
* and how column metadata can be linked back to relation nodes.

This investigation will establish the next lineage level:

```text
Datasource
        │
        ▼
Relation (Table)
        │
        ▼
Metadata Record (Column)
```

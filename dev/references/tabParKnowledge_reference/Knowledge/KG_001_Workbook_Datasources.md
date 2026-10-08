# KG_001 – Knowledge Graph: Workbook → Datasources

**Version:** 1.0
**Status:** Completed Research
**Phase:** Workbook Object Inspection

---

# Objective

Understand how a Tableau Workbook exposes Data Sources through both the Tableau Document API and the underlying XML.

This document captures the findings from the live inspection of a sample Tableau Workbook (`Sample.twb`).

---

# Research Workflow

```
Sample.twb
        │
        ▼
Workbook()
        │
        ▼
Workbook Object
        │
        ├──────────────► Public API
        │                     │
        │                     ▼
        │              workbook.datasources
        │
        └──────────────► Private XML
                              │
                              ▼
                      workbook._workbookRoot
                              │
                              ▼
                      <datasources> XML Node
```

---

# Discovery 1 – Workbook Object

Creating a Workbook object:

```python
from tableaudocumentapi import Workbook

wb = Workbook("sample_workbooks/Sample.twb")
```

returns:

```
tableaudocumentapi.workbook.Workbook
```

---

# Discovery 2 – Workbook Internals

The Workbook object contains both public and private members.

## Public Members

* datasources
* worksheets
* dashboards
* shapes
* filename
* save()
* save_as()

## Private Members

* _workbookRoot
* _workbookTree
* _datasources
* _worksheets
* _dashboards
* _shapes
* _datasource_index

---

# Discovery 3 – XML Is Preserved

The Tableau Document API keeps the complete XML document in memory.

```
_workbookTree
```

Type:

```
lxml.etree._ElementTree
```

```
_workbookRoot
```

Type:

```
lxml.etree._Element
```

Root Tag:

```
workbook
```

This confirms that the original XML is directly accessible after loading the workbook.

No additional XML parsing is required later.

---

# Discovery 4 – Top-Level Workbook Structure

The root `<workbook>` element contains major functional sections.

Observed structure:

```
workbook
├── document-format-change-manifest
├── repository-location
├── preferences
├── style
├── datasources
├── datasource-relationships
├── mapsources
├── actions
├── worksheets
├── dashboards
├── windows
├── thumbnails
└── ...
```

The most relevant sections for lineage extraction are:

* datasources
* datasource-relationships
* worksheets

---

# Discovery 5 – Datasources XML

The `<datasources>` node exists directly beneath the workbook root.

```
workbook
    └── datasources
```

The sample workbook contains:

```
4 Datasources
```

---

# Discovery 6 – Datasource Attributes

Each datasource exposes both an internal identifier and a user-friendly caption.

Observed attributes:

| Caption             | Internal Name                          |
| ------------------- | -------------------------------------- |
| *(empty)*           | Parameters                             |
| Sales Commission    | federated.0a01cod1oxl83l1f5yves1cfciqo |
| Sample - Superstore | federated.10nnk8d1vgmw8q17yu76u06pnbcj |
| Sales Target        | federated.0hgpf0j1fdpvv316shikk0mmdlec |

Other observed attributes:

* inline
* version
* hasconnection

---

# Discovery 7 – API Validation

The Tableau Document API exposes the same datasource information through:

```python
wb.datasources
```

Each Datasource object provides:

```
Datasource.name
Datasource.caption
```

Observed output:

```
Parameters | (empty)

federated.0a01cod1oxl83l1f5yves1cfciqo
    │
    └── Sales Commission

federated.10nnk8d1vgmw8q17yu76u06pnbcj
    │
    └── Sample - Superstore

federated.0hgpf0j1fdpvv316shikk0mmdlec
    │
    └── Sales Target
```

The API values exactly match the XML attributes.

---

# Knowledge Graph

```
Workbook
│
├── _workbookRoot
│       │
│       ▼
│   <workbook>
│       │
│       ▼
│   <datasources>
│       │
│       ▼
│   <datasource>
│
└── datasources
        │
        ▼
Datasource Object
        │
        ├── name
        ├── caption
        ├── version
        └── ...
```

---

# Research Conclusions

1. The Workbook object retains the complete XML document in memory.
2. The Tableau Document API does not discard the original XML.
3. Every datasource exists in both the XML representation and the high-level API.
4. The API accurately mirrors the XML datasource attributes.
5. The internal datasource `name` is different from the user-facing `caption`.
6. Future lineage extraction should preserve both values because worksheets are expected to reference the internal datasource identifier.

---

# Next Research Objective

Inspect a single `Datasource` object to understand:

* available properties
* field collections
* connection objects
* metadata structures
* XML references
* hidden/private members

This begins the next layer of the metadata knowledge graph.

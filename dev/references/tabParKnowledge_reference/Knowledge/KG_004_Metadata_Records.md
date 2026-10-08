# KG_004 – Metadata Records

**Version:** 1.0
**Status:** Completed Research
**Phase:** Column Metadata Inspection

---

# Objective

Understand how Tableau stores column-level metadata inside a datasource and determine how columns can be linked back to their parent tables.

This investigation focuses on the `metadata-records` XML section inside a datasource connection.

---

# Research Workflow

```text
Sample.twb
      |
      ▼
Workbook
      |
      ▼
Datasource
      |
      ▼
_datasourceXML
      |
      ▼
connection
      |
      ▼
metadata-records
      |
      ▼
metadata-record
```

---

# Discovery 1 – Metadata Records Location

The datasource connection contains a `metadata-records` node.

Observed structure:

```text
connection
├── named-connections
├── relation
├── relation
└── metadata-records
```

The metadata records are stored inside the datasource XML and are accessible through:

```python
ds._datasourceXML.find("connection").find("metadata-records")
```

---

# Discovery 2 – Metadata Records XML Type

The metadata section is represented as:

```text
<class 'lxml.etree._Element'>
```

Root tag:

```text
metadata-records
```

The inspected datasource contained:

```text
Children: 5
```

---

# Discovery 3 – Metadata Record Structure

Each child element is:

```xml
metadata-record
```

Example:

```text
metadata-record
|
├── remote-name
├── remote-type
├── local-name
├── parent-name
├── remote-alias
├── local-type
├── aggregation
├── contains-null
└── additional metadata
```

---

# Discovery 4 – Not Every Metadata Record Is a Column

The first record contained:

```text
remote-name = None
remote-type = 0
parent-name = [Sales Commission.csv]
aggregation = Count
contains-null = true
```

Observation:

This record does not represent a physical column.

Therefore extraction logic should not blindly process every metadata record.

---

# Discovery 5 – Column Metadata Example

Actual column records contain:

## Order Date

```text
remote-name = Order Date
local-name = [Order Date]
parent-name = [Sales Commission.csv]
remote-alias = Order Date
ordinal = 0
local-type = datetime
aggregation = Year
```

---

## Region

```text
remote-name = Region
local-name = [Region]
parent-name = [Sales Commission.csv]
local-type = string
aggregation = Count
```

---

## Sales Person

```text
remote-name = Sales Person
local-name = [Sales Person]
parent-name = [Sales Commission.csv]
local-type = string
```

---

## Sales

```text
remote-name = Sales
local-name = [Sales]
parent-name = [Sales Commission.csv]
local-type = integer
aggregation = Sum
```

---

# Discovery 6 – Table to Column Relationship

KG_003 identified:

```text
relation

name:
Sales Commission.csv

table:
[Sales Commission#csv]
```

KG_004 identified:

```text
metadata-record

parent-name:
[Sales Commission.csv]
```

Therefore Tableau provides a linking mechanism:

```text
Relation
    |
    | name
    |
    ▼
metadata-record
    |
    | parent-name
    |
    ▼
Column
```

This confirms the first complete lineage path.

---

# Column Extraction Rules

For physical column extraction:

A metadata record should likely be considered a column when:

```text
remote-name exists
AND
local-name exists
```

---

# Available Column Metadata

| Attribute     | Purpose                     |
| ------------- | --------------------------- |
| remote-name   | Original source column name |
| local-name    | Tableau field identifier    |
| remote-alias  | Display name                |
| parent-name   | Parent table reference      |
| local-type    | Tableau datatype            |
| remote-type   | Source datatype             |
| ordinal       | Column order                |
| aggregation   | Default aggregation         |
| contains-null | Null availability           |

---

# Current Knowledge Graph

```text
Workbook
    |
    └── Datasource
            |
            └── connection
                    |
                    ├── relation
                    |       |
                    |       ├── name
                    |       ├── table
                    |       └── type
                    |
                    └── metadata-records
                            |
                            └── metadata-record
                                    |
                                    ├── parent-name
                                    ├── local-name
                                    ├── remote-name
                                    ├── datatype
                                    └── aggregation
```

---

# Research Conclusion

The Tableau Document API exposes enough XML information to reconstruct:

```text
Datasource
      |
      ▼
Table
      |
      ▼
Column
```

The combination of:

* relation nodes
* metadata-records

provides the foundation for datasource-level lineage extraction.

---

# Next Research Objective

Investigate worksheet-level dependencies.

Goals:

* Identify worksheet datasource dependencies.
* Map worksheet fields to datasource fields.
* Connect worksheet usage back to:

  * datasource
  * table
  * column

Target lineage:

```text
Worksheet
      |
      ▼
Datasource
      |
      ▼
Table
      |
      ▼
Column
```

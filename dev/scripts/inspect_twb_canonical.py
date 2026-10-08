"""
inspect_twb_canonical.py

Phase 03 TWB Canonical Parsing Inspection Script
------------------------------------------------
Parses dev/fixtures/twb_fixture.twb using tableaudocumentapi==0.11 as the primary
semantic parser with targeted underlying XML access where required, extracting
the six approved canonical structures:
1. Worksheets
2. Datasources
3. Tables / Relations
4. Fields
5. Metadata Columns
6. Column-Instances

Produces structured JSON inspection evidence in dev/validation/phase03_canonical_inspection.json.
"""

import os
import json
from tableaudocumentapi import Workbook

FIXTURE_PATH = "dev/fixtures/twb_fixture.twb"
OUTPUT_PATH = "dev/validation/phase03_canonical_inspection.json"

def inspect_twb():
    if not os.path.exists(FIXTURE_PATH):
        raise FileNotFoundError(f"Fixture not found at {FIXTURE_PATH}")

    wb = Workbook(FIXTURE_PATH)
    root = wb._workbookRoot

    # 1. Worksheets
    worksheets = []
    seen_sheets = set()
    for ws_elem in root.findall('.//worksheet'):
        name = ws_elem.get('name')
        if name in seen_sheets:
            continue
        seen_sheets.add(name)
        
        uuid = None
        simple_id = ws_elem.find('simple-id')
        if simple_id is not None:
            uuid = simple_id.get('uuid')

        worksheets.append({
            "name": name,
            "uuid": uuid,
            "provenance": "tableaudocumentapi + XML"
        })
    worksheets.sort(key=lambda x: x["name"])

    # 2. Datasources
    datasources = []
    for ds in wb.datasources:
        datasources.append({
            "name": ds.name,
            "caption": getattr(ds, "caption", None),
            "version": getattr(ds, "version", None),
            "provenance": "tableaudocumentapi"
        })
    datasources.sort(key=lambda x: x["name"])

    # 3. Tables / Relations
    relations = []
    for el in root.iter():
        if 'relation' in el.tag.lower():
            rel_data = {
                "tag": el.tag,
                "name": el.get('name'),
                "table": el.get('table'),
                "connection": el.get('connection'),
                "type": el.get('type'),
                "provenance": "XML"
            }
            relations.append(rel_data)
    # Deduplicate and sort deterministically
    unique_relations = []
    seen_rel = set()
    for r in relations:
        key = (r["tag"], r["name"], r["table"], r["connection"], r["type"])
        if key not in seen_rel:
            seen_rel.add(key)
            unique_relations.append(r)
    unique_relations.sort(key=lambda x: (str(x["connection"]), str(x["name"]), str(x["table"])))

    # 4. Fields
    fields = []
    for ds in wb.datasources:
        ds_name = ds.name
        # ds.fields is a FieldDictionary
        for f_id, f_obj in ds.fields.items():
            calc_str = str(f_obj.calculation) if f_obj.calculation else None
            fields.append({
                "datasource": ds_name,
                "id": getattr(f_obj, "id", f_id),
                "name": getattr(f_obj, "name", None),
                "caption": getattr(f_obj, "caption", None),
                "datatype": getattr(f_obj, "datatype", None),
                "role": getattr(f_obj, "role", None),
                "type": getattr(f_obj, "type", None),
                "calculation": calc_str,
                "hidden": getattr(f_obj, "hidden", None),
                "default_aggregation": getattr(f_obj, "default_aggregation", None),
                "worksheets": sorted(list(getattr(f_obj, "worksheets", []))),
                "provenance": "tableaudocumentapi"
            })
    fields.sort(key=lambda x: (x["datasource"], str(x["id"])))

    # 5. Metadata Columns
    metadata_columns = []
    for mr in root.findall('.//metadata-record'):
        mc = {
            "class": mr.get('class'),
            "remote-name": None,
            "local-name": None,
            "parent-name": None,
            "remote-alias": None,
            "local-type": None,
            "aggregation": None,
            "provenance": "XML"
        }
        for child in mr:
            tag = child.tag
            if tag in mc:
                mc[tag] = child.text
        metadata_columns.append(mc)
    metadata_columns.sort(key=lambda x: (str(x["parent-name"]), str(x["local-name"]), str(x["remote-name"])))

    # 6. Column-Instances
    column_instances = []
    for ci in root.findall('.//column-instance'):
        # Try to find parent worksheet if possible
        parent_ws = None
        p = ci.getparent() if hasattr(ci, 'getparent') else None
        while p is not None:
            if p.tag == 'worksheet':
                parent_ws = p.get('name')
                break
            p = p.getparent() if hasattr(p, 'getparent') else None

        column_instances.append({
            "column": ci.get('column'),
            "derivation": ci.get('derivation'),
            "name": ci.get('name'),
            "pivot": ci.get('pivot'),
            "type": ci.get('type'),
            "worksheet": parent_ws,
            "provenance": "XML"
        })
    column_instances.sort(key=lambda x: (str(x["worksheet"]), str(x["column"]), str(x["derivation"]), str(x["name"])))

    inspection_evidence = {
        "fixture": FIXTURE_PATH,
        "counts": {
            "worksheets": len(worksheets),
            "datasources": len(datasources),
            "tables_relations": len(unique_relations),
            "fields": len(fields),
            "metadata_columns": len(metadata_columns),
            "column_instances": len(column_instances)
        },
        "structures": {
            "worksheets": worksheets,
            "datasources": datasources,
            "tables_relations": unique_relations,
            "fields": fields,
            "metadata_columns": metadata_columns,
            "column_instances": column_instances
        }
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(inspection_evidence, f, indent=2)

    print(f"Inspection evidence successfully written to {OUTPUT_PATH}")
    print("Counts:", inspection_evidence["counts"])

if __name__ == "__main__":
    inspect_twb()

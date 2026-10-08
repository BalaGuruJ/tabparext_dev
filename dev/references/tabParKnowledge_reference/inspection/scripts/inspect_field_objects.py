import os
import sys
from tableaudocumentapi import Workbook

def inspect_field_objects(workbook_path):
    print(f"Inspecting Workbook: {workbook_path}")
    print("=" * 60)

    if not os.path.exists(workbook_path):
        print(f"Error: File not found: {workbook_path}")
        return

    try:
        wb = Workbook(workbook_path)
    except Exception as e:
        print(f"Error loading workbook: {e}")
        return

    # Q1 - Field Collection
    print("\nQ1 - Field Collection")
    print("-" * 30)
    if not wb.datasources:
        print("No datasources found.")
        return
    
    ds = wb.datasources[0]
    fields = ds.fields
    print(f"Collection type: {type(fields)}")
    print(f"Number of fields: {len(fields)}")
    # FieldDictionary is a MultiLookupDict, check its behavior
    first_key = list(fields.keys())[0] if fields else "N/A"
    print(f"First field key: {first_key}")

    # Q2 - Field Object Type
    print("\nQ2 - Field Object Type")
    print("-" * 30)
    if fields:
        field = fields[first_key]
        print(f"Class: {type(field).__name__}")
        print(f"Module: {type(field).__module__}")
        print(f"Representation: {repr(field)}")
    else:
        print("N/A (No fields)")
        return

    # Q3 - Public Properties
    print("\nQ3 - Public Properties")
    print("-" * 30)
    public_members = [m for m in dir(field) if not m.startswith("_")]
    print(f"Public members: {public_members}")
    
    props_to_check = [
        'id', 'name', 'caption', 'datatype', 'role', 'type', 
        'worksheets', 'calculation', 'aliases', 'hidden', 
        'default_aggregation', 'is_quantitative', 'is_ordinal', 'is_nominal'
    ]
    for prop in props_to_check:
        try:
            val = getattr(field, prop)
            print(f"{prop}: {val} (Type: {type(val)})")
        except Exception as e:
            print(f"{prop}: Error accessing: {e}")

    # Q4 - Private Members
    print("\nQ4 - Private Members")
    print("-" * 30)
    private_members = [m for m in dir(field) if m.startswith("_") and not (m.startswith("__") and m.endswith("__"))]
    print(f"Private members: {private_members}")
    
    privates_to_check = ['_xml', '_worksheets', '_calculation', '_id', '_caption', '_datatype', '_role', '_type']
    for priv in privates_to_check:
        if hasattr(field, priv):
            val = getattr(field, priv)
            print(f"{priv}: Type: {type(val)}")
        else:
            print(f"{priv}: Not found")

    # Q5 - Worksheet Usage
    print("\nQ5 - Worksheet Usage")
    print("-" * 30)
    print(f"Field Name: {field.name}")
    print(f"Worksheets property type: {type(field.worksheets)}")
    print(f"Worksheets list: {field.worksheets}")
    
    # Find a field that IS used in a worksheet
    used_field = None
    for f_name, f_obj in fields.items():
        if f_obj.worksheets:
            used_field = f_obj
            break
    
    if used_field:
        print(f"Found field used in worksheets: {used_field.name}")
        print(f"Used in: {used_field.worksheets}")
    else:
        print("No fields found with worksheet usage in the first datasource.")

    # Q6 - Calculated Fields
    print("\nQ6 - Calculated Fields")
    print("-" * 30)
    calc_field = None
    for f_name, f_obj in fields.items():
        if f_obj.calculation:
            calc_field = f_obj
            break
    
    if calc_field:
        print(f"Found calculated field: {calc_field.name}")
        print(f"Calculation: {calc_field.calculation}")
    else:
        print("No calculated fields found in the first datasource.")

    # Q7 - Column Mapping
    print("\nQ7 - Column Mapping")
    print("-" * 30)
    # Check if there's any reference to the source column/metadata record
    # Based on previous read, Field is initialized with column_xml or metadata_xml
    print(f"Field ID: {field.id}")
    # The 'id' usually corresponds to the 'name' attribute in XML, which is the internal [Bracketed] name.

    # Q8 - XML Backing Object
    print("\nQ8 - XML Backing Object")
    print("-" * 30)
    if hasattr(field, 'xml'):
        print(f"XML attribute type: {type(field.xml)}")
        if field.xml is not None:
            print(f"XML Root Tag: {field.xml.tag}")
    else:
        print("No 'xml' property found.")

if __name__ == "__main__":
    sample_twb = "sample_workbooks/Sample.twb"
    inspect_field_objects(sample_twb)

import os
import sys
import inspect
from tableaudocumentapi import Workbook

def inspect_worksheet_objects(workbook_path):
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

    # Q1 - Workbook Worksheet Collection
    print("\nQ1 - Workbook Worksheet Collection")
    print("-" * 30)
    worksheets = wb.worksheets
    print(f"Collection type: {type(worksheets)}")
    print(f"Number of worksheets: {len(worksheets)}")
    
    if len(worksheets) > 0:
        first_sheet = worksheets[0]
        print(f"First element type: {type(first_sheet)}")
        print(f"First element value: {repr(first_sheet)}")
    else:
        print("No worksheets found in this workbook.")

    # Q2 - Worksheet Object Type
    print("\nQ2 - Worksheet Object Type")
    print("-" * 30)
    if len(worksheets) > 0:
        sheet = worksheets[0]
        print(f"Class: {type(sheet).__name__}")
        print(f"Module: {type(sheet).__module__}")
        print(f"Representation: {repr(sheet)}")
    else:
        print("N/A (No worksheets)")

    # Q3 - Public Properties
    print("\nQ3 - Public Properties")
    print("-" * 30)
    if len(worksheets) > 0:
        sheet = worksheets[0]
        public_members = [m for m in dir(sheet) if not m.startswith("_")]
        print(f"Public members: {public_members}")
        
        # Specifically check for properties mentioned in TASK_002
        expected_props = ['name', 'caption', 'datasource', 'fields', 'tables', 'views', 'formatting']
        for prop in expected_props:
            has_prop = hasattr(sheet, prop)
            print(f"Has '{prop}'? {has_prop}")
            if has_prop:
                try:
                    val = getattr(sheet, prop)
                    print(f"  Value: {val}")
                except Exception as e:
                    print(f"  Error accessing '{prop}': {e}")
    else:
        print("N/A (No worksheets)")

    # Q4 - Private Members
    print("\nQ4 - Private Members")
    print("-" * 30)
    if len(worksheets) > 0:
        sheet = worksheets[0]
        private_members = [m for m in dir(sheet) if m.startswith("_") and not (m.startswith("__") and m.endswith("__"))]
        print(f"Private members: {private_members}")
        
        # Specifically check for examples mentioned in TASK_002
        expected_privates = ['_worksheetXML', '_xml', '_element', '_parent']
        for priv in expected_privates:
            has_priv = hasattr(sheet, priv)
            print(f"Has '{priv}'? {has_priv}")
            if has_priv:
                try:
                    val = getattr(sheet, priv)
                    print(f"  Value: {type(val)}")
                except Exception as e:
                    print(f"  Error accessing '{priv}': {e}")
    else:
        print("N/A (No worksheets)")

    # Q5 - XML Backing Object
    print("\nQ5 - XML Backing Object")
    print("-" * 30)
    if len(worksheets) > 0:
        sheet = worksheets[0]
        xml_related = [m for m in dir(sheet) if 'xml' in m.lower() or 'element' in m.lower()]
        print(f"XML/Element related members: {xml_related}")
        
        found_xml = False
        for m in xml_related:
            val = getattr(sheet, m)
            print(f"Member '{m}' type: {type(val)}")
            found_xml = True
        
        if not found_xml:
            print("No XML backing object found on the worksheet element itself.")
    else:
        print("N/A (No worksheets)")

    # Q6 - Datasource References
    print("\nQ6 - Datasource References")
    print("-" * 30)
    if len(worksheets) > 0:
        sheet = worksheets[0]
        ds_related = [m for m in dir(sheet) if 'datasource' in m.lower()]
        print(f"Datasource related members: {ds_related}")
        
        if not ds_related:
            print("No datasource information directly available from the worksheet object.")
    else:
        print("N/A (No worksheets)")

    # Investigation beyond the collection
    print("\nWorkbook-level Worksheet Inspection")
    print("-" * 30)
    wb_privates = [m for m in dir(wb) if m.startswith("_") and not (m.startswith("__") and m.endswith("__"))]
    print(f"Workbook private members: {wb_privates}")
    
    if '_workbookRoot' in wb_privates:
        root = wb._workbookRoot
        print(f"Workbook Root Tag: {root.tag}")
        worksheets_tag = root.find('.//worksheets')
        if worksheets_tag is not None:
            print(f"Found 'worksheets' element in XML. Number of children: {len(worksheets_tag)}")
            first_ws_el = worksheets_tag[0]
            print(f"First worksheet element tag: {first_ws_el.tag}")
            print(f"First worksheet element attributes: {first_ws_el.attrib}")
        else:
            print("Could not find 'worksheets' element in XML via .//worksheets")

if __name__ == "__main__":
    sample_twb = "sample_workbooks/Sample.twb"
    inspect_worksheet_objects(sample_twb)

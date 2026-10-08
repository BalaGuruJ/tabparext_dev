"""
verify_field_population.py

Purpose
-------
Verify exactly where and how the Tableau Document API populates
Field.worksheets during workbook loading.

This script performs source-code inspection only.
It does NOT inspect workbook XML or implement lineage extraction.

Expected Output
---------------
- Location of workbook.py
- Location of field.py
- Source code for Field.add_used_in()
- Source code showing where add_used_in() is called
- Evidence of datasource-dependencies processing
"""

import inspect
import os
import re

import tableaudocumentapi.workbook as workbook_module
import tableaudocumentapi.field as field_module


def print_header(title):
    print("\n" + "=" * 80)
    print(title)
    print("=" * 80)


def search_file(filepath, patterns, context=8):
    """
    Search a Python file for patterns and print surrounding lines.
    """

    print_header(f"Searching: {filepath}")

    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    found_any = False

    for pattern in patterns:
        regex = re.compile(pattern)

        for i, line in enumerate(lines):
            if regex.search(line):
                found_any = True

                print(f"\nPattern Found: {pattern}")
                print(f"Line: {i + 1}")
                print("-" * 80)

                start = max(0, i - context)
                end = min(len(lines), i + context + 1)

                for j in range(start, end):
                    prefix = ">>" if j == i else "  "
                    print(f"{prefix} {j+1:4d}: {lines[j].rstrip()}")

    if not found_any:
        print("No matching patterns found.")


def main():

    workbook_path = inspect.getsourcefile(workbook_module)
    field_path = inspect.getsourcefile(field_module)

    print_header("Module Locations")

    print("Workbook module:")
    print(workbook_path)

    print()

    print("Field module:")
    print(field_path)

    #########################################################

    print_header("Field.add_used_in()")

    print(inspect.getsource(field_module.Field.add_used_in))

    #########################################################

    search_file(
        workbook_path,
        patterns=[
            r"add_used_in",
            r"datasource-dependencies",
            r"worksheets",
            r"used_in",
            r"dependency",
            r"FieldDictionary",
        ],
    )

    #########################################################

    print_header("Summary")

    print("""
Review the output and answer the following:

1. Is Field.add_used_in() called?
2. Which module calls it?
3. During what operation?
4. Is datasource-dependencies involved?
5. Is worksheet information added during workbook loading?

If all answers are YES, then Field.worksheets is verified as
being populated during workbook initialization.
""")


if __name__ == "__main__":
    main()
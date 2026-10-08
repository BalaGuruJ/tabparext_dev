# TASK_001_Library_Inspection.md

---

# TASK 001 – Tableau Document API Library Inspection

**Task ID:** TASK_001

**Phase:** Research Phase

**Priority:** High

**Status:** Pending

**Estimated Time:** 30–60 Minutes

---

# Objective

Perform a comprehensive inspection of the installed **tableaudocumentapi** Python package.

The objective is to understand the library architecture before writing any Tableau metadata extraction code.

This task is purely **library research**.

Do **NOT** parse any Tableau workbook in this task.

---

# Background

The Tableau Document API provides a high-level Python interface for reading Tableau Workbook (.twb/.twbx) files.

However, the official documentation does not completely describe the available classes, methods, hidden members, object hierarchy, or internal relationships.

Before implementing metadata extraction, we need to understand exactly what the library exposes.

---

# Scope

This task is limited to inspecting the installed Python package.

The inspection should include:

- Package information
- Installed version
- Package location
- Available modules
- Available classes
- Class inheritance
- Constructor signatures
- Public methods
- Private methods
- Public properties
- Hidden/private attributes
- Available docstrings

---

# Do NOT

The following are explicitly out of scope.

- Do NOT open a Tableau workbook.
- Do NOT inspect Sample.twb.
- Do NOT parse XML.
- Do NOT generate lineage.
- Do NOT modify any Tableau file.

---

# Inputs

No Tableau workbook is required.

Required dependency:

- tableaudocumentapi

Standard Python modules may be used, including:

- inspect
- pkgutil
- importlib
- pathlib
- json
- os
- sys

---

# Expected Deliverables

## 1. Python Script

Generate the following script:

```
inspection/scripts/inspect_library.py
```

This script should be reusable.

---

## 2. Raw Inspection Output

When executed, the script must automatically generate:

```
inspection/output/library_inspection.txt
```

This file should contain a human-readable inspection report.

---

## 3. Structured Output

Generate:

```
inspection/output/library_inspection.json
```

This file should contain the structured inspection results in JSON format for future automation.

---

## 4. Documentation

After reviewing the generated outputs, create:

```
Responses/DOC_001_LibraryInspection.md
```

This document should summarize the findings and observations.

---

# Inspection Requirements

The script should discover and document:

## Package Information

- Package Name
- Package Version
- Installation Path

---

## Modules

List every discoverable module within the package.

---

## Classes

For every class found:

- Class Name
- Module
- Base Class
- Constructor Signature
- Public Methods
- Private Methods
- Properties
- Hidden Members
- Available Docstring

---

## Summary

Include:

- Total Modules
- Total Classes
- Total Public Methods
- Total Private Methods

---

# Console Output

The console should display only concise progress messages.

Example:

```
Starting Library Inspection...

Discovering modules...

Inspecting classes...

Writing TXT report...

Writing JSON report...

Inspection Complete.
```

The detailed inspection must be written to the output files rather than printed to the console.

---

# Success Criteria

The task is complete when:

- inspect_library.py has been generated.
- library_inspection.txt has been created.
- library_inspection.json has been created.
- DOC_001_LibraryInspection.md has been written.
- The generated script executes successfully without errors.

---

# Notes

This task is intentionally limited to library inspection only.

Workbook inspection begins in TASK_002.

No Tableau workbook should be opened during this task.

---

# Next Task

TASK_002_Workbook_Object_Inspection

This task will inspect a real Workbook object created from a sample Tableau workbook and document every accessible property and relationship.
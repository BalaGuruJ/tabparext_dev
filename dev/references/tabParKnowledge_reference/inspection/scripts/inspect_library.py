import inspect
import pkgutil
import importlib
import json
import os
import sys
from typing import Any, Dict, List, Optional
import tableaudocumentapi

def get_class_info(cls: type) -> Dict[str, Any]:
    """Extracts detailed information about a class."""
    info = {
        "name": cls.__name__,
        "module": cls.__module__,
        "base_classes": [base.__name__ for base in cls.__bases__],
        "docstring": inspect.getdoc(cls),
        "constructor_signature": None,
        "public_methods": [],
        "private_methods": [],
        "properties": [],
        "hidden_members": []
    }

    try:
        info["constructor_signature"] = str(inspect.signature(cls.__init__))
    except (ValueError, TypeError):
        pass

    for name, member in inspect.getmembers(cls):
        if inspect.isfunction(member) or inspect.ismethod(member):
            if name.startswith("__") and name.endswith("__"):
                continue
            elif name.startswith("_"):
                info["private_methods"].append(name)
            else:
                info["public_methods"].append(name)
        elif isinstance(member, property):
            info["properties"].append(name)
        else:
            if not (name.startswith("__") and name.endswith("__")):
                info["hidden_members"].append(name)

    return info

def inspect_package(package_name: str) -> Dict[str, Any]:
    """Inspects a package and its submodules."""
    package = importlib.import_module(package_name)
    package_path = os.path.dirname(package.__file__)

    results = {
        "package_info": {
            "name": package_name,
            "version": getattr(package, "__version__", "unknown"),
            "path": package_path
        },
        "modules": [],
        "classes": [],
        "summary": {
            "total_modules": 0,
            "total_classes": 0,
            "total_public_methods": 0,
            "total_private_methods": 0
        }
    }

    # Discover modules
    for _, modname, ispkg in pkgutil.walk_packages([package_path], package_name + "."):
        results["modules"].append(modname)
        try:
            module = importlib.import_module(modname)
            for name, obj in inspect.getmembers(module):
                if inspect.isclass(obj) and obj.__module__.startswith(package_name):
                    class_info = get_class_info(obj)
                    results["classes"].append(class_info)
                    results["summary"]["total_classes"] += 1
                    results["summary"]["total_public_methods"] += len(class_info["public_methods"])
                    results["summary"]["total_private_methods"] += len(class_info["private_methods"])
        except ImportError as e:
            print(f"Error importing module {modname}: {e}")

    results["summary"]["total_modules"] = len(results["modules"])
    return results

def write_txt_report(results: Dict[str, Any], file_path: str):
    """Writes a human-readable text report."""
    with open(file_path, "w") as f:
        f.write(f"Library Inspection Report: {results['package_info']['name']}\n")
        f.write("=" * 50 + "\n\n")
        
        f.write("Package Information:\n")
        for k, v in results["package_info"].items():
            f.write(f"  {k.replace('_', ' ').title()}: {v}\n")
        f.write("\n")

        f.write(f"Modules Found ({results['summary']['total_modules']}):\n")
        for mod in results["modules"]:
            f.write(f"  - {mod}\n")
        f.write("\n")

        f.write(f"Classes Found ({results['summary']['total_classes']}):\n")
        for cls in results["classes"]:
            f.write("-" * 30 + "\n")
            f.write(f"Class: {cls['name']}\n")
            f.write(f"Module: {cls['module']}\n")
            f.write(f"Bases: {', '.join(cls['base_classes'])}\n")
            f.write(f"Signature: {cls['constructor_signature']}\n")
            f.write(f"Docstring: {cls['docstring']}\n\n")
            
            f.write("Public Methods:\n")
            for m in sorted(cls["public_methods"]): f.write(f"  - {m}\n")
            
            f.write("\nPrivate Methods:\n")
            for m in sorted(cls["private_methods"]): f.write(f"  - {m}\n")
            
            f.write("\nProperties:\n")
            for p in sorted(cls["properties"]): f.write(f"  - {p}\n")
            
            f.write("\nHidden/Other Members:\n")
            for h in sorted(cls["hidden_members"]): f.write(f"  - {h}\n")
            f.write("\n")

        f.write("Summary Statistics:\n")
        for k, v in results["summary"].items():
            f.write(f"  {k.replace('_', ' ').title()}: {v}\n")

def main():
    print("Starting Library Inspection...")
    
    package_name = "tableaudocumentapi"
    
    print("\nDiscovering modules and inspecting classes...")
    results = inspect_package(package_name)
    
    output_dir = "inspection/output"
    os.makedirs(output_dir, exist_ok=True)
    
    txt_path = os.path.join(output_dir, "library_inspection.txt")
    print(f"Writing TXT report to {txt_path}...")
    write_txt_report(results, txt_path)
    
    json_path = os.path.join(output_dir, "library_inspection.json")
    print(f"Writing JSON report to {json_path}...")
    with open(json_path, "w") as f:
        json.dump(results, f, indent=2)
    
    print("\nInspection Complete.")

if __name__ == "__main__":
    main()

# Patch Notes

## Python 3.12 Compatibility

### Issue

The latest Tableau Document API (v0.11) is not compatible with Python 3.12 because it imports:

```python
from distutils.version import LooseVersion as Version
```

The `distutils` package was removed in Python 3.12.

### Fix

File:

```
.venv/lib/python3.12/site-packages/tableaudocumentapi/xfile.py
```

Replace:

```python
from distutils.version import LooseVersion as Version
```

With:

```python
from packaging.version import Version
```

### Verification

```bash
python -c "import tableaudocumentapi"
```

Expected:

```
tableaudocumentapi imported successfully
```
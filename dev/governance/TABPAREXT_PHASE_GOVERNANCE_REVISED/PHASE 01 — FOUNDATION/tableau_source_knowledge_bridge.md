# Tableau Source-Knowledge Bridge (Phase 01)

## 1. Overview
This artifact establishes the formal bridge between development-time deterministic evidence (`.twb` XML fixtures) and runtime Tableau Extension API capabilities. It separates what is known from static metadata analysis from what must be discovered, verified, or queried dynamically at runtime via the Tableau Extensions API.

## 2. TWB Known Capabilities (Deterministic Evidence)
From the `.twb` fixture (`twb_fixture.twb`), we have explicit, deterministic knowledge of:
- **Workbook Structure:** Hierarchical containment of data sources, connections, worksheets, dashboards, and window layouts.
- **Data Source Schema:** Tables, columns, datatypes (string, date, real), roles (dimension, measure), and basic calculations.
- **Worksheet Layout:** Row and column shelf definitions, dimensions/measures used in specific views.
- **Dashboard Composition:** Zone hierarchies, container arrangements (horizontal/vertical layouts), and embedded worksheet references.

## 3. Runtime Unknowns (Tableau Extension API Domain)
The static TWB fixture does **not** provide runtime state or interactive behavior. The following are runtime unknowns that cannot be determined from `.twb` files alone:
- **Active Filter States:** Dynamic user-selected filters applied in the running dashboard.
- **Mark Selection:** Which marks (rows/columns) are currently selected or highlighted by the user.
- **Underlying vs. Summary Data Volume:** Exact row counts and pagination requirements for large datasets rendered at runtime.
- **Extension API Initialization Context:** Successful handshake and environment load via `tableau.extensions.initializeAsync()`.
- **Asynchronous Data Retrieval Performance:** Latency and memory consumption when calling `worksheet.getSummaryDataAsync()` or `worksheet.getUnderlyingDataAsync()` in a live browser context.

## 4. Phase 02 To-Verify Items
Phase 02 (Tableau Integration & Data) will experimentally verify the following items against live Tableau Extension API environments:
1. **API Initialization:** Confirm correct execution of `tableau.extensions.initializeAsync()` inside the `.trex` extension sandbox.
2. **Dashboard Worksheet Discovery:** Verify how dashboard worksheets are enumerated using `tableau.extensions.dashboardContent.dashboard.worksheets`.
3. **Data Extraction API:** Test `worksheet.getSummaryDataAsync()` to extract tabular data for pagination processing.
4. **Parameter & Filter Interaction:** Verify how dashboard parameters and filters can be read or listened to via event listeners (`tableau.TableauEventEnum.FilterChanged`).
5. **Bridge Validation:** Compare extracted runtime worksheet data against the structural baseline established by the Phase 01 `.twb` fixture.

## 5. Architectural Rule
- TWB XML metadata and live Extension API data are separate inputs.
- TWB structure must never be assumed as proof of Extension API runtime availability.
- Phase 02 implementation must rely exclusively on verified Tableau Extension API methods while referencing the TWB fixture for validation benchmarks.

/**
 * Tableau Pagination Extension - App Entry Point
 * Phase 02 Task 02.01: Tableau Extensions API Initialization
 */

document.addEventListener("DOMContentLoaded", () => {
    const statusCard = document.getElementById("status-card");
    const statusMessage = document.getElementById("status-message");

    function updateStatus(state, message) {
        if (!statusCard || !statusMessage) return;
        statusCard.className = `status-card status-${state}`;
        statusMessage.textContent = message;
        console.log(`[Tableau Init] [${state.toUpperCase()}] ${message}`);
    }

    // Check if Tableau Extensions API is present and loaded
    if (typeof tableau === "undefined" || !tableau.extensions) {
        updateStatus("standalone", "Standalone browser execution detected. Tableau Extensions API is not present. Load this extension inside Tableau Desktop via pagination.trex.");
        return;
    }

    updateStatus("pending", "Calling tableau.extensions.initializeAsync()...");

    try {
        tableau.extensions.initializeAsync().then(
            () => {
                updateStatus("success", "Tableau Extensions API initialized successfully.");
            },
            (err) => {
                const errMessage = err && err.message ? err.message : String(err);
                updateStatus("error", `Tableau Extensions API initialization failed: ${errMessage}`);
            }
        );
    } catch (ex) {
        const exMessage = ex && ex.message ? ex.message : String(ex);
        updateStatus("error", `Exception during initializeAsync(): ${exMessage}`);
    }
});

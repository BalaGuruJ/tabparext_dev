/**
 * TABPAREXT — Summary API Diagnostic Unit Tests
 */

import test from 'node:test';
import assert from 'node:assert';
import { runSummaryApiDiagnostic } from './summary_api_diagnostic.js';

// Setup minimal browser DOM global stubs for downloadJson testing
if (typeof globalThis.document === 'undefined') {
    globalThis.document = {
        createElement: () => ({
            href: '',
            download: '',
            click: () => {},
            remove: () => {}
        }),
        body: {
            appendChild: () => {}
        }
    };
}

if (typeof globalThis.URL === 'undefined' || !globalThis.URL.createObjectURL) {
    globalThis.URL = globalThis.URL || {};
    globalThis.URL.createObjectURL = () => 'blob:mock-url';
    globalThis.URL.revokeObjectURL = () => {};
}

if (typeof globalThis.Blob === 'undefined') {
    globalThis.Blob = class Blob {
        constructor(content, options) {
            this.content = content;
            this.options = options;
        }
    };
}

if (typeof globalThis.window === 'undefined') {
    globalThis.window = globalThis;
}

test('runSummaryApiDiagnostic - Throws if worksheet is missing', async () => {
    await assert.rejects(
        async () => {
            await runSummaryApiDiagnostic(null);
        },
        /A Tableau worksheet must be supplied/
    );
});

test('runSummaryApiDiagnostic - Successful getSummaryDataAsync and getSummaryDataReaderAsync', async () => {
    let released = false;

    const mockWorksheet = {
        name: 'Sales Worksheet',
        async getSummaryDataAsync() {
            return {
                totalRowCount: 2,
                columns: [
                    { fieldName: 'Region', dataType: 'string', name: 'Region' },
                    { fieldName: 'Sales', dataType: 'float', name: 'Sales' }
                ],
                data: [
                    [{ value: 'East', formattedValue: 'East' }, { value: 100, formattedValue: '$100' }],
                    [{ value: 'West', formattedValue: 'West' }, { value: 200, formattedValue: '$200' }]
                ]
            };
        },
        async getSummaryDataReaderAsync() {
            return {
                pageCount: 2,
                totalRowCount: 2,
                async getPageAsync(pageIndex) {
                    if (pageIndex === 0) {
                        return {
                            columns: [
                                { fieldName: 'Region', dataType: 'string', name: 'Region' },
                                { fieldName: 'Sales', dataType: 'float', name: 'Sales' }
                            ],
                            data: [
                                [{ value: 'East', formattedValue: 'East' }, { value: 100, formattedValue: '$100' }]
                            ]
                        };
                    }
                    return {
                        columns: [
                            { fieldName: 'Region', dataType: 'string', name: 'Region' },
                            { fieldName: 'Sales', dataType: 'float', name: 'Sales' }
                        ],
                        data: [
                            [{ value: 'West', formattedValue: 'West' }, { value: 200, formattedValue: '$200' }]
                        ]
                    };
                },
                async releaseAsync() {
                    released = true;
                }
            };
        }
    };

    const payload = await runSummaryApiDiagnostic(mockWorksheet, 'Executive Dashboard');

    assert.strictEqual(payload.schemaVersion, 'tabpagext.summary-api-diagnostic.v1');
    assert.strictEqual(payload.dashboardName, 'Executive Dashboard');
    assert.strictEqual(payload.worksheetName, 'Sales Worksheet');

    // getSummaryDataAsync assertion
    const summaryData = payload.results.getSummaryDataAsync;
    assert.strictEqual(summaryData.status, 'success');
    assert.strictEqual(summaryData.reportedTotalRowCount, 2);
    assert.strictEqual(summaryData.rowsReturned, 2);
    assert.strictEqual(summaryData.columnCount, 2);
    assert.strictEqual(summaryData.rowCountMatches, true);

    // getSummaryDataReaderAsync assertion
    const summaryReader = payload.results.getSummaryDataReaderAsync;
    assert.strictEqual(summaryReader.status, 'success');
    assert.strictEqual(summaryReader.pageCount, 2);
    assert.strictEqual(summaryReader.pagesRead, 2);
    assert.strictEqual(summaryReader.rowsRead, 2);
    assert.strictEqual(summaryReader.rowCountMatches, true);
    assert.strictEqual(summaryReader.releaseStatus, 'released');
    assert.strictEqual(released, true);

    assert.strictEqual(globalThis.__tabPagExtSummaryApiDiagnostic, payload);
});

test('runSummaryApiDiagnostic - Reader releases when getPageAsync fails', async () => {
    let released = false;

    const mockWorksheet = {
        name: 'Faulty Reader Worksheet',
        async getSummaryDataAsync() {
            return { columns: [], data: [] };
        },
        async getSummaryDataReaderAsync() {
            return {
                pageCount: 2,
                totalRowCount: 10,
                async getPageAsync() {
                    throw new Error('Network error during page fetch');
                },
                async releaseAsync() {
                    released = true;
                }
            };
        }
    };

    const payload = await runSummaryApiDiagnostic(mockWorksheet, 'Test Dashboard');
    const summaryReader = payload.results.getSummaryDataReaderAsync;

    assert.strictEqual(summaryReader.status, 'error');
    assert.strictEqual(summaryReader.error.message, 'Network error during page fetch');
    assert.strictEqual(summaryReader.releaseStatus, 'released');
    assert.strictEqual(released, true);
});

test('runSummaryApiDiagnostic - Handles unavailable API methods on worksheet', async () => {
    const mockWorksheet = {
        name: 'Legacy Worksheet'
        // Neither getSummaryDataAsync nor getSummaryDataReaderAsync present
    };

    const payload = await runSummaryApiDiagnostic(mockWorksheet);

    assert.strictEqual(payload.results.getSummaryDataAsync.status, 'unavailable');
    assert.strictEqual(payload.results.getSummaryDataReaderAsync.status, 'unavailable');
});

test('runSummaryApiDiagnostic - Handles getSummaryDataAsync exception', async () => {
    const mockWorksheet = {
        name: 'Error Worksheet',
        async getSummaryDataAsync() {
            throw new Error('Summary data fetch failed');
        },
        async getSummaryDataReaderAsync() {
            return {
                pageCount: 0,
                totalRowCount: 0,
                async getPageAsync() { return { columns: [], data: [] }; },
                async releaseAsync() {}
            };
        }
    };

    const payload = await runSummaryApiDiagnostic(mockWorksheet);

    assert.strictEqual(payload.results.getSummaryDataAsync.status, 'error');
    assert.strictEqual(payload.results.getSummaryDataAsync.error.message, 'Summary data fetch failed');
});

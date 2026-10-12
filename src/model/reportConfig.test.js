/**
 * tabPagExt — Structure-Only Reporting Data Contract Unit Tests
 */

import test from 'node:test';
import assert from 'node:assert';
import { createBlankReportingContract } from './reportConfig.js';

test('createBlankReportingContract - Returns valid structure with empty collections', () => {
    const contract = createBlankReportingContract();

    assert.strictEqual(contract.schemaVersion, 'tabpagext.reporting-contract.v1');
    assert.deepStrictEqual(contract.metadata, {
        dashboardName: null,
        worksheetName: null,
        capturedAt: null,
        viewType: null
    });
    assert.strictEqual(contract.totalRowCount, null);
    assert.strictEqual(contract.columnCount, 0);
    assert.deepStrictEqual(contract.columns, []);
    assert.deepStrictEqual(contract.rows, []);
});

test('createBlankReportingContract - Accepts initial metadata without embedding sample data', () => {
    const contract = createBlankReportingContract({
        dashboardName: 'Dynamic Dashboard',
        worksheetName: 'Dynamic Sheet',
        capturedAt: '2026-10-11T00:00:00.000Z',
        viewType: 'simple-table'
    });

    assert.strictEqual(contract.metadata.dashboardName, 'Dynamic Dashboard');
    assert.strictEqual(contract.metadata.worksheetName, 'Dynamic Sheet');
    assert.strictEqual(contract.metadata.capturedAt, '2026-10-11T00:00:00.000Z');
    assert.strictEqual(contract.metadata.viewType, 'simple-table');
    assert.deepStrictEqual(contract.columns, []);
    assert.deepStrictEqual(contract.rows, []);
});

test('Reporting Contract Structure - Supports 2-column simple table structure via neutral test fixtures', () => {
    const contract = createBlankReportingContract({ viewType: 'simple-table' });
    contract.totalRowCount = 10;
    contract.columnCount = 2;
    contract.columns = [
        { ordinal: 0, fieldName: 'Category', dataType: 'string', fieldId: '[synthetic].[Category]', index: 0, isReferenced: true },
        { ordinal: 1, fieldName: 'Metric', dataType: 'float', fieldId: '[synthetic].[Metric]', index: 1, isReferenced: true }
    ];
    contract.rows = [
        [
            { value: 'Alpha', formattedValue: 'Alpha' },
            { value: 123.45, formattedValue: '123.45' }
        ]
    ];

    assert.strictEqual(contract.metadata.viewType, 'simple-table');
    assert.strictEqual(contract.totalRowCount, 10);
    assert.strictEqual(contract.columnCount, 2);
    assert.strictEqual(contract.columns.length, 2);
    assert.strictEqual(contract.columns[0].fieldName, 'Category');
    assert.strictEqual(contract.columns[1].fieldName, 'Metric');
    assert.strictEqual(contract.rows.length, 1);
    assert.strictEqual(contract.rows[0][0].value, 'Alpha');
    assert.strictEqual(contract.rows[0][1].formattedValue, '123.45');
});

test('Reporting Contract Structure - Supports 3-column table matrix structure via neutral test fixtures', () => {
    const contract = createBlankReportingContract({ viewType: 'table-matrix' });
    contract.totalRowCount = 20;
    contract.columnCount = 3;
    contract.columns = [
        { ordinal: 0, fieldName: 'Category', dataType: 'string', fieldId: '[synthetic].[Category]', index: 0, isReferenced: true },
        { ordinal: 1, fieldName: 'ColumnB', dataType: 'string', fieldId: '[synthetic].[ColumnB]', index: 1, isReferenced: true },
        { ordinal: 2, fieldName: 'ColumnC', dataType: 'float', fieldId: '[synthetic].[ColumnC]', index: 2, isReferenced: true }
    ];
    contract.rows = [
        [
            { value: 'Alpha', formattedValue: 'Alpha' },
            { value: '[synthetic].[Ref]', formattedValue: 'Reference' },
            { value: 987.65, formattedValue: '987.65' }
        ]
    ];

    assert.strictEqual(contract.metadata.viewType, 'table-matrix');
    assert.strictEqual(contract.columnCount, 3);
    assert.strictEqual(contract.columns[1].fieldName, 'ColumnB');
    assert.strictEqual(contract.columns[2].fieldName, 'ColumnC');
    assert.strictEqual(contract.rows[0][2].value, 987.65);
});

/**
 * TABPAREXT — Runtime Evidence Collector v2 Foundation Unit Tests
 * Tests capability inventory, verification/invocation/result statuses,
 * allowlist configuration validation, and non-invocation constraints.
 */

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import {
    CapabilityInventory,
    VERIFICATION_STATUS,
    INVOCATION_STATUS,
    RESULT_STATUS,
    BASELINE_CAPABILITIES
} from './capability_inventory.js';
import {
    EvidenceCaptureConfig,
    DEFAULT_CAPTURE_CONFIG
} from './evidence_config.js';
import { EvidenceCollector } from './evidence_collector.js';
import { Extractor } from './extractor.js';

test('CapabilityInventory - Initialization and Uniqueness', () => {
    const inventory = new CapabilityInventory();
    const validation = inventory.validateInventory();
    assert.strictEqual(validation.valid, true, 'Inventory should validate successfully');
    assert.strictEqual(validation.count, BASELINE_CAPABILITIES.length, 'All baseline capabilities should be registered');

    // Test uniqueness constraint
    assert.throws(() => {
        inventory.registerCapability({
            capabilityId: 'cap_dashboard_name', // duplicate ID
            objectName: 'Dashboard',
            memberName: 'name',
            memberKind: 'property',
            provenance: 'Test Source',
            verificationStatus: VERIFICATION_STATUS.VERIFIED_SUPPORTED
        });
    }, /Duplicate capabilityId/);
});

test('CapabilityInventory - Correspondence Row Mapping (1-22)', () => {
    const inventory = new CapabilityInventory();
    for (let rowId = 1; rowId <= 22; rowId++) {
        const caps = inventory.getByCorrespondenceRow(rowId);
        // Rows 1-22 should have mapping definitions or at least be queryable without error
        assert.ok(Array.isArray(caps), `Query for row ${rowId} should return an array`);
    }

    const row1Caps = inventory.getByCorrespondenceRow(1);
    assert.strictEqual(row1Caps.length, 1);
    assert.strictEqual(row1Caps[0].capabilityId, 'cap_dashboard_name');
});

test('Status Distinctions - Verification, Invocation, Result', () => {
    // Verify distinct status constants exist and do not conflate meanings
    assert.strictEqual(VERIFICATION_STATUS.DOCUMENTED, 'DOCUMENTED');
    assert.strictEqual(VERIFICATION_STATUS.VERIFIED_SUPPORTED, 'VERIFIED_SUPPORTED');
    assert.strictEqual(VERIFICATION_STATUS.RUNTIME_DISCOVERED, 'RUNTIME_DISCOVERED');

    assert.strictEqual(INVOCATION_STATUS.INVOKED, 'INVOKED');
    assert.strictEqual(INVOCATION_STATUS.NOT_ATTEMPTED, 'NOT_ATTEMPTED');
    assert.strictEqual(INVOCATION_STATUS.NOT_APPLICABLE, 'NOT_APPLICABLE');

    assert.strictEqual(RESULT_STATUS.SUCCESS, 'SUCCESS');
    assert.strictEqual(RESULT_STATUS.UNAVAILABLE, 'UNAVAILABLE');
    assert.strictEqual(RESULT_STATUS.EXCEPTION, 'EXCEPTION');

    // Ensure verification and invocation statuses are completely separate enums
    assert.notStrictEqual(VERIFICATION_STATUS.VERIFIED_SUPPORTED, INVOCATION_STATUS.INVOKED);
});

test('EvidenceCaptureConfig - Allowlist and Validation', () => {
    const config = new EvidenceCaptureConfig({
        mode: 'selective',
        enabledDomains: ['dashboard.name'],
        approvedOperations: ['getSummaryDataAsync']
    });

    const validation = config.validateConfig();
    assert.strictEqual(validation.valid, true, 'Default configuration should be valid');

    assert.strictEqual(config.isDomainEnabled('dashboard.name'), true);
    assert.strictEqual(config.isDomainEnabled('unauthorized.domain'), false);

    assert.strictEqual(config.isOperationApproved('getSummaryDataAsync'), true);
    assert.strictEqual(config.isOperationApproved('unapprovedOperation'), false);

    // Verify config cannot trigger API invocations (pure config object)
    const bounds = config.getBounds();
    assert.ok(bounds.maxDataRows > 0);
    const exclusions = config.getExclusions();
    assert.strictEqual(exclusions.excludeCredentials, true);
});

test('EvidenceCaptureConfig - Invalid Configuration Handling', () => {
    const invalidMode = new EvidenceCaptureConfig({ mode: 'invalid_mode' });
    assert.strictEqual(invalidMode.validateConfig().valid, false);

    const invalidDomainsType = new EvidenceCaptureConfig({ enabledDomains: 'not_an_array' });
    assert.strictEqual(invalidDomainsType.validateConfig().valid, false);

    const invalidDomainValue = new EvidenceCaptureConfig({ enabledDomains: ['dashboard.name', ''] });
    assert.strictEqual(invalidDomainValue.validateConfig().valid, false);

    const invalidOpsValue = new EvidenceCaptureConfig({ approvedOperations: [123] });
    assert.strictEqual(invalidOpsValue.validateConfig().valid, false);

    const zeroBound = new EvidenceCaptureConfig({ bounds: { maxArrayElements: 0 } });
    assert.strictEqual(zeroBound.validateConfig().valid, false);

    const negativeBound = new EvidenceCaptureConfig({ bounds: { maxObjectDepth: -5 } });
    assert.strictEqual(negativeBound.validateConfig().valid, false);

    const nonFiniteBound = new EvidenceCaptureConfig({ bounds: { maxStringLength: NaN } });
    assert.strictEqual(nonFiniteBound.validateConfig().valid, false);

    const infiniteBound = new EvidenceCaptureConfig({ bounds: { maxDataRows: Infinity } });
    assert.strictEqual(infiniteBound.validateConfig().valid, false);

    const invalidExclusionType = new EvidenceCaptureConfig({ exclusions: { excludeCredentials: 'true' } });
    assert.strictEqual(invalidExclusionType.validateConfig().valid, false);
});

test('CapabilityInventory - Registration Validation and Defensive Copying', () => {
    const inventory = new CapabilityInventory();

    // Test missing provenance
    assert.throws(() => {
        inventory.registerCapability({
            capabilityId: 'cap_test_1',
            objectName: 'Test',
            memberName: 'test',
            memberKind: 'method',
            verificationStatus: VERIFICATION_STATUS.DOCUMENTED
        });
    }, /missing required provenance/);

    // Test invalid verification status
    assert.throws(() => {
        inventory.registerCapability({
            capabilityId: 'cap_test_2',
            objectName: 'Test',
            memberName: 'test',
            memberKind: 'method',
            provenance: 'Test Source',
            verificationStatus: 'INVALID_STATUS'
        });
    }, /Invalid verificationStatus/);

    // Test defensive copy on getCapability and getAllCapabilities
    const cap1 = inventory.getCapability('cap_dashboard_name');
    assert.ok(cap1);
    cap1.objectName = 'MutatedDashboard';
    cap1.phase03CorrespondenceRowIds.push(999);

    const cap1Fresh = inventory.getCapability('cap_dashboard_name');
    assert.strictEqual(cap1Fresh.objectName, 'Dashboard');
    assert.deepStrictEqual(cap1Fresh.phase03CorrespondenceRowIds, [1]);

    const allCaps = inventory.getAllCapabilities();
    const targetCap = allCaps.find(c => c.capabilityId === 'cap_dashboard_name');
    targetCap.provenance = 'Mutated Provenance';
    
    const targetCapFresh = inventory.getCapability('cap_dashboard_name');
    assert.notStrictEqual(targetCapFresh.provenance, 'Mutated Provenance');
});

test('CapabilityInventory - Recursive Defensive Copying & Complete Isolation', () => {
    const customCap = {
        capabilityId: 'cap_custom_recursive',
        objectName: 'Custom',
        memberName: 'customMethod',
        memberKind: 'method',
        provenance: 'Custom Test Source',
        verificationStatus: VERIFICATION_STATUS.DOCUMENTED,
        phase03CorrespondenceRowIds: [1, 2],
        restrictions: {
            nestedObj: { level: 1, data: 'original' },
            nestedArr: [{ id: 1, tags: ['a', 'b'] }]
        }
    };

    const inventory = new CapabilityInventory();
    inventory.registerCapability(customCap);

    // 1. Mutate original input object after registration
    customCap.objectName = 'MutatedObjectName';
    customCap.restrictions.nestedObj.level = 999;
    customCap.restrictions.nestedObj.data = 'mutated';
    customCap.restrictions.nestedArr[0].id = 999;
    customCap.restrictions.nestedArr[0].tags.push('c');
    customCap.phase03CorrespondenceRowIds.push(99);

    const fetched1 = inventory.getCapability('cap_custom_recursive');
    assert.strictEqual(fetched1.objectName, 'Custom');
    assert.strictEqual(fetched1.restrictions.nestedObj.level, 1);
    assert.strictEqual(fetched1.restrictions.nestedObj.data, 'original');
    assert.strictEqual(fetched1.restrictions.nestedArr[0].id, 1);
    assert.deepStrictEqual(fetched1.restrictions.nestedArr[0].tags, ['a', 'b']);
    assert.deepStrictEqual(fetched1.phase03CorrespondenceRowIds, [1, 2]);

    // 2. Mutate through getCapability()
    const fetched2 = inventory.getCapability('cap_custom_recursive');
    fetched2.restrictions.nestedObj.level = 500;
    fetched2.restrictions.nestedArr[0].tags.push('d');

    const fetched2Fresh = inventory.getCapability('cap_custom_recursive');
    assert.strictEqual(fetched2Fresh.restrictions.nestedObj.level, 1);
    assert.deepStrictEqual(fetched2Fresh.restrictions.nestedArr[0].tags, ['a', 'b']);

    // 3. Mutate through getAllCapabilities()
    const all = inventory.getAllCapabilities();
    const foundAll = all.find(c => c.capabilityId === 'cap_custom_recursive');
    foundAll.restrictions.nestedObj.data = 'all_mutated';
    foundAll.phase03CorrespondenceRowIds.push(88);

    const fetched3Fresh = inventory.getCapability('cap_custom_recursive');
    assert.strictEqual(fetched3Fresh.restrictions.nestedObj.data, 'original');
    assert.deepStrictEqual(fetched3Fresh.phase03CorrespondenceRowIds, [1, 2]);

    // 4. Mutate through getByCorrespondenceRow()
    const byRow = inventory.getByCorrespondenceRow(1);
    const foundRow = byRow.find(c => c.capabilityId === 'cap_custom_recursive');
    foundRow.restrictions.nestedArr[0].id = 42;

    const fetched4Fresh = inventory.getCapability('cap_custom_recursive');
    assert.strictEqual(fetched4Fresh.restrictions.nestedArr[0].id, 1);
});

test('EvidenceCaptureConfig - Capture-Mode Validation Edge Cases', () => {
    // 1. Omitted mode uses documented default ('selective')
    const omittedConfig = new EvidenceCaptureConfig({});
    assert.strictEqual(omittedConfig.config.mode, 'selective');
    assert.strictEqual(omittedConfig.validateConfig().valid, true);

    const undefinedModeConfig = new EvidenceCaptureConfig({ mode: undefined });
    assert.strictEqual(undefinedModeConfig.config.mode, 'selective');
    assert.strictEqual(undefinedModeConfig.validateConfig().valid, true);

    // 2. Valid modes remain accepted
    for (const validMode of ['minimal', 'selective', 'comprehensive']) {
        const validConfig = new EvidenceCaptureConfig({ mode: validMode });
        assert.strictEqual(validConfig.config.mode, validMode);
        assert.strictEqual(validConfig.validateConfig().valid, true, `Mode '${validMode}' should be valid`);
    }

    // 3. Explicit empty string is rejected
    const emptyStringConfig = new EvidenceCaptureConfig({ mode: '' });
    assert.strictEqual(emptyStringConfig.validateConfig().valid, false);

    // 4. Explicit null is rejected
    const nullConfig = new EvidenceCaptureConfig({ mode: null });
    assert.strictEqual(nullConfig.validateConfig().valid, false);

    // 5. Incorrectly typed values are rejected
    const numberConfig = new EvidenceCaptureConfig({ mode: 123 });
    assert.strictEqual(numberConfig.validateConfig().valid, false);

    const booleanConfig = new EvidenceCaptureConfig({ mode: true });
    assert.strictEqual(booleanConfig.validateConfig().valid, false);

    const objectConfig = new EvidenceCaptureConfig({ mode: { name: 'selective' } });
    assert.strictEqual(objectConfig.validateConfig().valid, false);

    // 6. Unsupported mode names are rejected
    const unsupportedConfig = new EvidenceCaptureConfig({ mode: 'ultra' });
    assert.strictEqual(unsupportedConfig.validateConfig().valid, false);
});

test('EvidenceCollector - Configuration Governance & Runtime Capability Discovery', async () => {
    try {
        // 1. Test domain gating on dashboard evidence collection
        EvidenceCollector.setConfig({
            enabledDomains: ['dashboard.objects'], // disable dashboard.name and dashboard.size
            approvedOperations: []
        });

        const mockDashboard = {
            name: 'Secret Dashboard',
            size: { behavior: 'automatic', minSize: 100, maxSize: 500 },
            objects: [{ id: 'obj1', name: 'Zone 1', type: 'worksheet', isFloating: false, isVisible: true }]
        };

        const dashEvidence = await EvidenceCollector.captureDashboardEvidence(mockDashboard);
        assert.strictEqual(dashEvidence.dashboardName, null, 'Disabled domain dashboard.name should yield null');
        assert.strictEqual(dashEvidence.dashboardSize, null, 'Disabled domain dashboard.size should yield null');
        assert.strictEqual(dashEvidence.objects.length, 1, 'Enabled domain dashboard.objects should be collected');
        assert.strictEqual(dashEvidence.objects[0].name, 'Zone 1');

        // 2. Test safe runtime capability discovery
        EvidenceCollector.setConfig({
            enabledDomains: ['*'],
            approvedOperations: [],
            exclusions: {
                excludeCredentials: true,
                excludeFunctions: false,
                excludeDomNodes: true,
                excludeBinaryBuffers: true
            }
        });

        const sampleTarget = {
            name: 'Test Worksheet',
            id: 'ws-123',
            getSummaryColumnsInfoAsync: function() { return Promise.resolve([]); },
            customRuntimeProperty: 'customVal'
        };

        const discovered = EvidenceCollector.discoverRuntimeCapabilities(sampleTarget, 'Worksheet');
        assert.ok(Array.isArray(discovered));

        // Check property vs method
        const nameCap = discovered.find(c => c.memberName === 'name');
        assert.ok(nameCap);
        assert.strictEqual(nameCap.verificationStatus, VERIFICATION_STATUS.VERIFIED_SUPPORTED);
        assert.strictEqual(nameCap.memberKind, 'property');

        const customCap = discovered.find(c => c.memberName === 'customRuntimeProperty');
        assert.ok(customCap);
        assert.strictEqual(customCap.verificationStatus, VERIFICATION_STATUS.RUNTIME_DISCOVERED);
        assert.strictEqual(customCap.invocationStatus, INVOCATION_STATUS.NOT_APPLICABLE);

        const methodCap = discovered.find(c => c.memberName === 'getSummaryColumnsInfoAsync');
        assert.ok(methodCap);
        assert.strictEqual(methodCap.verificationStatus, VERIFICATION_STATUS.VERIFIED_SUPPORTED);
        assert.strictEqual(methodCap.capabilityId, 'cap_worksheet_shelves');
        assert.strictEqual(methodCap.memberKind, 'method');
        assert.strictEqual(methodCap.invocationStatus, INVOCATION_STATUS.NOT_ATTEMPTED, 'Methods discovered passively must NOT be automatically invoked');
    } finally {
        // Reset singleton configuration after test
        EvidenceCollector.resetConfig();
    }
});

test('Phase 03 Report - 22-Row 3-Column Correspondence Structure and Source Values', () => {
    const reportPath = path.join(process.cwd(), 'validation_evidence', 'PHASE_03_CORRESPONDENCE_REPORT.md');
    assert.ok(fs.existsSync(reportPath), 'PHASE_03_CORRESPONDENCE_REPORT.md should exist');

    const content = fs.readFileSync(reportPath, 'utf8');

    // Extract Section 3 table lines
    const lines = content.split('\n');
    const tableHeaderIdx = lines.findIndex(l => l.includes('| Correspondence Row | API Runtime JSON Value | TWB Canonical JSON Value |'));
    assert.notStrictEqual(tableHeaderIdx, -1, 'Report should contain the 3-column table header');

    const tableRows = [];
    for (let i = tableHeaderIdx + 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line.startsWith('|')) {
            break;
        }
        tableRows.push(line);
    }

    assert.strictEqual(tableRows.length, 22, 'Section 3 table must visibly contain exactly 22 correspondence data rows');

    // Verify 3 columns structure per row
    tableRows.forEach((row, idx) => {
        const cells = row.split('|').map(c => c.trim()).slice(1, -1);
        assert.strictEqual(cells.length, 3, `Row ${idx + 1} must contain exactly 3 columns`);
    });

    // Verify source values accuracy
    assert.ok(content.includes('"validation"'), 'Report must include runtime dashboard name "validation"');
    assert.ok(content.includes('"test_worksheet"'), 'Report must include runtime worksheet name "test_worksheet"');
    assert.ok(content.includes('10 dashboards present; "validation" present'), 'Report must verify canonical dashboard presence');
    assert.ok(content.includes('91 worksheets present; "test_worksheet" present'), 'Report must verify canonical worksheet presence');
    assert.ok(content.includes('150 rows'), 'Report must include evaluated row count of 150 rows');
    assert.ok(content.includes('282 canonical fields'), 'Report must include TWB canonical field count of 282');
    assert.ok(content.includes('1080 column-instance'), 'Report must include TWB column instance count of 1080');
    assert.ok(content.includes('federated.0yylszc1nyju5o130dues14408ct'), 'Report must include datasource ID federated.0yylszc1nyju5o130dues14408ct');

    // Verify explicit missing value annotations
    assert.ok(content.includes('Missing in Runtime JSON'), 'Report must explicitly label missing runtime values');
    assert.ok(content.includes('Missing in Canonical JSON'), 'Report must explicitly label missing canonical values');
    assert.ok(content.includes('Not Exposed in Extensions API'), 'Report must explicitly label design-time-only values');
    assert.ok(content.includes('No static TWB equivalent'), 'Report must explicitly label runtime-only values');

    // Verify UNRESOLVED classifications for Q1 and Q2
    assert.ok(content.includes('UNRESOLVED Q1'), 'Q1 must remain UNRESOLVED in correspondence report');
    assert.ok(content.includes('UNRESOLVED Q2'), 'Q2 must remain UNRESOLVED in correspondence report');
});

test('inspect_twb_canonical.py Execution Sequence, Sequential Run IDs, and Refresh Verification', async () => {
    const { execSync } = await import('node:child_process');

    const statePath = path.join(process.cwd(), 'dev', 'validation', 'phase03_report_state.json');
    const reportPath = path.join(process.cwd(), 'validation_evidence', 'PHASE_03_CORRESPONDENCE_REPORT.md');

    // Run 1
    const result1 = execSync('python3 dev/scripts/inspect_twb_canonical.py', { cwd: process.cwd(), encoding: 'utf8' });
    assert.ok(result1.includes('Inspection evidence successfully written'), 'Script stdout should report canonical inspection written');
    assert.ok(result1.includes('Phase 03 correspondence report'), 'Script stdout should report correspondence report written');

    assert.ok(fs.existsSync(statePath), 'phase03_report_state.json must exist');
    const state1 = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    const runCount1 = state1.run_counter;
    assert.ok(runCount1 > 0, 'run_counter should be greater than 0');

    const report1 = fs.readFileSync(reportPath, 'utf8');
    assert.ok(report1.includes(`PH03-RUN-${String(runCount1).padStart(4, '0')}`), 'Report 1 header must contain formatted Run ID');
    assert.ok(report1.includes('**Generated At:**'), 'Report 1 header must contain generation timestamp');

    // Run 2
    const result2 = execSync('python3 dev/scripts/inspect_twb_canonical.py', { cwd: process.cwd(), encoding: 'utf8' });
    assert.ok(result2.includes('Phase 03 correspondence report'), 'Script stdout should report correspondence report written on run 2');

    const state2 = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    assert.strictEqual(state2.run_counter, runCount1 + 1, 'run_counter must increment sequentially by 1');

    const report2 = fs.readFileSync(reportPath, 'utf8');
    assert.ok(report2.includes(`PH03-RUN-${String(runCount1 + 1).padStart(4, '0')}`), 'Report 2 header must contain incremented sequential Run ID');
    assert.ok(report2.includes('**Generated At:**'), 'Report 2 header must contain generation timestamp');
});

test('EvidenceCollector - Default Disabled Discovery & Saved-Payload Preservation', async () => {
    try {
        EvidenceCollector.resetConfig();
        const mockDashboard = { name: 'Dash', objects: [] };
        const dashEvidence = await EvidenceCollector.captureDashboardEvidence(mockDashboard);
        assert.strictEqual(dashEvidence.runtimeDiscovery, undefined, 'Discovery should be disabled by default');

        // Enable discovery domain explicitly
        EvidenceCollector.setConfig({
            enabledDomains: ['dashboard.name', 'dashboard.objects', 'discovery']
        });
        const dashEvidenceWithDiscovery = await EvidenceCollector.captureDashboardEvidence(mockDashboard);
        assert.ok(Array.isArray(dashEvidenceWithDiscovery.runtimeDiscovery), 'Discovery should be populated when explicitly enabled');
        assert.ok(dashEvidenceWithDiscovery.runtimeDiscovery.length > 0);
    } finally {
        EvidenceCollector.resetConfig();
    }
});

test('EvidenceCollector - Bounds Enforcement and Credential Exclusions', async () => {
    try {
        EvidenceCollector.setConfig({
            enabledDomains: ['*'],
            bounds: { maxStringLength: 5 },
            exclusions: { excludeCredentials: true, excludeFunctions: true, excludeDomNodes: true, excludeBinaryBuffers: true }
        });

        const sensitiveObject = {
            name: 'VeryLongDashboardNameHere',
            authToken: 'secret-token-12345'
        };

        const discovered = EvidenceCollector.discoverRuntimeCapabilities(sensitiveObject, 'Dashboard');
        assert.ok(Array.isArray(discovered));
        assert.strictEqual(EvidenceCollector.getConfig().getBounds().maxStringLength, 5);
    } finally {
        EvidenceCollector.resetConfig();
        assert.strictEqual(EvidenceCollector.getConfig().getBounds().maxStringLength, 10000);
    }
});

test('EvidenceCollector - Real String Truncation and Credential Redaction', async () => {
    try {
        EvidenceCollector.setConfig({
            enabledDomains: ['*'],
            bounds: { maxStringLength: 10 },
            exclusions: { excludeCredentials: true, excludeFunctions: true, excludeDomNodes: true, excludeBinaryBuffers: true }
        });

        const sensitiveObject = {
            name: 'DashboardWithAVeryLongNameForTesting',
            authToken: 'secret-token-12345',
            password: 'MySecretPassword123',
            secretKey: 'top-secret-val',
            userCredential: 'credential-data',
            authHeader: 'Bearer token-value',
            normalField: 'ShortVal'
        };

        // Test captureDashboardEvidence with long string
        const dashEvidence = await EvidenceCollector.captureDashboardEvidence(sensitiveObject);
        assert.strictEqual(
            dashEvidence.dashboardName,
            'DashboardW...[truncated]',
            'Dashboard name exceeding maxStringLength should be truncated with ...[truncated]'
        );

        // Test exportEvidence / sanitizeValue for credential redaction and string truncation
        let exportedPayload = null;
        const originalLog = console.log;
        console.log = (...args) => {
            if (args[0] && typeof args[0] === 'string' && args[0].includes('Evidence captured and preserved')) {
                exportedPayload = args[1];
            }
        };

        try {
            await EvidenceCollector.exportEvidence(sensitiveObject, 'test_sanitization.json');
        } finally {
            console.log = originalLog;
        }

        assert.ok(exportedPayload, 'Exported payload should be captured');
        const ev = exportedPayload.evidence;
        assert.strictEqual(ev.name, 'DashboardW...[truncated]', 'Exported string exceeding length limit should be truncated');
        assert.strictEqual(ev.authToken, '[Redacted Credential]', 'authToken field should be redacted');
        assert.strictEqual(ev.password, '[Redacted Credential]', 'password field should be redacted');
        assert.strictEqual(ev.secretKey, '[Redacted Credential]', 'secretKey field should be redacted');
        assert.strictEqual(ev.userCredential, '[Redacted Credential]', 'userCredential field should be redacted');
        assert.strictEqual(ev.authHeader, '[Redacted Credential]', 'authHeader field should be redacted');
        assert.strictEqual(ev.normalField, 'ShortVal', 'Non-credential, short field should be preserved');
    } finally {
        EvidenceCollector.resetConfig();
    }
});

test('EvidenceCollector - RuntimeDiscovery survives exportEvidence and appears in receiver-saved JSON', async () => {
    let receiverProc = null;
    const testFilename = `test_runtime_discovery_${Date.now()}.json`;
    const captureFilePath = path.join(process.cwd(), 'validation_evidence', 'runtime_captures', testFilename);

    try {
        await new Promise((resolve, reject) => {
            receiverProc = spawn('python3', ['validation/validation_receiver.py'], {
                cwd: process.cwd()
            });

            let started = false;
            receiverProc.stdout.on('data', (data) => {
                if (!started && data.toString().includes('running on port 8000')) {
                    started = true;
                    resolve();
                }
            });

            receiverProc.on('error', (err) => {
                if (!started) reject(err);
            });

            setTimeout(() => {
                if (!started) resolve();
            }, 1000);
        });

        EvidenceCollector.setConfig({
            enabledDomains: ['*'],
            approvedOperations: ['getSummaryDataAsync', 'getSummaryDataReaderAsync']
        });

        const mockDashboard = {
            name: 'Discovery Test Dashboard',
            objects: [{ id: 'z1', name: 'Zone 1', type: 'worksheet' }],
            customProperty: 'customVal'
        };

        const dashEvidence = await EvidenceCollector.captureDashboardEvidence(mockDashboard);
        assert.ok(Array.isArray(dashEvidence.runtimeDiscovery), 'Runtime discovery should be an array');
        assert.ok(dashEvidence.runtimeDiscovery.length > 0, 'Runtime discovery should not be empty');

        await EvidenceCollector.exportEvidence({ dashboard: dashEvidence }, testFilename);

        // Assert file exists on disk from receiver
        assert.ok(fs.existsSync(captureFilePath), `Receiver-saved file should exist at ${captureFilePath}`);
        const savedData = JSON.parse(fs.readFileSync(captureFilePath, 'utf8'));

        assert.ok(savedData.dashboard, 'Saved data should contain dashboard evidence');
        assert.ok(Array.isArray(savedData.dashboard.runtimeDiscovery), 'runtimeDiscovery should be present as an array in receiver-saved JSON');
        assert.strictEqual(savedData.dashboard.runtimeDiscovery.length, dashEvidence.runtimeDiscovery.length);
        assert.strictEqual(savedData.dashboard.runtimeDiscovery[0].objectName, 'Dashboard');
    } finally {
        EvidenceCollector.resetConfig();
        if (receiverProc) {
            receiverProc.kill('SIGTERM');
        }
        if (fs.existsSync(captureFilePath)) {
            try { fs.unlinkSync(captureFilePath); } catch (e) {}
        }
    }
});

test('Extractor & EvidenceCollector - Operation Allowlist Path Enforcement', async () => {
    try {
        let readerCalled = false;
        let summaryDataCalled = false;

        const mockWs = {
            name: 'Test Worksheet',
            getSummaryDataReaderAsync: async () => {
                readerCalled = true;
                return {
                    getAllPagesAsync: async () => ({ columns: [], data: [], totalRowCount: 0 }),
                    releaseAsync: async () => {}
                };
            },
            getSummaryDataAsync: async () => {
                summaryDataCalled = true;
                return { columns: [], data: [], totalRowCount: 0 };
            }
        };

        // Case 1: Only getSummaryDataReaderAsync approved
        readerCalled = false;
        summaryDataCalled = false;
        const res1 = await Extractor.retrieveWorksheetData(mockWs, {
            approvedOperations: ['getSummaryDataReaderAsync']
        });
        assert.strictEqual(readerCalled, true, 'getSummaryDataReaderAsync should be called when approved');
        assert.strictEqual(summaryDataCalled, false, 'getSummaryDataAsync should not be called');
        assert.strictEqual(res1.methodUsed, 'getSummaryDataReaderAsync');

        // Case 2: Only getSummaryDataReaderAsync approved, but fails -> fallback to getSummaryDataAsync blocked
        const mockWsFailingReader = {
            name: 'Failing Reader WS',
            getSummaryDataReaderAsync: async () => {
                throw new Error('Reader failed');
            },
            getSummaryDataAsync: async () => {
                summaryDataCalled = true;
                return { columns: [], data: [], totalRowCount: 0 };
            }
        };
        summaryDataCalled = false;
        await assert.rejects(
            async () => {
                await Extractor.retrieveWorksheetData(mockWsFailingReader, {
                    approvedOperations: ['getSummaryDataReaderAsync']
                });
            },
            /Failed to retrieve summary data table/
        );
        assert.strictEqual(summaryDataCalled, false, 'Fallback getSummaryDataAsync must NOT be called if unapproved');

        // Case 3: Only getSummaryDataAsync approved
        summaryDataCalled = false;
        readerCalled = false;
        const res3 = await Extractor.retrieveWorksheetData(mockWs, {
            approvedOperations: ['getSummaryDataAsync']
        });
        assert.strictEqual(readerCalled, false, 'getSummaryDataReaderAsync should NOT be called when unapproved');
        assert.strictEqual(summaryDataCalled, true, 'getSummaryDataAsync should be called when approved');
        assert.strictEqual(res3.methodUsed, 'getSummaryDataAsync');

        // Case 4: Neither approved
        summaryDataCalled = false;
        readerCalled = false;
        await assert.rejects(
            async () => {
                await Extractor.retrieveWorksheetData(mockWs, {
                    approvedOperations: []
                });
            },
            /Failed to retrieve summary data table/
        );
        assert.strictEqual(readerCalled, false);
        assert.strictEqual(summaryDataCalled, false);

        // Case 5: EvidenceCollector passes approved operations properly
        EvidenceCollector.setConfig({
            enabledDomains: ['worksheet.summaryData'],
            approvedOperations: ['getSummaryDataAsync'] // Reader not approved
        });
        summaryDataCalled = false;
        readerCalled = false;
        const wsEvidence = await EvidenceCollector.captureWorksheetEvidence(mockWs);
        assert.strictEqual(readerCalled, false, 'EvidenceCollector should respect config and skip unapproved reader');
        assert.strictEqual(summaryDataCalled, true, 'EvidenceCollector should call approved getSummaryDataAsync');
        assert.strictEqual(wsEvidence.retrievalMethod, 'getSummaryDataAsync');
    } finally {
        EvidenceCollector.resetConfig();
    }
});


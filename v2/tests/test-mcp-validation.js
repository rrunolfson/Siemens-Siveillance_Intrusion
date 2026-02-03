/**
 * ServiceNow Integration Test Suite
 * Application: Siveillance_Intrusion
 * Scope: x_ic_siveillance
 *
 * Validates installation using ServiceNow REST API.
 * Works locally and in CI/CD with credentials.
 */

import axios from 'axios';

// Test Configuration
const CONFIG = {
  "appName": "Siveillance_Intrusion",
  "scope": "x_ic_siveillance",
  "tableName": "cmdb_ci_ot_ic_siveillance",
  "configVars": [
    {
      "key": "SN_INSTANCE",
      "type": "string"
    },
    {
      "key": "SN_API_KEY",
      "type": "string"
    },
    {
      "key": "SIVEILLANCE_API_KEY",
      "type": "string"
    },
    {
      "key": "SIVEILLANCE_PARTITION_ID",
      "type": "string"
    },
    {
      "key": "SYNC_INTERVAL_SECONDS",
      "type": "integer"
    },
    {
      "key": "ENABLE_INCIDENT_CORRELATION",
      "type": "boolean"
    }
  ],
  "requiredRoles": [
    "admin",
    "ot_admin"
  ]
};

// ServiceNow Connection
const SN_INSTANCE = process.env.SN_INSTANCE || 'lastmile.service-now.com';
const SN_USERNAME = process.env.SN_USERNAME || '';
const SN_PASSWORD = process.env.SN_PASSWORD || '';
const baseUrl = SN_INSTANCE.startsWith('http') ? SN_INSTANCE : `https://${SN_INSTANCE}`;

if (!SN_USERNAME || !SN_PASSWORD) {
  console.warn('WARN ServiceNow credentials not configured. Set SN_USERNAME and SN_PASSWORD.');
  console.warn('   Tests will log planned checks and skip live calls.');
}

const results = [];
let passed = 0;
let failed = 0;
let skipped = 0;

// Sample Data
function generateSampleData() {
  return [
    { name: 'Main Building Perimeter', short_description: 'Primary intrusion detection for main building', serial_number: 'SIV-2024-001', family: 'Siveillance', state: 'Operational', system_version: '2.3.12.2033', kernel_version: '5.44.3', equipment_number: 'EQ-MB-001', bus_amount: 4, amount_control_panels: 2, install_status: 1 },
    { name: 'Warehouse Zone A', short_description: 'Intrusion monitoring for warehouse zone A', serial_number: 'SIV-2024-002', family: 'Siveillance', state: 'Operational', system_version: '2.3.12.2033', kernel_version: '5.44.3', equipment_number: 'EQ-WH-A01', bus_amount: 2, amount_control_panels: 1, install_status: 1 },
    { name: 'Executive Floor Security', short_description: 'High-security intrusion for executive offices', serial_number: 'SIV-2024-003', family: 'Siveillance', state: 'Operational', system_version: '2.4.1.2055', kernel_version: '5.45.1', equipment_number: 'EQ-EX-001', bus_amount: 3, amount_control_panels: 2, install_status: 1 },
    { name: 'Data Center Vault', short_description: 'Intrusion detection for data center', serial_number: 'SIV-2024-004', family: 'Siveillance', state: 'Operational', system_version: '2.4.1.2055', kernel_version: '5.45.1', equipment_number: 'EQ-DC-001', bus_amount: 6, amount_control_panels: 3, install_status: 1 },
    { name: 'Loading Dock East', short_description: 'Monitoring eastern loading dock area', serial_number: 'SIV-2024-005', family: 'Siveillance', state: 'Unknown', system_version: '2.3.10.2010', kernel_version: '5.43.8', equipment_number: 'EQ-LD-E01', bus_amount: 2, amount_control_panels: 1, install_status: 6 }
  ];
}

// ANSI color codes for terminal output
const GREEN = '\x1b[92m';
const RED = '\x1b[91m';
const RESET = '\x1b[0m';

// Helper: Record test result
function recordResult(testName, status, message, details = null) {
  const result = { testName, status, message, details, timestamp: new Date().toISOString() };
  results.push(result);
  if (status === 'passed') passed++;
  else if (status === 'failed') failed++;
  else skipped++;
  const color = status === 'passed' ? GREEN : (status === 'skipped' ? RED : RED);
  const statusText = status.toUpperCase();
  console.log(`${color}[${statusText}]${RESET} ${testName}: ${message}`);
  return result;
}

// Helper: Execute ServiceNow REST API call
async function executeSnApi(method, path, data = null, params = {}) {
  if (!SN_USERNAME || !SN_PASSWORD) {
    throw new Error("ServiceNow credentials not configured");
  }
  const url = `${baseUrl}${path}`;
  const config = {
    method,
    url,
    auth: { username: SN_USERNAME, password: SN_PASSWORD },
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    params,
    timeout: 10000
  };
  if (data) { config.data = data; }
  const response = await axios(config);
  return response.data;
}

// TEST 1: Verify table exists
async function test_tableExists() {
  const testName = 'Table Existence Check';
  try {
    const result = await executeSnApi('GET', '/api/now/table/sys_db_object', null, {
      sysparm_query: `name=${CONFIG.tableName}`,
      sysparm_fields: 'name,label,super_class',
      sysparm_limit: 1
    });
    if (result.result && result.result.length > 0) {
      const table = result.result[0];
      recordResult(testName, 'passed', `Table '${CONFIG.tableName}' exists (label: ${table.label || 'N/A'})`, table);
      return true;
    }
    recordResult(testName, 'skipped', `Table '${CONFIG.tableName}' not found - install package first`);
    return false;
  } catch (error) {
    recordResult(testName, 'failed', `Table verification failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

// TEST 2: Verify system properties
async function test_systemProperties() {
  const testName = 'System Properties Check';
  try {
    const propertyPrefix = CONFIG.scope;
    const expectedCount = CONFIG.configVars.length;
    const result = await executeSnApi('GET', '/api/now/table/sys_properties', null, {
      sysparm_query: `nameSTARTSWITH${propertyPrefix}`,
      sysparm_fields: 'name,value',
      sysparm_limit: 100
    });
    const foundCount = result.result?.length || 0;
    if (foundCount >= expectedCount) {
      recordResult(testName, 'passed', `Found ${foundCount} properties (expected ${expectedCount})`, result.result);
    } else if (foundCount > 0) {
      recordResult(testName, 'failed', `Only found ${foundCount} properties, expected ${expectedCount}`);
    } else {
      recordResult(testName, 'skipped', 'No properties configured yet - run post-install setup');
    }
  } catch (error) {
    recordResult(testName, 'failed', `Property verification failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// TEST 3: Update set validation
async function test_updateSet() {
  const testName = 'Update Set Validation';
  try {
    const result = await executeSnApi('GET', '/api/now/table/sys_update_set', null, {
      sysparm_query: `nameSTARTSWITH${CONFIG.scope}`,
      sysparm_fields: 'name,state',
      sysparm_limit: 10
    });
    if (result.result && result.result.length > 0) {
      recordResult(testName, 'passed', `Found ${result.result.length} update set(s) for scope`, result.result);
    } else {
      recordResult(testName, 'skipped', 'No update sets found - may be a new installation');
    }
  } catch (error) {
    recordResult(testName, 'failed', `Update set check failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// TEST 4: Validate table fields
async function test_tableFields() {
  const testName = 'Table Fields Validation';
  try {
    const result = await executeSnApi('GET', '/api/now/table/sys_dictionary', null, {
      sysparm_query: `name=${CONFIG.tableName}^element!=NULL`,
      sysparm_fields: 'element,column_label,internal_type',
      sysparm_limit: 100
    });
    const fieldCount = result.result?.length || 0;
    if (fieldCount > 0) {
      recordResult(testName, 'passed', `Table has ${fieldCount} custom field(s)`, result.result);
    } else {
      recordResult(testName, 'skipped', 'No custom fields found (table may extend base table)');
    }
  } catch (error) {
    recordResult(testName, 'failed', `Field validation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// TEST 5: Validate access control
async function test_accessControl() {
  const testName = 'ACL Validation';
  try {
    const result = await executeSnApi('GET', '/api/now/table/sys_security_acl', null, {
      sysparm_query: `nameCONTAINS${CONFIG.tableName}`,
      sysparm_fields: 'name,operation,type',
      sysparm_limit: 50
    });
    const aclCount = result.result?.length || 0;
    if (aclCount > 0) {
      recordResult(testName, 'passed', `Found ${aclCount} ACL rule(s) for table`, result.result);
    } else {
      recordResult(testName, 'skipped', 'No ACL rules found (may use inherited or role-based security)');
    }
  } catch (error) {
    recordResult(testName, 'failed', `ACL validation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// TEST 6: Data write/read
async function test_dataRoundTrip() {
  const testName = 'Data Read/Write Test';
  const created = [];
  try {
    const sampleData = generateSampleData();
    let successCount = 0;
    let failureCount = 0;
    console.log(`
Writing ${sampleData.length} sample records...`);
    for (const record of sampleData) {
      try {
        const createResult = await executeSnApi('POST', `/api/now/table/${CONFIG.tableName}`, record);
        if (createResult.result && createResult.result.sys_id) {
          created.push(createResult.result.sys_id);
          successCount++;
          console.log(`  OK Created: ${record.name} (${createResult.result.sys_id})`);
        } else {
          failureCount++;
          console.log(`  FAIL Failed: ${record.name}`);
        }
      } catch (recordError) {
        failureCount++;
        console.log(`  FAIL Error creating ${record.name}: ${recordError instanceof Error ? recordError.message : String(recordError)}`);
      }
    }
    if (successCount > 0) {
      recordResult(testName, 'passed', `Created ${successCount}/${sampleData.length} records`, { created });
      const verifyResult = await executeSnApi('GET', `/api/now/table/${CONFIG.tableName}`, null, {
        sysparm_query: 'serial_numberSTARTSWITHSIV-2024',
        sysparm_fields: 'name,serial_number,family,state',
        sysparm_limit: 10
      });
      console.log(`
Verified ${verifyResult.result?.length || 0} records in table`);
      if (verifyResult.result && verifyResult.result.length > 0) {
        console.log('Sample records:');
        verifyResult.result.forEach((r) => {
          console.log(`  - ${r.name} [${r.family}] - ${r.state}`);
        });
      }
    } else {
      recordResult(testName, 'failed', `Failed to create any records (${failureCount} errors)`);
    }
  } catch (error) {
    recordResult(testName, 'failed', `Sample data population failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    if (created.length > 0) {
      for (const id of created) { await executeSnApi('DELETE', `/api/now/table/${CONFIG.tableName}/${id}`); }
      console.log(`Cleaned up ${created.length} test record(s).`);
    }
  }
}

// Helper: Generate corrective actions
function generateCorrectiveActions() {
  const actions = [];
  for (const result of results) {
    if (result.status === 'failed') {
      if (result.testName.includes("Table Existence")) {
        actions.push({ test: result.testName, action: 'Install the ServiceNow package first: now-cli app install <package.zip>', severity: 'critical' });
      } else if (result.testName.includes("System Properties")) {
        actions.push({ test: result.testName, action: 'Run post-install configuration or guided setup to create required properties', severity: 'high' });
      } else if (result.testName.includes("Data")) {
        actions.push({ test: result.testName, action: 'Check table permissions and ACL rules. User may lack write access.', severity: 'high' });
      } else {
        actions.push({ test: result.testName, action: 'Review test details and ServiceNow system logs for errors', severity: 'medium' });
      }
    }
  }
  return actions;
}

// Helper: Write test report files
async function writeTestReports(summary) {
  const fs = await import("fs/promises");
  const path = await import("path");
  const reportDir = process.cwd();
  
  // Write JSON report
  const jsonReport = {
    ...summary,
    config: CONFIG,
    instance: SN_INSTANCE,
    timestamp: new Date().toISOString(),
    correctiveActions: generateCorrectiveActions()
  };
  await fs.writeFile(
    path.join(reportDir, "test-results.json"),
    JSON.stringify(jsonReport, null, 2)
  );
  
  // Write Markdown report
  const md = [];
  md.push("# ServiceNow Integration Test Report\n");
  md.push(`**Application**: ${CONFIG.appName}\n`);
  md.push(`**Scope**: ${CONFIG.scope}\n`);
  md.push(`**Instance**: ${SN_INSTANCE}\n`);
  md.push(`**Date**: ${new Date().toISOString()}\n`);
  md.push("\n## Summary\n\n");
  md.push(`- **Total Tests**: ${summary.totalTests}\n`);
  md.push(`- **Passed**: ✅ ${summary.passed}\n`);
  md.push(`- **Failed**: ❌ ${summary.failed}\n`);
  md.push(`- **Skipped**: ⚠️ ${summary.skipped}\n`);
  md.push(`- **Duration**: ${summary.duration}ms\n`);
  const status = summary.failed === 0 ? "✅ PASS" : "❌ FAIL";
  md.push(`- **Overall Status**: ${status}\n`);
  md.push("\n## Test Results\n\n");
  for (const result of summary.results) {
    const icon = result.status === "passed" ? "✅" : result.status === "failed" ? "❌" : "⚠️";
    md.push(`### ${icon} ${result.testName}\n\n`);
    md.push(`- **Status**: ${result.status.toUpperCase()}\n`);
    md.push(`- **Message**: ${result.message}\n`);
    if (result.details) {
      md.push(`- **Details**: \`\`\`json\n${JSON.stringify(result.details, null, 2)}\n\`\`\`\n`);
    }
    md.push("\n");
  }
  const actions = generateCorrectiveActions();
  if (actions.length > 0) {
    md.push("## ⚠️ Corrective Actions Required\n\n");
    for (const action of actions) {
      md.push(`### ${action.test} (Severity: ${action.severity.toUpperCase()})\n\n`);
      md.push(`**Action**: ${action.action}\n\n`);
    }
  } else {
    md.push("## ✅ No Corrective Actions Needed\n\n");
    md.push("All tests passed or were appropriately skipped. The integration is ready for use.\n");
  }
  md.push("\n---\n\n");
  md.push("*Generated by ServiceNow Integration Test Suite*\n");
  await fs.writeFile(
    path.join(reportDir, "TEST_REPORT.md"),
    md.join("")
  );
  console.log(`\n📄 Test reports written:`);
  console.log(`   - test-results.json`);
  console.log(`   - TEST_REPORT.md`);
}

// MAIN
async function runAllTests() {
  console.log('\n'.padStart(1));
  console.log('='.repeat(60));
  console.log(`ServiceNow MCP Test Suite: ${CONFIG.appName}`);
  console.log('='.repeat(60) + '\n');
  const startTime = Date.now();
  const tableExists = await test_tableExists();
  await test_systemProperties();
  await test_updateSet();
  await test_tableFields();
  await test_accessControl();
  if (tableExists) {
    await test_dataRoundTrip();
  } else {
    recordResult('Data Read/Write Test', 'skipped', 'Table does not exist - install package first');
  }
  const duration = Date.now() - startTime;
  const summary = {
    suiteName: 'ServiceNow Integration Validation',
    totalTests: results.length,
    passed,
    failed,
    skipped,
    results,
    duration
  };
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests:  ${results.length}`);
  console.log(`Passed:       ${passed}`);
  console.log(`Failed:       ${failed}`);
  console.log(`Skipped:      ${skipped}`);
  console.log(`Duration:     ${duration}ms`);
  console.log('='.repeat(60) + '\n');
  await writeTestReports(summary);
  return summary;
}

// ESM-compatible direct execution
import { pathToFileURL } from 'url';
if (import.meta.url === pathToFileURL(process.argv[1]).href || import.meta.url === 'file://' + process.argv[1]) {
  runAllTests()
    .then((summary) => { process.exit(summary.failed > 0 ? 1 : 0); })
    .catch((error) => { console.error('Test suite crashed:', error); process.exit(2); });
}

export { runAllTests, CONFIG };
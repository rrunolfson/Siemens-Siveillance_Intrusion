# MCP Test Suite - Siveillance_Intrusion

## Overview

Validates the installation and configuration of the Siveillance_Intrusion ServiceNow integration using the ServiceNow REST API. Generates comprehensive test reports in JSON and Markdown formats.

## Prerequisites

1. ServiceNow MCP Server installed and configured
2. Connection to lastmile.service-now.com (or your instance)
3. Credentials with privileges to:
   - Query tables
   - Create/read/delete test records
   - Access sys_properties
   - View update sets

## Running Tests

### From Command Line
```bash
node test-mcp-validation.js
```

### Output Files Generated
After each test run, two report files are created:
- **test-results.json** - Machine-readable test results with corrective actions
- **TEST_REPORT.md** - Human-readable markdown report with detailed results

### From VS Code with Copilot
Ask Copilot to run the tests using available MCP tools.

## Test Coverage

1) **Table Existence Check** - Verifies primary integration table exists
2) **System Properties Check** - Validates configuration variables
3) **Update Set Validation** - Checks deployment tracking
4) **Table Fields Validation** - Confirms custom field definitions
5) **Access Control Validation** - Verifies security rules
6) **Data Read/Write Test** - Tests CRUD operations with sample data

## Test Results

### Success Example
```text
============================================================
TEST SUMMARY
============================================================
Total Tests:  6
Passed:       6
Failed:       0
Skipped:      0
Duration:     2500ms
============================================================

📄 Test reports written:
   - test-results.json
   - TEST_REPORT.md
```

### Failure Example with Corrective Actions
If tests fail, the TEST_REPORT.md will include a "Corrective Actions Required" section with:
- Severity level (Critical, High, Medium)
- Specific action needed to resolve the issue
- Guidance for rerunning tests after fixes

## Automated Error Correction Workflow

1. **Run Initial Tests**
   ```bash
   node test-mcp-validation.js
   ```

2. **Review TEST_REPORT.md**
   - Check "Corrective Actions Required" section
   - Note severity levels and required actions

3. **Apply Corrections**
   - Follow the specific actions listed
   - Examples:
     - Install package if table doesn't exist
     - Run post-install configuration
     - Check user permissions/roles

4. **Rerun Tests**
   ```bash
   node test-mcp-validation.js
   ```

5. **Verify Success**
   - All tests should pass
   - TEST_REPORT.md shows "No Corrective Actions Needed"

## Troubleshooting

- **Table Not Found**: Install the ServiceNow package first
- **Property Count Mismatch**: Run guided setup or post-install configuration
- **Update Set Empty**: Ensure an update set is active and capturing changes
- **Access Denied**: Verify user roles and ACL rules
- **Data Write Failed**: Check table permissions and write access

## CI/CD Integration

```yaml
- name: Validate ServiceNow Installation
  run: node test-mcp-validation.js
  env:
    SN_INSTANCE: lastmile.service-now.com
    SN_USERNAME: ${{ secrets.SN_USERNAME }}
    SN_PASSWORD: ${{ secrets.SN_PASSWORD }}

- name: Upload Test Reports
  uses: actions/upload-artifact@v3
  with:
    name: test-reports
    path: |
      test-results.json
      TEST_REPORT.md
```

## Support

1. Review test-results.json for programmatic access to results
2. Check TEST_REPORT.md for detailed analysis and corrective actions
3. Verify MCP server connection
4. Ensure credentials are valid and have required permissions

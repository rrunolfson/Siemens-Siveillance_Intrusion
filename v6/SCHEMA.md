# Database Schema Documentation
# Siveillance Intrusion Integration

**Scope:** x_ic_siveillance
**Version:** 1.0.0
**Tables:** 1

---

## Table of Contents

1. [Siveillance Intrusion Integration CI](#siveillance-intrusion-integration-ci)

---

## Schema Overview

This application modifies the ServiceNow database schema by creating custom tables and fields.
All schema changes are scoped to prevent conflicts with other applications.

### Schema Safety

- All tables use scoped names to avoid conflicts
- Fields are created with appropriate constraints
- Indexes are defined for performance optimization
- ACL rules control access to data

---

## Siveillance Intrusion Integration CI

**Table Name:** `x_ic_siveillance`
**Extends:** `cmdb_ci`

**Description:** Custom CI table for Siveillance Intrusion Integration CI integration data

### Fields

| Field | Type | Label | Mandatory | Description |
|-------|------|-------|-----------|-------------|
| `systemId` | string | SystemId |  | Unique system identifier |
| `systemName` | string | SystemName |  | Human-readable system name |
| `systemVersion` | string | SystemVersion |  | Siveillance system software version |
| `kernelVersion` | string | KernelVersion |  | System kernel version |
| `equipmentNumber` | string | EquipmentNumber |  | Physical equipment serial number |
| `countryCode` | string | CountryCode |  | ISO country code |
| `systemStatus` | string | SystemStatus |  | Current operational status (Connected, Disconnected, Unknown) |
| `busAmount` | integer | BusAmount |  | Number of communication buses |
| `controlPanelCount` | integer | ControlPanelCount |  | Number of control panels |
| `deviceCount` | integer | DeviceCount |  | Total connected devices |
| `inputCount` | integer | InputCount |  | Total sensor inputs |
| `outputCount` | integer | OutputCount |  | Total control outputs |
| `areaCount` | integer | AreaCount |  | Total protected areas |
| `lastSystemStart` | glide_date_time | LastSystemStart |  | Timestamp of last system restart |
| `licenseDateUtc` | glide_date_time | LicenseDateUtc |  | System license expiration date |
| `availableDiskKb` | integer | AvailableDiskKb |  | Available disk storage in kilobytes |
| `availableFlashKb` | integer | AvailableFlashKb |  | Available flash memory in kilobytes |

### Field Details

#### SystemId (`systemId`)

- **Type:** string
- **Mandatory:** No

Unique system identifier

#### SystemName (`systemName`)

- **Type:** string
- **Mandatory:** No

Human-readable system name

#### SystemVersion (`systemVersion`)

- **Type:** string
- **Mandatory:** No

Siveillance system software version

#### KernelVersion (`kernelVersion`)

- **Type:** string
- **Mandatory:** No

System kernel version

#### EquipmentNumber (`equipmentNumber`)

- **Type:** string
- **Mandatory:** No

Physical equipment serial number

#### CountryCode (`countryCode`)

- **Type:** string
- **Mandatory:** No

ISO country code

#### SystemStatus (`systemStatus`)

- **Type:** string
- **Mandatory:** No

Current operational status (Connected, Disconnected, Unknown)

#### BusAmount (`busAmount`)

- **Type:** integer
- **Mandatory:** No

Number of communication buses

#### ControlPanelCount (`controlPanelCount`)

- **Type:** integer
- **Mandatory:** No

Number of control panels

#### DeviceCount (`deviceCount`)

- **Type:** integer
- **Mandatory:** No

Total connected devices

#### InputCount (`inputCount`)

- **Type:** integer
- **Mandatory:** No

Total sensor inputs

#### OutputCount (`outputCount`)

- **Type:** integer
- **Mandatory:** No

Total control outputs

#### AreaCount (`areaCount`)

- **Type:** integer
- **Mandatory:** No

Total protected areas

#### LastSystemStart (`lastSystemStart`)

- **Type:** glide_date_time
- **Mandatory:** No

Timestamp of last system restart

#### LicenseDateUtc (`licenseDateUtc`)

- **Type:** glide_date_time
- **Mandatory:** No

System license expiration date

#### AvailableDiskKb (`availableDiskKb`)

- **Type:** integer
- **Mandatory:** No

Available disk storage in kilobytes

#### AvailableFlashKb (`availableFlashKb`)

- **Type:** integer
- **Mandatory:** No

Available flash memory in kilobytes

### Usage Examples

#### Query Records
```javascript
var gr = new GlideRecord('x_ic_siveillance');
gr.query();
while (gr.next()) {
  gs.info(gr.getValue('systemId'));
}
```

#### Create Record
```javascript
var gr = new GlideRecord('x_ic_siveillance');
gr.initialize();
gr.setValue('systemId', 'example value');
gr.setValue('systemName', 'example value');
gr.setValue('systemVersion', 'example value');
var sysId = gr.insert();
gs.info('Created record: ' + sysId);
```

#### Update Record
```javascript
var gr = new GlideRecord('x_ic_siveillance');
gr.addQuery('sys_id', '<record_sys_id>');
gr.query();
if (gr.next()) {
  gr.setValue('systemId', 'new value');
  gr.update();
  gs.info('Record updated');
}
```

---

## Migration & Upgrade Notes

### Initial Installation

1. All tables are created automatically during app installation
2. Dictionary entries are generated for all fields
3. Indexes are created for performance
4. ACL rules are applied for scoped access

### Upgrading

When upgrading to newer versions:

- **Schema changes** are applied automatically
- **Existing data** is preserved
- **New fields** are added with default values
- **Deprecated fields** are not removed (for safety)

**Best Practice:** Always test upgrades in a sub-production instance first.

### Rollback

To rollback schema changes:

1. **Backup data** from custom tables before rollback
2. **Uninstall application** via System Applications
3. **Manually delete tables** if they persist
4. **Restore from backup** if needed

**WARNING:** Uninstalling does not automatically delete tables or data.

---

## Data Dictionary Export

For compliance and documentation purposes, export the data dictionary:

1. Navigate to **System Definition > Dictionary**
2. Filter by table names listed in this document
3. Export as XML or Excel
4. Store with application documentation

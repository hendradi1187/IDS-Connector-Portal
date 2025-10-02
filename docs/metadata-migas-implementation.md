# Metadata Migas - Implementation Documentation

## 📚 Overview

Implementasi komprehensif **Metadata Management untuk sektor Migas** di IDS Connector Portal dengan compliance terhadap standar:
- ✅ **PPDM 3.9** (Professional Petroleum Data Management)
- ✅ **SNI Migas** (Standar Nasional Indonesia - Migas)
- ✅ **Satu Data Indonesia** (Interoperabilitas data pemerintah)

---

## 🎯 Komponen Utama

### 1. **Registrasi Metadata Migas**

**File**: `src/components/metadata/MigasMetadataRegistration.tsx`

**Tujuan**: Memungkinkan KKKS mendaftarkan dataset baru sebelum data fisik dikirim ke SKK Migas

**Fitur**:
- ✅ Form input lengkap dengan validasi real-time
- ✅ Jenis data: Well Log, Production Data, Facility Data, Seismic 2D/3D, Geological, Reservoir, Drilling, Completion, HSE
- ✅ Format file support: SEG-Y, LAS, CSV, Excel, Shapefile, GeoTIFF, PDF, JSON, XML
- ✅ Lokasi & koordinat dengan sistem WGS84/UTM
- ✅ Informasi temporal (acquisition date, period)
- ✅ KKKS ownership & source system tracking
- ✅ Schema definition dengan field types, units, required/unique flags
- ✅ Auto-validation terhadap PPDM, SNI Migas, Satu Data Indonesia

**Contoh Metadata**:
```typescript
{
  datasetName: "Seismic Survey 2D Blok Mahakam 2024",
  datasetType: "Seismic 2D",
  fileFormat: "SEG-Y",
  workingArea: "Blok Mahakam",
  fieldId: "MHK-001",
  coordinates: {
    latitude: -0.5,
    longitude: 117.5,
    coordinateSystem: "WGS84"
  },
  kkksOwner: "PT Pertamina Hulu Energi",
  kkksId: "KKKS-001",
  sourceSystem: "Seismic DMS"
}
```

**RBAC**:
- Admin: ✅ Full access
- KKKS-Provider: ✅ Can register
- SKK-Consumer: ❌ View only

---

### 2. **Validasi Schema Otomatis**

**File**: `src/lib/actions/metadataMigas.ts`

**Tujuan**: Memastikan metadata sesuai standar sebelum masuk sistem

**Validation Functions**:

#### a. PPDM Validation
```typescript
validatePPDM(metadata) {
  // Checks:
  - WELL_ID is mandatory & unique for Production Data
  - FIELD_ID exists and links to valid field
  - Coordinate system is standard (WGS84/UTM)
  - Spatial coordinates for seismic/geological data
}
```

#### b. SNI Migas Validation
```typescript
validateSNIMigas(metadata) {
  // Checks:
  - Date format is YYYY-MM-DD (SNI 8595:2018)
  - Oil production uses BBLS unit
  - Gas production uses MSCFD unit
  - KKKS ID format: KKKS-XXX
}
```

#### c. Satu Data Indonesia Validation
```typescript
validateSatuDataIndonesia(metadata) {
  // Checks:
  - Dataset name min 10 characters
  - Description min 20 characters
  - At least 3 tags for discoverability
  - Period end >= period start
}
```

**Output**: Array of `SchemaValidationResult` dengan errors & warnings untuk setiap standar

**Contoh Error**:
```typescript
{
  field: "schema.WELL_ID",
  rule: "PPDM-WL-001",
  message: "WELL_ID field is mandatory for Production Data (PPDM 3.9)",
  severity: "critical"
}
```

---

### 3. **Lineage & Versioning**

**File**: `src/components/metadata/MigasLineageViewer.tsx`

**Tujuan**: Melacak asal-usul data dan perubahan untuk transparansi & audit trail

**Fitur**:
- ✅ Timeline view dengan visual lineage
- ✅ Version tracking dengan previous version reference
- ✅ Action types: created, updated, validated, approved, versioned
- ✅ Performer tracking (who did what)
- ✅ Source system tracking (where data came from)
- ✅ Changes diff untuk setiap update
- ✅ Expandable details untuk melihat perubahan

**Data Lineage Structure**:
```typescript
{
  timestamp: Date,
  action: 'created' | 'updated' | 'validated' | 'approved' | 'versioned',
  performedBy: string,  // email/user ID
  description: string,
  sourceSystem?: string,
  changes?: {
    schema: { added: ['field1'], removed: [] },
    metadata: { ... }
  }
}
```

**Contoh Timeline**:
```
2024-04-05 | VERSIONED     | operator@rokan.co.id
           | Updated schema to include CHOKE_SIZE field

2024-04-02 | VALIDATED     | system
           | PPDM and SNI Migas validation passed

2024-04-01 | CREATED       | operator@rokan.co.id
           | Initial metadata registration
```

**Metrics Display**:
- Total Events
- Total Versions
- Total Approvals
- Total Updates

---

### 4. **Workflow Approval**

**File**: `src/components/metadata/MigasApprovalWorkflow.tsx`

**Tujuan**: Memberikan kontrol kepada SKK Migas untuk approve/reject metadata sebelum data fisik ditransfer

**Alur Workflow**:
```
1. KKKS submit metadata (status: submitted)
2. SKK Migas receives notification
3. SKK Migas review metadata details
4. SKK Migas decision:
   - APPROVE (with optional notes) → status: approved
   - REJECT (with mandatory reason) → status: rejected
5. KKKS notified of decision
6. If approved → data transfer dapat dimulai
7. If rejected → KKKS fix issues & resubmit
```

**UI Components**:
- **Submission Queue Table**:
  - Dataset name & description
  - KKKS owner
  - Submission date & submitter
  - Validation status badge
  - Quick approve/reject buttons
- **Review Dialog**:
  - Metadata summary
  - Validation errors (if any)
  - Review notes textarea
  - Approve/Reject actions

**Validation Check**:
- ❌ Cannot approve if `validationStatus !== 'valid'`
- ✅ Must provide rejection reason (mandatory)

**RBAC**:
- Admin: ✅ Can approve/reject
- KKKS-Provider: ✅ Can submit, ❌ Cannot approve
- SKK-Consumer: ✅ Can view, ❌ Cannot approve

---

## 📊 Database Schema (Prisma)

**File**: `prisma/schema.prisma`

Sudah ditambahkan di section **Metadata Management System** (lines 1981-2245):

### Models:
1. **DatasetMetadata** - Core metadata table
2. **QualityRule** - Data quality rules
3. **QualityIssue** - Quality issues detected
4. **QualityReport** - Quality check reports
5. **DatasetAccess** - Access control
6. **AccessRequest** - Access request workflow
7. **ApprovalSubmission** - Approval submissions
8. **ApprovalHistory** - Approval audit trail

### Enums:
- MetadataStatus
- QualityRuleType
- QualitySeverity
- IssueStatus
- AccessRole
- RequestApprovalStatus
- SubmissionType
- ApprovalStatus
- HistoryAction

---

## 🔄 Integration Points

### Main Metadata Page

**File**: `src/app/metadata/page.tsx`

**Tabs Structure**:
1. **Overview** - Metrics & statistics
2. **Migas Metadata** - 5 sub-tabs:
   - Data Catalog
   - Registrasi Metadata
   - Lineage & Versioning
   - Workflow Approval
   - Schema Validation
3. **Data Quality** - Quality management
4. **Access Control** - Role-based access
5. **Approval Queue** (Admin only) - Admin approvals

### Migas Metadata Tabs

**File**: `src/components/metadata/MigasMetadataManagementTabs.tsx`

Orchestrates all migas-specific components dengan:
- Info header dengan compliance badges
- Tab navigation dengan icons
- Role-based tab visibility
- Context switching between components

---

## 🎨 UI/UX Highlights

### Color Coding
- 🔵 **Blue**: PPDM standard
- 🟢 **Green**: SNI Migas standard
- 🟣 **Purple**: Satu Data Indonesia standard
- ✅ **Green badges**: Valid/Approved
- ❌ **Red badges**: Invalid/Rejected
- 🟡 **Yellow**: Under review/Warnings

### Status Badges
- **Draft**: Gray
- **Submitted**: Blue
- **Under Review**: Yellow
- **Approved**: Green
- **Rejected**: Red

### Validation Display
- Error cards with severity levels
- Warning cards for best practices
- Success indicators for passed validation
- Expandable details for debugging

---

## 🚀 Usage Flow

### For KKKS (Data Provider):

1. **Register New Dataset**
   ```
   Navigate to Metadata → Migas Metadata → Registrasi Metadata
   Fill form with:
   - Basic info (name, type, format)
   - Location & area (working area, field, coordinates)
   - Temporal info (acquisition date, period)
   - Ownership (KKKS name, ID, source system)
   - Schema definition (fields, types, units)
   Click "Validasi Schema" → Review validation results
   Click "Simpan Metadata" → Status: draft
   ```

2. **Submit for Approval**
   ```
   Review metadata details
   Ensure validation status = valid
   Click "Submit for Approval"
   Status changes: draft → submitted
   Wait for SKK Migas review
   ```

3. **Track Changes**
   ```
   Navigate to Lineage & Versioning tab
   View timeline of all actions
   Check who made what changes
   Expand to see detailed diff
   ```

### For SKK Migas (Reviewer):

1. **Review Submissions**
   ```
   Navigate to Metadata → Migas Metadata → Workflow Approval
   View queue of pending submissions
   Check validation status (must be valid)
   ```

2. **Approve Dataset**
   ```
   Click "Approve" button
   Review metadata summary
   Add optional notes
   Confirm approval
   Status changes: submitted → approved
   ```

3. **Reject Dataset**
   ```
   Click "Reject" button
   Review metadata summary & errors
   Enter mandatory rejection reason
   Confirm rejection
   Status changes: submitted → rejected
   KKKS notified to fix issues
   ```

---

## 📝 API Actions

**File**: `src/lib/actions/metadataMigas.ts`

### Available Functions:

```typescript
// Validation
validateMetadataSchema(metadata) → SchemaValidationResult[]

// CRUD
createMigasMetadata(input) → { metadata, validation }
updateMigasMetadata(id, updates, updatedBy) → { metadata, validation }
getMigasMetadataById(id) → MigasMetadata | null
listMigasMetadata(filters?) → MigasMetadata[]

// Workflow
submitForApproval(id, submittedBy) → MigasMetadata
approveMetadata(id, reviewedBy, notes?) → MigasMetadata
rejectMetadata(id, reviewedBy, reason) → MigasMetadata

// Versioning
getVersionHistory(id) → DataLineage[]
```

---

## 🔐 Role-Based Access Control (RBAC)

| Feature | Admin | KKKS-Provider | SKK-Consumer |
|---------|-------|---------------|--------------|
| View Metadata | ✅ | ✅ | ✅ |
| Register Metadata | ✅ | ✅ | ❌ |
| Edit Own Metadata | ✅ | ✅ | ❌ |
| Delete Metadata | ✅ | ❌ | ❌ |
| Submit for Approval | ✅ | ✅ | ❌ |
| Approve/Reject | ✅ | ❌ | ❌ |
| View Lineage | ✅ | ✅ | ✅ (limited) |
| Export Metadata | ✅ | ✅ | ✅ |

---

## ✅ Compliance Checklist

### PPDM 3.9 Compliance
- [x] Well ID format & uniqueness validation
- [x] Field ID mandatory for production data
- [x] Coordinate system standardization
- [x] Data type conformance
- [x] Spatial data requirements

### SNI Migas Compliance
- [x] Date format YYYY-MM-DD (SNI 8595:2018)
- [x] Unit standardization (BBLS, MSCFD)
- [x] KKKS ID format validation
- [x] Measurement accuracy requirements

### Satu Data Indonesia Compliance
- [x] Metadata completeness (name, description, tags)
- [x] Descriptive naming conventions
- [x] Tagging for discoverability
- [x] Temporal coverage validation
- [x] Interoperability standards

---

## 🎯 Key Benefits

### 1. **Konsistensi**
- Semua KKKS menggunakan format data yang sama
- Standardisasi across dataspace
- Reduced integration overhead

### 2. **Kualitas**
- Validasi otomatis mencegah data error
- Early detection of issues
- Cleaner data in production

### 3. **Efisiensi**
- Automated validation reduces manual work
- Faster approval process
- Less back-and-forth revisions

### 4. **Transparansi**
- Full audit trail via lineage
- Who changed what and when
- Source system tracking

### 5. **Governance**
- Approval workflow ensures oversight
- Role-based access control
- Compliance with regulations

---

## 🚧 Future Enhancements

### Planned Features:
1. **Batch Upload**: Import multiple metadata from CSV/Excel
2. **Advanced Search**: Full-text search dengan filters
3. **Metadata Templates**: Pre-defined templates untuk common dataset types
4. **Auto-notification**: Email/Slack notifications untuk workflow events
5. **Analytics Dashboard**: Metrics & KPIs untuk metadata quality
6. **API Integration**: RESTful API endpoints untuk programmatic access
7. **Versioning Diff**: Side-by-side comparison untuk versions
8. **Metadata Export**: Export to various formats (PDF, JSON, XML)

---

## 📞 Support & Documentation

- **User Guide**: `/docs/user-guide-metadata-migas.md`
- **API Documentation**: `/docs/api-metadata-endpoints.md`
- **Database Schema**: `/docs/metadata-database-schema.md`
- **SOP RACI**: `/docs/SOP-Data-Platform-RACI.md`

---

*Last Updated: 2025-10-02*
*Version: 1.0*

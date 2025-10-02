# Database Schema - Metadata Management System

## 📋 1. Metadata Tab - Dataset Metadata

### Tabel: `dataset_metadata`
```sql
CREATE TABLE dataset_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  schema JSONB NOT NULL,
  source VARCHAR(255),
  owner_id UUID REFERENCES users(id),
  tags TEXT[],
  category VARCHAR(100),
  domain VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft', -- draft, pending, approved, rejected
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_metadata_owner ON dataset_metadata(owner_id);
CREATE INDEX idx_metadata_status ON dataset_metadata(status);
CREATE INDEX idx_metadata_tags ON dataset_metadata USING GIN(tags);
CREATE INDEX idx_metadata_category ON dataset_metadata(category);
```

### API Endpoints:
```
POST   /api/metadata              - createMetadata()
PUT    /api/metadata/:id          - updateMetadata()
DELETE /api/metadata/:id          - deleteMetadata()
GET    /api/metadata/:id          - getMetadataById()
GET    /api/metadata              - listMetadata()
GET    /api/metadata/search?q=    - searchMetadata()
```

---

## 📊 2. Data Quality Tab

### Tabel: `quality_rules`
```sql
CREATE TABLE quality_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES dataset_metadata(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- completeness, consistency, accuracy, validity, uniqueness
  condition TEXT NOT NULL,
  severity VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_quality_rules_dataset ON quality_rules(dataset_id);
CREATE INDEX idx_quality_rules_type ON quality_rules(type);
```

### Tabel: `quality_issues`
```sql
CREATE TABLE quality_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES dataset_metadata(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES quality_rules(id) ON DELETE SET NULL,
  rule_name VARCHAR(255),
  description TEXT NOT NULL,
  severity VARCHAR(50) NOT NULL,
  field VARCHAR(255),
  row_count INTEGER,
  detected_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'open', -- open, resolved, ignored
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id)
);

CREATE INDEX idx_quality_issues_dataset ON quality_issues(dataset_id);
CREATE INDEX idx_quality_issues_status ON quality_issues(status);
CREATE INDEX idx_quality_issues_severity ON quality_issues(severity);
```

### Tabel: `quality_reports`
```sql
CREATE TABLE quality_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES dataset_metadata(id) ON DELETE CASCADE,
  overall_score DECIMAL(5,2),
  completeness_score DECIMAL(5,2),
  consistency_score DECIMAL(5,2),
  accuracy_score DECIMAL(5,2),
  validity_score DECIMAL(5,2),
  uniqueness_score DECIMAL(5,2),
  total_issues INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  high_issues INTEGER DEFAULT 0,
  medium_issues INTEGER DEFAULT 0,
  low_issues INTEGER DEFAULT 0,
  checked_at TIMESTAMP DEFAULT NOW(),
  checked_by UUID REFERENCES users(id)
);

CREATE INDEX idx_quality_reports_dataset ON quality_reports(dataset_id);
CREATE INDEX idx_quality_reports_checked ON quality_reports(checked_at DESC);
```

### API Endpoints:
```
POST   /api/data-quality/check/:datasetId           - runQualityCheck()
GET    /api/data-quality/report/:datasetId          - getQualityReport()
GET    /api/data-quality/issues/:datasetId          - listQualityIssues()
POST   /api/data-quality/rules                      - addQualityRule()
DELETE /api/data-quality/rules/:ruleId              - deleteQualityRule()
GET    /api/data-quality/rules/:datasetId           - listQualityRules()
PATCH  /api/data-quality/issues/:issueId/status     - updateQualityIssueStatus()
```

---

## 🔒 3. Access Control Tab

### Tabel: `dataset_access`
```sql
CREATE TABLE dataset_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES dataset_metadata(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- Viewer, Editor, Admin
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(dataset_id, user_id)
);

CREATE INDEX idx_dataset_access_dataset ON dataset_access(dataset_id);
CREATE INDEX idx_dataset_access_user ON dataset_access(user_id);
```

### Tabel: `access_requests`
```sql
CREATE TABLE access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES dataset_metadata(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  requested_role VARCHAR(50) NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  requested_at TIMESTAMP DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT
);

CREATE INDEX idx_access_requests_dataset ON access_requests(dataset_id);
CREATE INDEX idx_access_requests_user ON access_requests(user_id);
CREATE INDEX idx_access_requests_status ON access_requests(status);
```

### API Endpoints:
```
POST   /api/access-control/assign                      - assignRole()
DELETE /api/access-control/:datasetId/users/:userId    - revokeRole()
GET    /api/access-control/:datasetId                  - listAccess()
GET    /api/access-control/check/:datasetId/:userId    - checkPermission()
POST   /api/access-control/request                     - requestAccess()
POST   /api/access-control/approve/:requestId          - approveAccess()
POST   /api/access-control/reject/:requestId           - rejectAccess()
GET    /api/access-control/requests                    - listAccessRequests()
```

---

## ✅ 4. Approval Queue Tab

### Tabel: `approval_submissions`
```sql
CREATE TABLE approval_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES dataset_metadata(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES users(id),
  submission_type VARCHAR(50) NOT NULL, -- new, update, delete
  description TEXT NOT NULL,
  changes JSONB,
  status VARCHAR(50) DEFAULT 'pending', -- pending, under_review, approved, rejected
  priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, urgent
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT
);

CREATE INDEX idx_approval_submissions_dataset ON approval_submissions(dataset_id);
CREATE INDEX idx_approval_submissions_status ON approval_submissions(status);
CREATE INDEX idx_approval_submissions_priority ON approval_submissions(priority);
CREATE INDEX idx_approval_submissions_submitted ON approval_submissions(submitted_at DESC);
```

### Tabel: `approval_history`
```sql
CREATE TABLE approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES dataset_metadata(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES approval_submissions(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- submitted, reviewed, approved, rejected, commented
  performed_by UUID REFERENCES users(id),
  notes TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_approval_history_dataset ON approval_history(dataset_id);
CREATE INDEX idx_approval_history_submission ON approval_history(submission_id);
CREATE INDEX idx_approval_history_timestamp ON approval_history(timestamp DESC);
```

### API Endpoints:
```
POST   /api/approvals/submit                     - submitForApproval()
GET    /api/approvals/pending                    - listPendingApprovals()
GET    /api/approvals                            - listApprovalSubmissions()
POST   /api/approvals/approve/:submissionId      - approveDataset()
POST   /api/approvals/reject/:submissionId       - rejectDataset()
POST   /api/approvals/review/:submissionId       - markUnderReview()
GET    /api/approvals/history/:datasetId         - getApprovalHistory()
GET    /api/approvals/:submissionId              - getSubmissionById()
POST   /api/approvals/comment/:submissionId      - addSubmissionComment()
```

---

## 🔗 Relasi Antar Tabel

```
users (existing)
  ├─→ dataset_metadata (owner_id, created_by, updated_by)
  ├─→ quality_rules (created_by)
  ├─→ quality_issues (resolved_by)
  ├─→ quality_reports (checked_by)
  ├─→ dataset_access (user_id, granted_by)
  ├─→ access_requests (user_id, reviewed_by)
  ├─→ approval_submissions (submitted_by, reviewed_by)
  └─→ approval_history (performed_by)

dataset_metadata
  ├─→ quality_rules (dataset_id)
  ├─→ quality_issues (dataset_id)
  ├─→ quality_reports (dataset_id)
  ├─→ dataset_access (dataset_id)
  ├─→ access_requests (dataset_id)
  ├─→ approval_submissions (dataset_id)
  └─→ approval_history (dataset_id)

quality_rules
  └─→ quality_issues (rule_id)

approval_submissions
  └─→ approval_history (submission_id)
```

---

## 📊 Summary per Tab

| Tab | Tabel Utama | Jumlah API Endpoints | Fitur Utama |
|-----|------------|---------------------|-------------|
| **Metadata** | dataset_metadata | 6 | CRUD metadata, search, versioning |
| **Data Quality** | quality_rules, quality_issues, quality_reports | 7 | Rule management, quality checks, issue tracking |
| **Access Control** | dataset_access, access_requests | 8 | Role assignment, permission check, access requests |
| **Approval Queue** | approval_submissions, approval_history | 9 | Submission workflow, approval/reject, history tracking |
| **TOTAL** | **8 tabel** | **30 endpoints** | Full metadata governance |

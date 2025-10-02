# Standard Operating Procedure - IDS Connector Portal

## A. Penjelasan Peran dan Tanggung Jawab (RACI)

### Tentang Aplikasi

**IDS Connector Portal** adalah portal web untuk mengelola IDS (Industrial Data Space) Connector dalam ekosistem data sharing sektor migas. Portal ini memfasilitasi pertukaran data terstruktur antara KKKS (Kontraktor Kontrak Kerja Sama) sebagai penyedia data dan SKK Migas sebagai konsumen data, dengan mekanisme governance, security, dan compliance yang ketat.

---

### 1. Definisi Peran

#### 1.1. Peran dalam RACI Matrix

| Kode | Peran | Deskripsi |
|------|-------|-----------|
| **R** | Responsible | Orang yang melakukan pekerjaan untuk menyelesaikan tugas |
| **A** | Accountable | Orang yang bertanggung jawab akhir dan memiliki otoritas keputusan |
| **C** | Consulted | Orang yang memberikan input dan harus dikonsultasikan |
| **I** | Informed | Orang yang harus diberi informasi tentang keputusan atau tindakan |

#### 1.2. Stakeholder Roles - IDS Portal

| Role | Nama Peran | Deskripsi |
|------|------------|-----------|
| **Admin** | Administrator Portal | Mengelola seluruh platform, konfigurasi sistem, user management, dan infrastructure |
| **KKKS-Provider** | Data Provider (KKKS) | Kontraktor yang menyediakan data migas untuk dibagikan ke SKK Migas |
| **SKK-Consumer** | Data Consumer (SKK Migas) | Pihak SKK Migas yang mengkonsumsi data dari KKKS |
| **Connector Admin** | Administrator Connector | Mengelola IDS Connector instances, routing, dan integrasi backend |
| **Data Steward** | Pengelola Metadata | Mengelola metadata, kualitas data, vocabulary, dan catalog |
| **Security Officer** | Petugas Keamanan | Memastikan kepatuhan security policies, access control, dan audit |
| **Approver/Reviewer** | Pemberi Persetujuan | Menyetujui/menolak submission data, access requests, dan contract agreements |

---

## 2. RACI Matrix per Modul IDS Connector Portal

### 2.1. Dashboard & Monitoring

| Aktivitas | Admin | KKKS-Provider | SKK-Consumer | Connector Admin | Security Officer |
|-----------|-------|---------------|--------------|-----------------|------------------|
| **View Dashboard Overview** | R | R | R | R | R |
| **Monitor System Status** | A/R | I | I | R | C |
| **View Real-time Metrics** | R | R | R | R | C |
| **Configure Dashboard Widgets** | A/R | C | C | C | I |
| **Export Dashboard Reports** | R | R | R | R | C |

**Catatan:**
- Semua role dapat melihat dashboard sesuai scope akses mereka
- Admin bertanggung jawab untuk konfigurasi dashboard

---

### 2.2. Metadata Management

| Aktivitas | Admin | KKKS-Provider | SKK-Consumer | Data Steward | Approver |
|-----------|-------|---------------|--------------|--------------|----------|
| **Membuat Dataset Metadata** | C | A/R | I | R | I |
| **Update Metadata** | C | A/R | I | R | C |
| **Delete Metadata** | A | R | I | C | C |
| **View Metadata** | R | R | R | R | R |
| **Search Dataset Catalog** | R | R | R | R | I |
| **Set Data Quality Rules** | C | C | I | A/R | I |
| **Review Quality Reports** | C | R | I | A/R | C |
| **Manage Quality Issues** | I | R | I | A/R | C |
| **Assign Dataset Access** | A | R | C | C | C |
| **Request Dataset Access** | I | I | A/R | C | C |
| **Approve Access Request** | C | C | I | C | A/R |
| **Submit for Approval** | I | R | I | C | I |
| **Approve/Reject Submission** | C | I | I | C | A/R |

**Catatan:**
- KKKS-Provider sebagai data owner bertanggung jawab atas metadata dataset mereka
- Data Steward mengelola kualitas dan governance metadata
- SKK-Consumer dapat request akses dan view metadata yang diizinkan
- Approver (bisa Admin atau delegated role) untuk approval workflow

---

### 2.3. Vocabularies & Ontology Management

| Aktivitas | Admin | Data Steward | KKKS-Provider | SKK-Consumer | Approver |
|-----------|-------|--------------|---------------|--------------|----------|
| **Import Vocabulary** | C | A/R | I | I | I |
| **Manage Terms & Concepts** | C | A/R | C | I | I |
| **Map to Standards** | I | A/R | C | I | C |
| **Search Vocabulary** | R | R | R | R | I |
| **Export Ontology** | R | A/R | C | C | I |
| **Validate Mapping** | C | R | C | I | A |

**Catatan:**
- Data Steward mengelola vocabulary dan ontology untuk standardisasi
- Vocabulary digunakan untuk semantic interoperability antar connector

---

### 2.4. Policy & Governance

| Aktivitas | Admin | KKKS-Provider | SKK-Consumer | Security Officer | Approver |
|-----------|-------|---------------|--------------|------------------|----------|
| **Create Data Policy** | C | R | I | C | A |
| **Update Policy** | C | R | I | C | A |
| **Enforce Policy** | R | C | C | A/R | C |
| **View Policies** | R | R | R | R | I |
| **Audit Policy Compliance** | C | I | I | A/R | C |

**Catatan:**
- KKKS-Provider membuat policy untuk data mereka
- Security Officer mengenforce policy compliance
- Admin dan Approver memberikan final approval untuk policy changes

---

### 2.5. Contract Management

| Aktivitas | Admin | KKKS-Provider | SKK-Consumer | Security Officer | Approver |
|-----------|-------|---------------|--------------|------------------|----------|
| **Create Data Contract** | C | A/R | C | I | C |
| **Negotiate Contract Terms** | C | R | R | I | A |
| **Sign Contract** | C | A/R | A/R | I | C |
| **Monitor Contract** | R | R | R | C | I |
| **Terminate Contract** | C | R | R | C | A |

**Catatan:**
- Contract mendefinisikan terms of data sharing antara provider dan consumer
- Kedua pihak (KKKS dan SKK) harus agree untuk execute contract
- Approver memberikan approval untuk contract yang signifikan

---

### 2.6. Data Transfer & Routing

| Aktivitas | Admin | KKKS-Provider | SKK-Consumer | Connector Admin | Security Officer |
|-----------|-------|---------------|--------------|-----------------|------------------|
| **Configure Routing** | C | C | I | A/R | C |
| **Initiate Transfer** | I | R | A/R | C | C |
| **Monitor Transfer** | R | R | R | A/R | C |
| **View Transfer History** | R | R | R | R | R |
| **Troubleshoot Transfer** | C | I | I | A/R | C |
| **Cancel Transfer** | C | R | A | R | I |

**Catatan:**
- SKK-Consumer initiate data request/transfer
- Connector Admin mengelola routing dan technical execution
- Security Officer monitor untuk compliance

---

### 2.7. Activity History & Audit

| Aktivitas | Admin | KKKS-Provider | SKK-Consumer | Connector Admin | Security Officer |
|-----------|-------|---------------|--------------|-----------------|------------------|
| **View Own Activity** | R | R | R | R | R |
| **View All Activities** | R | I | I | C | A/R |
| **Export Audit Logs** | R | C | C | C | A/R |
| **Analyze Activity Patterns** | C | I | I | C | A/R |
| **Generate Compliance Reports** | C | I | I | C | A/R |

**Catatan:**
- Security Officer memiliki akses penuh ke audit logs
- Setiap user dapat lihat activity history mereka sendiri
- Admin dapat view untuk troubleshooting

---

### 2.8. Clearing House (Regulatory Data Submission)

| Aktivitas | Admin | KKKS-Provider | SKK-Consumer | Security Officer | Approver |
|-----------|-------|---------------|--------------|------------------|----------|
| **Submit Regulatory Data** | I | A/R | I | C | C |
| **Validate Submission** | C | C | I | C | A/R |
| **Acknowledge Receipt** | C | I | I | C | A/R |
| **Track Obligations** | R | A/R | C | C | C |
| **Generate Compliance Report** | C | R | I | R | A |
| **Audit Submissions** | C | I | I | A/R | C |

**Catatan:**
- KKKS-Provider submit data untuk regulatory compliance ke SKK Migas
- Clearing house memastikan traceability dan accountability
- Approver/SKK validate dan acknowledge submission

---

### 2.9. User Management (Admin Only)

| Aktivitas | Admin | Security Officer | Approver | KKKS-Provider | SKK-Consumer |
|-----------|-------|------------------|----------|---------------|--------------|
| **Create User Account** | A/R | C | I | I | I |
| **Assign Role** | A/R | C | C | I | I |
| **Activate/Deactivate User** | A/R | C | I | I | I |
| **Reset Password** | R | C | I | A | A |
| **View User List** | A/R | R | I | I | I |
| **Audit User Activities** | R | A/R | I | I | I |

**Catatan:**
- Admin mengelola user accounts
- Security Officer mengaudit untuk keamanan
- Users dapat reset password mereka sendiri

---

### 2.10. Participants Management (Admin Only)

| Aktivitas | Admin | Security Officer | KKKS-Provider | SKK-Consumer | Connector Admin |
|-----------|-------|------------------|---------------|--------------|-----------------|
| **Register New Participant** | A/R | C | I | I | C |
| **Update Participant Info** | A/R | C | C | C | C |
| **Deactivate Participant** | A/R | C | I | I | C |
| **View Participants** | R | R | R | R | R |
| **Manage Participant Connectors** | R | C | I | I | A/R |

**Catatan:**
- Participant adalah entity/organization dalam dataspace (KKKS companies, SKK Migas)
- Admin onboard dan manage participants

---

### 2.11. License Management (Admin Only)

| Aktivitas | Admin | Connector Admin | KKKS-Provider | SKK-Consumer | Approver |
|-----------|-------|-----------------|---------------|--------------|----------|
| **Add License** | A/R | C | I | I | C |
| **Update License** | A/R | C | I | I | C |
| **Monitor License Usage** | A/R | R | I | I | C |
| **Renew License** | A/R | C | I | I | C |
| **Audit License Compliance** | R | C | I | I | A/R |

**Catatan:**
- Admin mengelola lisensi untuk IDS components
- Connector Admin monitor usage

---

### 2.12. Connector Controller (Admin Only)

| Aktivitas | Admin | Connector Admin | Security Officer | KKKS-Provider | SKK-Consumer |
|-----------|-------|-----------------|------------------|---------------|--------------|
| **Configure Connector** | C | A/R | C | I | I |
| **Deploy Connector Instance** | C | A/R | C | I | I |
| **Monitor Connector Health** | R | A/R | C | I | I |
| **Update Connector Config** | C | A/R | C | I | I |
| **Restart/Stop Connector** | C | A/R | I | I | I |
| **View Connector Logs** | R | A/R | C | I | I |

**Catatan:**
- Connector Admin bertanggung jawab untuk technical operations
- Admin supervisi dan approval untuk critical changes

---

### 2.13. Dataspace Connector (Admin Only)

| Aktivitas | Admin | Connector Admin | Security Officer | KKKS-Provider | SKK-Consumer |
|-----------|-------|-----------------|------------------|---------------|--------------|
| **Manage Dataspace Config** | C | A/R | C | I | I |
| **Configure Self-Description** | C | A/R | C | I | I |
| **Manage Connector Endpoints** | C | A/R | C | I | I |
| **Monitor Dataspace Status** | R | A/R | C | I | I |

**Catatan:**
- Dataspace connector adalah IDS-compliant connector implementation
- Connector Admin mengelola technical configuration

---

### 2.14. Backend System Integration (Admin Only)

| Aktivitas | Admin | Connector Admin | KKKS-Provider | SKK-Consumer | Security Officer |
|-----------|-------|-----------------|---------------|--------------|------------------|
| **Configure Backend Connection** | C | A/R | C | C | C |
| **Test Integration** | C | A/R | C | C | I |
| **Map Data Sources** | C | A/R | R | I | I |
| **Monitor Backend Health** | R | A/R | C | C | C |
| **Troubleshoot Issues** | C | A/R | I | I | C |

**Catatan:**
- Backend systems adalah source systems dari KKKS (databases, APIs, files)
- Connector Admin mengelola integrasi teknis
- KKKS-Provider provides access ke backend mereka

---

### 2.15. External Services (Admin Only)

| Aktivitas | Admin | Connector Admin | Security Officer | KKKS-Provider | SKK-Consumer |
|-----------|-------|-----------------|------------------|---------------|--------------|
| **Register External Service** | A/R | C | C | I | I |
| **Configure Service Connection** | A/R | R | C | I | I |
| **Manage API Keys** | A/R | C | A | I | I |
| **Monitor Service Status** | R | R | C | I | I |
| **Update Service Config** | A/R | R | C | I | I |

**Catatan:**
- External services termasuk brokers, clearing house, authentication services
- Admin mengelola integrations

---

### 2.16. GUI Settings (Admin Only)

| Aktivitas | Admin | KKKS-Provider | SKK-Consumer | Connector Admin | Security Officer |
|-----------|-------|---------------|--------------|-----------------|------------------|
| **Configure UI Preferences** | A/R | R | R | I | I |
| **Manage Themes** | A/R | C | C | I | I |
| **Set Default Views** | A/R | C | C | I | I |
| **Configure Notifications** | A/R | R | R | I | I |

**Catatan:**
- Admin mengelola global UI settings
- Users dapat customize personal preferences

---

## 3. Workflow & Escalation

### 3.1. Alur Data Sharing (Provider to Consumer)

```
1. KKKS-Provider upload/register dataset → (R)
2. Data Steward create metadata → (R)
3. KKKS-Provider submit for approval → (R)
4. Approver review and approve → (A)
5. Dataset available in catalog → (System)
6. SKK-Consumer search and request access → (R)
7. KKKS-Provider review request → (C)
8. Approver approve access → (A)
9. Contract created and signed → (R by both parties)
10. SKK-Consumer initiate data transfer → (R)
11. Connector Admin execute routing → (R)
12. Transfer completed and logged → (System)
```

### 3.2. Alur Persetujuan Metadata

```
1. KKKS-Provider create/update metadata → (R)
2. Data Steward review metadata quality → (R)
3. System run quality checks → (Automated)
4. Data Steward review quality report → (R)
5. KKKS-Provider fix issues if any → (R)
6. KKKS-Provider submit for approval → (R)
7. Approver review submission → (A)
8. Approver approve/reject → (A)
9. If approved: Dataset published to catalog → (System)
10. All parties notified → (I)
```

### 3.3. Alur Permintaan Akses Dataset

```
1. SKK-Consumer browse catalog → (R)
2. SKK-Consumer request access with reason → (R)
3. System notify KKKS-Provider → (I)
4. KKKS-Provider review request → (C)
5. Approver evaluate request → (A)
6. Approver approve/reject with notes → (A)
7. If approved: Admin/System grant access → (R)
8. Contract negotiated and signed → (R)
9. SKK-Consumer notified → (I)
10. Access logged for audit → (System)
```

### 3.4. Alur Clearing House Submission

```
1. KKKS-Provider prepare regulatory data → (R)
2. KKKS-Provider submit to clearing house → (R)
3. System validate format and completeness → (Automated)
4. Approver/SKK receive submission → (I)
5. Approver validate compliance → (A)
6. Approver acknowledge receipt → (A)
7. System track obligation → (Automated)
8. Compliance report generated → (System)
9. All parties notified → (I)
```

---

## 4. Eskalasi Masalah

| Level | Kondisi | Escalate To | Timeframe | Notifikasi |
|-------|---------|-------------|-----------|------------|
| **L1** | Quality Issue - Low/Medium | Data Steward | 48 jam | Email |
| **L2** | Quality Issue - High/Critical | KKKS-Provider + Data Steward | 24 jam | Email + Slack |
| **L3** | Transfer Failure | Connector Admin | 4 jam | Slack + Dashboard Alert |
| **L4** | Security Incident | Security Officer + Admin | Immediate | Phone + Email + Slack |
| **L5** | System Outage | Admin + Connector Admin | Immediate | Phone + PagerDuty |
| **L6** | Data Breach | Security Officer + Admin + Management | Immediate | Phone + Emergency Meeting |
| **L7** | Connector Down | Connector Admin | 2 jam | Slack + Dashboard Alert |
| **L8** | Contract Violation | Approver + Legal | 24 jam | Email + Meeting |
| **L9** | Compliance Issue | Security Officer + Approver | 12 jam | Email + Slack |

---

## 5. Komunikasi & Koordinasi

### 5.1. Meeting Schedule

| Meeting | Frekuensi | Peserta | Tujuan |
|---------|-----------|---------|--------|
| **Technical Ops Standup** | Harian | Admin, Connector Admin | Sync system status & issues |
| **Data Quality Review** | Mingguan | Data Steward, KKKS-Provider (selected) | Review quality metrics & issues |
| **Access & Security Audit** | Mingguan | Security Officer, Admin | Review access logs & security events |
| **Provider-Consumer Sync** | Bi-weekly | KKKS-Provider, SKK-Consumer, Admin | Coordination on data sharing |
| **Approval Queue Review** | Mingguan | Approver, Data Steward | Clear backlog & review submissions |
| **Connector Health Check** | Mingguan | Connector Admin, Admin | Review connector performance |
| **Compliance Review** | Bulanan | Security Officer, Approver, Admin | Audit regulatory compliance |
| **Governance Board** | Quarterly | All Stakeholders + Management | Strategy, policy, roadmap review |

### 5.2. Notification Rules

| Event | Notify | Method | Priority | SLA Response |
|-------|--------|--------|----------|--------------|
| **Connector Down** | Admin, Connector Admin | Slack + PagerDuty | Critical | Immediate |
| **Transfer Failed** | Connector Admin, SKK-Consumer, KKKS-Provider | Email + Slack | High | 4 jam |
| **Security Alert** | Security Officer, Admin | Slack + Email | Critical | Immediate |
| **Critical Quality Issue** | KKKS-Provider, Data Steward | Email + Dashboard | High | 24 jam |
| **Access Request** | KKKS-Provider, Approver | Email + Dashboard | Medium | 4 jam |
| **Access Approved** | SKK-Consumer | Email + Dashboard | Low | - |
| **Dataset Submitted** | Approver, Data Steward | Email + Dashboard | Medium | 1 hari |
| **Dataset Approved** | KKKS-Provider, Data Steward | Email + Dashboard | Low | - |
| **Contract Signed** | Both parties, Admin | Email | Medium | - |
| **Clearing House Submission** | Approver, SKK-Consumer | Email + Dashboard | Medium | 1 hari |
| **License Expiring** | Admin | Email + Dashboard | Medium | 30 hari sebelum |
| **System Maintenance** | All Users | Email + Banner | Low | 3 hari sebelum |

---

## 6. Tanggung Jawab Khusus per Role

### 6.1. Admin (Administrator Portal)
- **Akuntabilitas**: Keseluruhan operasional platform dan infrastruktur
- **Keputusan**:
  - Onboarding/offboarding users dan participants
  - System configuration changes
  - License management
  - Emergency actions (restart services, maintenance mode)
- **Monitoring**: System health, performance metrics, resource utilization
- **Koordinasi**: Dengan semua stakeholder untuk platform operations
- **Escalation**: First responder untuk critical system issues

### 6.2. KKKS-Provider (Data Provider)
- **Akuntabilitas**: Dataset yang mereka provide, termasuk kualitas dan akurasi
- **Keputusan**:
  - Approve/reject access requests ke dataset mereka
  - Define data policies dan usage constraints
  - Set data quality standards
- **Aktivitas**:
  - Upload dan register datasets
  - Create dan maintain metadata
  - Submit data for approval
  - Review dan respond to access requests
  - Monitor data usage oleh consumers
- **Compliance**: Ensure data sesuai regulatory requirements

### 6.3. SKK-Consumer (Data Consumer - SKK Migas)
- **Akuntabilitas**: Proper usage of data sesuai contract dan policy
- **Aktivitas**:
  - Browse dan search data catalog
  - Request access to datasets dengan justifikasi
  - Initiate data transfers
  - Monitor data received
  - Validate regulatory data submissions (clearing house)
- **Compliance**: Adhere to data usage policies dan contracts

### 6.4. Connector Admin
- **Akuntabilitas**: Technical health dan performance of IDS connectors
- **Keputusan**:
  - Connector deployment strategy
  - Routing configuration
  - Backend integration setup
- **Monitoring**:
  - Connector uptime dan availability
  - Data transfer success rates
  - Integration health
- **Troubleshooting**: First-line technical support untuk connector issues
- **Maintenance**: Regular updates dan patches

### 6.5. Data Steward
- **Akuntabilitas**: Metadata quality, data governance, dan standardization
- **Aktivitas**:
  - Review dan validate metadata submissions
  - Manage data quality rules
  - Monitor quality reports
  - Maintain vocabularies dan ontologies
  - Coordinate approval queue
  - Document data lineage
- **Koordinasi**: Bridge antara providers, consumers, dan technical teams
- **Reporting**: Regular governance reports

### 6.6. Security Officer
- **Akuntabilitas**: Security posture dan compliance of platform
- **Monitoring**:
  - Access logs dan authentication events
  - Security alerts dan anomalies
  - Policy violations
  - Audit trails
- **Investigation**: Security incidents dan potential breaches
- **Enforcement**: Security policies dan access controls
- **Reporting**: Regular security reports ke management
- **Compliance**: Ensure adherence to regulations (e.g., ISO 27001, GDPR-like)

### 6.7. Approver/Reviewer
- **Akuntabilitas**: Quality of approval decisions
- **Review Activities**:
  - Metadata submissions (completeness, accuracy)
  - Access requests (legitimacy, justification)
  - Contract terms
  - Clearing house submissions (regulatory compliance)
- **Decision**: Approve/reject dengan clear justification
- **Timeline**: Must respond within SLA timeframes
- **Dokumentasi**: Document decision rationale untuk audit trail
- **Delegation**: Can delegate approval authority when needed

---

## 7. SLA (Service Level Agreement)

### 7.1. Operational SLA

| Aktivitas | Target Response Time | Target Resolution Time | Responsible |
|-----------|---------------------|------------------------|-------------|
| **Access Request** | 4 jam kerja | 2 hari kerja | Approver |
| **Metadata Approval (Normal)** | 1 hari kerja | 3 hari kerja | Approver |
| **Metadata Approval (Urgent)** | 4 jam kerja | 1 hari kerja | Approver |
| **Contract Negotiation** | 2 hari kerja | 1 minggu | Both parties |
| **Data Transfer Request** | 2 jam kerja | 4 jam kerja | Connector Admin |
| **Clearing House Submission** | 1 hari kerja | 3 hari kerja | Approver/SKK |

### 7.2. Quality & Issues SLA

| Issue Type | Detection | Response Time | Resolution Time | Responsible |
|------------|-----------|---------------|-----------------|-------------|
| **Critical Quality Issue** | Automated + Manual | 2 jam | 24 jam | KKKS-Provider + Data Steward |
| **High Quality Issue** | Automated + Manual | 1 hari kerja | 3 hari kerja | KKKS-Provider |
| **Medium Quality Issue** | Automated | 2 hari kerja | 1 minggu | KKKS-Provider |
| **Low Quality Issue** | Automated | 1 minggu | 2 minggu | Data Steward |

### 7.3. Technical Support SLA

| Issue Severity | Response Time | Resolution Time | Availability | Responsible |
|----------------|---------------|-----------------|--------------|-------------|
| **Critical (P1)** | 15 menit | 4 jam | 24/7 | Admin + Connector Admin |
| **High (P2)** | 1 jam | 8 jam kerja | Business hours | Admin + Connector Admin |
| **Medium (P3)** | 4 jam kerja | 2 hari kerja | Business hours | Admin |
| **Low (P4)** | 1 hari kerja | 1 minggu | Business hours | Admin |

### 7.4. System Availability SLA

| Component | Target Uptime | Maintenance Window | Recovery Time Objective (RTO) |
|-----------|---------------|-------------------|-------------------------------|
| **IDS Portal Web UI** | 99.5% | Sunday 02:00-06:00 WIB | 2 jam |
| **IDS Connectors** | 99.9% | Sunday 02:00-04:00 WIB | 1 jam |
| **Database** | 99.9% | Sunday 03:00-05:00 WIB | 1 jam |
| **API Gateway** | 99.9% | Sunday 02:00-04:00 WIB | 30 menit |
| **Backend Integrations** | 99.0% | As needed | 4 jam |

### 7.5. Data Transfer SLA

| Transfer Type | Max Latency | Success Rate | Retry Policy |
|---------------|-------------|--------------|--------------|
| **Real-time (Streaming)** | < 5 detik | 99.5% | Auto-retry 3x |
| **Near Real-time (API)** | < 30 detik | 99.0% | Auto-retry 5x |
| **Batch (Scheduled)** | < 1 jam | 99.5% | Auto-retry on failure |
| **On-demand** | < 5 menit | 99.0% | Manual retry available |

---

## 8. Audit & Compliance

### 8.1. Audit Trail Requirements

Semua aktivitas berikut **HARUS** di-log dengan informasi lengkap:

#### 8.1.1. User Activities
- User ID & Name
- Role
- Timestamp (UTC + WIB)
- Action Type (Login, Logout, Create, Update, Delete, View, Download, etc)
- Resource Affected (Dataset ID, Contract ID, Policy ID, etc)
- Old Value / New Value (untuk updates)
- IP Address & User Agent
- Success/Failure Status
- Session ID

#### 8.1.2. Data Transfer Activities
- Transfer ID
- Source (KKKS-Provider)
- Destination (SKK-Consumer)
- Dataset ID & Name
- Transfer Type (Streaming, Batch, On-demand)
- Data Volume (bytes)
- Start Time & End Time
- Duration
- Status (Success, Failed, Partial)
- Error Messages (jika ada)
- Connector ID used

#### 8.1.3. Approval Activities
- Submission ID
- Submitter (User ID & Name)
- Reviewer/Approver (User ID & Name)
- Submission Type (Metadata, Access Request, Contract)
- Decision (Approved, Rejected, Under Review)
- Decision Notes
- Timestamp
- Supporting Documents

#### 8.1.4. Security Events
- Event Type (Login Failure, Unauthorized Access, Policy Violation, etc)
- User ID (if applicable)
- Source IP
- Target Resource
- Timestamp
- Severity Level
- Action Taken (Blocked, Logged, Alerted)

### 8.2. Periodic Reviews

| Review Type | Frequency | Responsible | Purpose | Deliverable |
|-------------|-----------|-------------|---------|-------------|
| **Access Rights Review** | Monthly | Security Officer | Identify and remove unused/excessive access | Access review report |
| **Data Quality Metrics** | Weekly | Data Steward | Trend analysis, identify degradation | Quality trend report |
| **Approval Queue Health** | Daily | Data Steward | Prevent bottlenecks, clear backlogs | Queue status dashboard |
| **System Security Scan** | Weekly | Security Officer | Vulnerability assessment | Security scan report |
| **Connector Performance** | Weekly | Connector Admin | Identify performance issues | Performance metrics report |
| **Data Lineage Documentation** | Quarterly | Data Steward | Update data flow documentation | Lineage diagram update |
| **Contract Compliance** | Monthly | Approver | Ensure adherence to terms | Compliance checklist |
| **License Utilization** | Monthly | Admin | Optimize license usage | License usage report |
| **Audit Log Review** | Weekly | Security Officer | Detect anomalies | Audit findings report |
| **Clearing House Submissions** | Weekly | Approver/SKK | Regulatory compliance check | Compliance status report |

### 8.3. Compliance Requirements

#### 8.3.1. Data Governance Compliance
- ✅ All datasets must have complete metadata
- ✅ Data quality score minimum 80/100
- ✅ All access must be authorized and logged
- ✅ Contracts must be in place before data sharing
- ✅ Regular quality checks (minimum weekly)

#### 8.3.2. Security Compliance
- ✅ Multi-factor authentication untuk Admin roles
- ✅ Password policy: min 12 char, complexity requirements
- ✅ Session timeout: 30 menit inactivity
- ✅ Encryption at rest dan in transit (TLS 1.3)
- ✅ Regular security audits (quarterly)
- ✅ Incident response plan documented dan tested

#### 8.3.3. Regulatory Compliance (Sektor Migas)
- ✅ SKK Migas data submission requirements
- ✅ Retention policy: minimum 7 tahun
- ✅ Audit trail retention: minimum 3 tahun
- ✅ Data privacy sesuai peraturan Indonesia
- ✅ Clearing house submissions on-time (100% compliance)

### 8.4. Audit Report Schedule

| Report Type | Frequency | Audience | Due Date |
|-------------|-----------|----------|----------|
| **Daily Operations Report** | Harian | Admin, Connector Admin | 09:00 WIB next day |
| **Weekly Activity Summary** | Mingguan | All stakeholders | Senin 10:00 WIB |
| **Monthly Access Report** | Bulanan | Security Officer, Management | Tanggal 5 bulan berikutnya |
| **Monthly Quality Report** | Bulanan | Data Steward, KKKS-Providers | Tanggal 5 bulan berikutnya |
| **Quarterly Compliance Report** | Quarterly | Security Officer, Management, SKK Migas | 10 hari setelah quarter end |
| **Annual Audit Report** | Tahunan | Management, External Auditors | 31 Januari tahun berikutnya |

---

## 9. Training & Onboarding

### 9.1. Training Requirements per Role

| Role | Training Modules | Duration | Format | Renewal | Certification |
|------|-----------------|----------|--------|---------|---------------|
| **Admin** | - IDS Portal Administration<br>- User & Participant Management<br>- System Configuration<br>- Incident Response | 16 jam | Hands-on + Theory | Semi-annual | Required |
| **KKKS-Provider** | - IDS Concepts & Data Sharing<br>- Metadata Management<br>- Data Quality Standards<br>- Policy & Contract Creation | 8 jam | Online + Workshop | Annual | Recommended |
| **SKK-Consumer** | - Data Discovery & Catalog<br>- Access Request Process<br>- Data Usage Compliance<br>- Contract Management | 6 jam | Online + Workshop | Annual | Recommended |
| **Connector Admin** | - IDS Connector Architecture<br>- Deployment & Configuration<br>- Troubleshooting & Monitoring<br>- Integration with Backend Systems | 24 jam | Technical Training | Semi-annual | Required |
| **Data Steward** | - Metadata Standards<br>- Data Quality Management<br>- Vocabulary & Ontology<br>- Governance Best Practices | 12 jam | Theory + Practice | Semi-annual | Required |
| **Security Officer** | - IDS Security Architecture<br>- Access Control & RBAC<br>- Audit & Compliance<br>- Incident Investigation | 16 jam | Security Training | Annual | Required |
| **Approver** | - Approval Workflows<br>- Decision Criteria<br>- Compliance Requirements<br>- Documentation Standards | 4 jam | Online | Annual | Recommended |

### 9.2. Onboarding Process

#### 9.2.1. New User Onboarding (1-2 hari)
1. **Day 1 Morning**: System access provisioning oleh Admin
2. **Day 1 Afternoon**: Role-specific training (sesuai tabel di atas)
3. **Day 2 Morning**: Hands-on practice dengan mentor
4. **Day 2 Afternoon**: Assessment & certification (jika required)

#### 9.2.2. New Participant Onboarding (KKKS Company) (1-2 minggu)
1. **Week 1**:
   - Legal & contract setup
   - Admin setup organization profile
   - Connector Admin deploy connector instance
   - Backend system integration testing
2. **Week 2**:
   - User accounts creation untuk staff
   - Role assignment dan access provisioning
   - Training untuk users
   - Go-live dengan monitoring

#### 9.2.3. Knowledge Transfer Materials
- 📚 User Guides (per role)
- 🎥 Video Tutorials
- 📋 Quick Reference Cards
- 🔧 Troubleshooting Guides
- 💡 Best Practices Documentation
- ❓ FAQ Repository

---

## 10. Kontak & Eskalasi

### 10.1. Primary Contacts

| Role | Contact Person | Email | Phone | Backup Person | Backup Email |
|------|---------------|-------|-------|---------------|--------------|
| **Admin Lead** | [Nama] | admin@skkmigas.go.id | +62-XXX-XXXX-XX01 | [Backup] | backup-admin@skkmigas.go.id |
| **Connector Admin Lead** | [Nama] | connector-admin@skkmigas.go.id | +62-XXX-XXXX-XX02 | [Backup] | backup-connector@skkmigas.go.id |
| **Data Steward Lead** | [Nama] | data-steward@skkmigas.go.id | +62-XXX-XXXX-XX03 | [Backup] | backup-steward@skkmigas.go.id |
| **Security Officer** | [Nama] | security@skkmigas.go.id | +62-XXX-XXXX-XX04 | [Backup] | backup-security@skkmigas.go.id |
| **Approver Lead** | [Nama] | approver@skkmigas.go.id | +62-XXX-XXXX-XX05 | [Backup] | backup-approver@skkmigas.go.id |

### 10.2. Emergency Contacts (24/7)

| Emergency Type | Contact | Phone | Email |
|----------------|---------|-------|-------|
| **System Critical Failure** | On-Call Admin | +62-XXX-XXXX-XX10 | oncall-admin@skkmigas.go.id |
| **Security Incident** | Security Hotline | +62-XXX-XXXX-XX11 | security-incident@skkmigas.go.id |
| **Data Breach** | CISO | +62-XXX-XXXX-XX12 | ciso@skkmigas.go.id |
| **Connector Outage** | On-Call Connector Admin | +62-XXX-XXXX-XX13 | oncall-connector@skkmigas.go.id |

### 10.3. Support Channels

| Channel | Purpose | Availability | Response Time |
|---------|---------|--------------|---------------|
| **Email** | support@ids-portal.skkmigas.go.id | 24/7 | 4 jam kerja |
| **Slack** | #ids-portal-support | Business hours | 1 jam |
| **Ticketing System** | https://support.ids-portal.skkmigas.go.id | 24/7 | Sesuai SLA |
| **Phone Hotline** | +62-XXX-XXXX-XX99 | Business hours | 15 menit |
| **Emergency Hotline** | +62-XXX-XXXX-XX00 | 24/7 | Immediate |

### 10.4. Escalation Matrix

| Issue Level | Initial Contact | If No Response (Time) | Escalate To | Final Escalation |
|-------------|-----------------|----------------------|-------------|------------------|
| **P1 (Critical)** | On-Call Admin | 15 menit | Admin Lead + Management | CIO |
| **P2 (High)** | Support Team | 1 jam | Responsible Team Lead | Admin Lead |
| **P3 (Medium)** | Support Team | 4 jam | Responsible Team Lead | Admin Lead |
| **P4 (Low)** | Support Team | 1 hari kerja | Team Lead | - |

---

## 11. Dokumen Terkait

### 11.1. Dokumen Pendukung
- 📄 User Manual - IDS Connector Portal
- 📄 Technical Architecture Document
- 📄 Security Policy & Procedures
- 📄 Data Governance Framework
- 📄 Incident Response Plan
- 📄 Disaster Recovery Plan
- 📄 API Documentation
- 📄 Database Schema Documentation (metadata-database-schema.md)

### 11.2. Template Forms
- 📋 Access Request Form
- 📋 Metadata Submission Template
- 📋 Contract Template
- 📋 Change Request Form
- 📋 Incident Report Template
- 📋 Quality Issue Report

### 11.3. External References
- 🔗 IDS Reference Architecture Model (IDS-RAM)
- 🔗 SKK Migas Data Governance Policy
- 🔗 Indonesian Data Protection Regulations
- 🔗 ISO 27001 Security Standards

---

## 12. Revision History

| Version | Date | Author | Changes | Approved By |
|---------|------|--------|---------|-------------|
| 1.0 | 2025-10-01 | IDS Portal Team | Initial SOP creation untuk IDS Connector Portal | [Approver Name] |
| | | | - Defined RACI matrix untuk 16 modul | |
| | | | - Established workflows dan SLA | |
| | | | - Documented compliance requirements | |

---

## 13. Approval & Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Prepared By** | Data Steward Lead | _________________ | __________ |
| **Reviewed By** | Security Officer | _________________ | __________ |
| **Reviewed By** | Admin Lead | _________________ | __________ |
| **Approved By** | Head of IT | _________________ | __________ |
| **Approved By** | SKK Migas Management | _________________ | __________ |

---

*Dokumen ini di-maintain oleh Data Governance Team - IDS Connector Portal*
*Last Updated: 2025-10-01*
*Version: 1.0*
*Next Review Date: 2025-04-01*

---

**Catatan Penting:**
- SOP ini harus direview setiap 6 bulan atau ketika ada perubahan signifikan pada platform
- Semua stakeholder wajib membaca dan memahami tanggung jawab mereka
- Training mandatory untuk roles dengan "Required" certification
- Compliance dengan SOP ini adalah mandatory dan akan diaudit secara berkala

-- CreateEnum
CREATE TYPE "public"."AuditEventType" AS ENUM ('RESOURCE_UPLOAD', 'RESOURCE_DOWNLOAD', 'RESOURCE_ACCESS', 'RESOURCE_MODIFICATION', 'RESOURCE_DELETION', 'REQUEST_SUBMITTED', 'REQUEST_APPROVED', 'REQUEST_REJECTED', 'REQUEST_DELIVERED', 'USER_LOGIN', 'USER_LOGOUT', 'USER_PERMISSION_CHANGE', 'SYSTEM_CONFIGURATION', 'DATA_EXPORT', 'SECURITY_INCIDENT', 'COMPLIANCE_VIOLATION', 'CONTRACT_CREATED', 'CONTRACT_MODIFIED', 'CONTRACT_TERMINATED');

-- CreateEnum
CREATE TYPE "public"."DataClassification" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET');

-- CreateEnum
CREATE TYPE "public"."SecurityLevel" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET');

-- CreateEnum
CREATE TYPE "public"."VirusScanStatus" AS ENUM ('PENDING', 'CLEAN', 'INFECTED', 'QUARANTINED', 'SCAN_FAILED');

-- CreateEnum
CREATE TYPE "public"."EncryptionStatus" AS ENUM ('NOT_ENCRYPTED', 'ENCRYPTED_AT_REST', 'ENCRYPTED_IN_TRANSIT', 'FULLY_ENCRYPTED');

-- CreateEnum
CREATE TYPE "public"."UploadStatus" AS ENUM ('INITIATED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'QUARANTINED');

-- CreateEnum
CREATE TYPE "public"."RequestActionType" AS ENUM ('SUBMIT', 'REVIEW', 'APPROVE', 'REJECT', 'MODIFY', 'CANCEL', 'DELIVER', 'ACKNOWLEDGE', 'ESCALATE');

-- CreateEnum
CREATE TYPE "public"."RequestActionStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING', 'PARTIAL', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."compliance_audit_logs" (
    "audit_id" UUID NOT NULL,
    "event_type" "public"."AuditEventType" NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" VARCHAR(255),
    "user_id" UUID,
    "session_id" VARCHAR(255),
    "user_agent" TEXT,
    "ip_address" VARCHAR(45),
    "request_method" VARCHAR(10),
    "request_path" VARCHAR(500),
    "request_params" JSONB,
    "response_status" INTEGER,
    "resource_type" "public"."ResourceType",
    "resource_id" UUID,
    "data_classification" "public"."DataClassification",
    "file_size" BIGINT,
    "file_name" VARCHAR(255),
    "file_path" VARCHAR(1000),
    "file_hash" VARCHAR(128),
    "security_level" "public"."SecurityLevel" NOT NULL DEFAULT 'PUBLIC',
    "compliance_flags" TEXT[],
    "risk_score" INTEGER,
    "contract_id" UUID,
    "project_code" VARCHAR(50),
    "business_unit" VARCHAR(100),
    "previous_state" JSONB,
    "current_state" JSONB,
    "change_reason" TEXT,
    "metadata" JSONB,
    "error_details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "integrity_hash" VARCHAR(128) NOT NULL,

    CONSTRAINT "compliance_audit_logs_pkey" PRIMARY KEY ("audit_id")
);

-- CreateTable
CREATE TABLE "public"."resource_upload_audit_logs" (
    "upload_audit_id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "original_file_name" VARCHAR(255) NOT NULL,
    "uploaded_file_name" VARCHAR(255) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "file_type" VARCHAR(100) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "file_hash" VARCHAR(128) NOT NULL,
    "virus_scan_status" "public"."VirusScanStatus" NOT NULL,
    "encryption_status" "public"."EncryptionStatus" NOT NULL,
    "upload_status" "public"."UploadStatus" NOT NULL,
    "upload_progress" INTEGER NOT NULL DEFAULT 0,
    "upload_start_time" TIMESTAMP(3) NOT NULL,
    "upload_end_time" TIMESTAMP(3),
    "user_id" UUID NOT NULL,
    "ip_address" VARCHAR(45) NOT NULL,
    "user_agent" TEXT,
    "location" VARCHAR(255),
    "validation_status" "public"."ValidationStatus" NOT NULL,
    "validation_errors" JSONB,
    "compliance_checks" JSONB NOT NULL,
    "data_classification" "public"."DataClassification" NOT NULL,
    "business_justification" TEXT,
    "project_code" VARCHAR(50),
    "contract_id" UUID,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "integrity_hash" VARCHAR(128) NOT NULL,

    CONSTRAINT "resource_upload_audit_logs_pkey" PRIMARY KEY ("upload_audit_id")
);

-- CreateTable
CREATE TABLE "public"."request_action_audit_logs" (
    "request_audit_id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "action_type" "public"."RequestActionType" NOT NULL,
    "action_status" "public"."RequestActionStatus" NOT NULL,
    "performed_by_user_id" UUID NOT NULL,
    "authorized_by_user_id" UUID,
    "delegate_user_id" UUID,
    "previous_status" "public"."RequestStatus",
    "new_status" "public"."RequestStatus",
    "status_reason" TEXT,
    "approval_level" INTEGER,
    "required_approvals" INTEGER,
    "current_approvals" INTEGER,
    "data_requested" JSONB,
    "access_granted" JSONB,
    "access_conditions" JSONB,
    "data_delivery_method" VARCHAR(100),
    "security_clearance" "public"."SecurityLevel" NOT NULL,
    "compliance_notes" TEXT,
    "risk_assessment" JSONB,
    "business_justification" TEXT,
    "project_code" VARCHAR(50),
    "contract_id" UUID,
    "cost_center" VARCHAR(50),
    "ip_address" VARCHAR(45) NOT NULL,
    "user_agent" TEXT,
    "session_id" VARCHAR(255),
    "request_metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "integrity_hash" VARCHAR(128) NOT NULL,

    CONSTRAINT "request_action_audit_logs_pkey" PRIMARY KEY ("request_audit_id")
);

-- CreateIndex
CREATE INDEX "compliance_audit_logs_event_type_timestamp_idx" ON "public"."compliance_audit_logs"("event_type", "timestamp");

-- CreateIndex
CREATE INDEX "compliance_audit_logs_user_id_timestamp_idx" ON "public"."compliance_audit_logs"("user_id", "timestamp");

-- CreateIndex
CREATE INDEX "compliance_audit_logs_entity_type_entity_id_idx" ON "public"."compliance_audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "compliance_audit_logs_resource_id_timestamp_idx" ON "public"."compliance_audit_logs"("resource_id", "timestamp");

-- CreateIndex
CREATE INDEX "compliance_audit_logs_contract_id_timestamp_idx" ON "public"."compliance_audit_logs"("contract_id", "timestamp");

-- CreateIndex
CREATE INDEX "compliance_audit_logs_security_level_timestamp_idx" ON "public"."compliance_audit_logs"("security_level", "timestamp");

-- CreateIndex
CREATE INDEX "compliance_audit_logs_integrity_hash_idx" ON "public"."compliance_audit_logs"("integrity_hash");

-- CreateIndex
CREATE INDEX "resource_upload_audit_logs_resource_id_timestamp_idx" ON "public"."resource_upload_audit_logs"("resource_id", "timestamp");

-- CreateIndex
CREATE INDEX "resource_upload_audit_logs_user_id_timestamp_idx" ON "public"."resource_upload_audit_logs"("user_id", "timestamp");

-- CreateIndex
CREATE INDEX "resource_upload_audit_logs_upload_status_timestamp_idx" ON "public"."resource_upload_audit_logs"("upload_status", "timestamp");

-- CreateIndex
CREATE INDEX "resource_upload_audit_logs_data_classification_timestamp_idx" ON "public"."resource_upload_audit_logs"("data_classification", "timestamp");

-- CreateIndex
CREATE INDEX "resource_upload_audit_logs_integrity_hash_idx" ON "public"."resource_upload_audit_logs"("integrity_hash");

-- CreateIndex
CREATE INDEX "request_action_audit_logs_request_id_timestamp_idx" ON "public"."request_action_audit_logs"("request_id", "timestamp");

-- CreateIndex
CREATE INDEX "request_action_audit_logs_performed_by_user_id_timestamp_idx" ON "public"."request_action_audit_logs"("performed_by_user_id", "timestamp");

-- CreateIndex
CREATE INDEX "request_action_audit_logs_action_type_timestamp_idx" ON "public"."request_action_audit_logs"("action_type", "timestamp");

-- CreateIndex
CREATE INDEX "request_action_audit_logs_action_status_timestamp_idx" ON "public"."request_action_audit_logs"("action_status", "timestamp");

-- CreateIndex
CREATE INDEX "request_action_audit_logs_security_clearance_timestamp_idx" ON "public"."request_action_audit_logs"("security_clearance", "timestamp");

-- CreateIndex
CREATE INDEX "request_action_audit_logs_integrity_hash_idx" ON "public"."request_action_audit_logs"("integrity_hash");

-- AddForeignKey
ALTER TABLE "public"."compliance_audit_logs" ADD CONSTRAINT "compliance_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."compliance_audit_logs" ADD CONSTRAINT "compliance_audit_logs_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("resource_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."compliance_audit_logs" ADD CONSTRAINT "compliance_audit_logs_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("contract_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_upload_audit_logs" ADD CONSTRAINT "resource_upload_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_upload_audit_logs" ADD CONSTRAINT "resource_upload_audit_logs_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("resource_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_upload_audit_logs" ADD CONSTRAINT "resource_upload_audit_logs_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("contract_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."request_action_audit_logs" ADD CONSTRAINT "request_action_audit_logs_performed_by_user_id_fkey" FOREIGN KEY ("performed_by_user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."request_action_audit_logs" ADD CONSTRAINT "request_action_audit_logs_authorized_by_user_id_fkey" FOREIGN KEY ("authorized_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."request_action_audit_logs" ADD CONSTRAINT "request_action_audit_logs_delegate_user_id_fkey" FOREIGN KEY ("delegate_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."request_action_audit_logs" ADD CONSTRAINT "request_action_audit_logs_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("request_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."request_action_audit_logs" ADD CONSTRAINT "request_action_audit_logs_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("contract_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "public"."AdaptorSyncType" AS ENUM ('METADATA', 'SEISMIC_DATA', 'WELL_LOGS', 'RESERVOIR_DATA', 'FULL_SYNC', 'INCREMENTAL');

-- CreateEnum
CREATE TYPE "public"."SyncStatus" AS ENUM ('in_progress', 'completed', 'failed', 'cancelled');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."AuthenticationType" ADD VALUE 'OIDC';
ALTER TYPE "public"."AuthenticationType" ADD VALUE 'PKI';
ALTER TYPE "public"."AuthenticationType" ADD VALUE 'OIDC_PKI';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ExternalServiceType" ADD VALUE 'OGC_OSDU_ADAPTOR';
ALTER TYPE "public"."ExternalServiceType" ADD VALUE 'DATA_PROVIDER';
ALTER TYPE "public"."ExternalServiceType" ADD VALUE 'METADATA_BROKER';

-- CreateTable
CREATE TABLE "public"."adaptor_sync_logs" (
    "sync_log_id" UUID NOT NULL,
    "external_service_id" UUID NOT NULL,
    "sync_type" "public"."AdaptorSyncType" NOT NULL,
    "status" "public"."SyncStatus" NOT NULL DEFAULT 'in_progress',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "records_processed" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "metadata" JSONB,

    CONSTRAINT "adaptor_sync_logs_pkey" PRIMARY KEY ("sync_log_id")
);

-- CreateTable
CREATE TABLE "public"."adaptor_audit_logs" (
    "audit_log_id" UUID NOT NULL,
    "external_service_id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "endpoint" TEXT NOT NULL,
    "request_method" VARCHAR(10) NOT NULL,
    "request_params" JSONB,
    "response_status" INTEGER NOT NULL,
    "response_time" INTEGER,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adaptor_audit_logs_pkey" PRIMARY KEY ("audit_log_id")
);

-- CreateIndex
CREATE INDEX "adaptor_sync_logs_external_service_id_started_at_idx" ON "public"."adaptor_sync_logs"("external_service_id", "started_at");

-- CreateIndex
CREATE INDEX "adaptor_sync_logs_status_sync_type_idx" ON "public"."adaptor_sync_logs"("status", "sync_type");

-- CreateIndex
CREATE INDEX "adaptor_audit_logs_external_service_id_timestamp_idx" ON "public"."adaptor_audit_logs"("external_service_id", "timestamp");

-- CreateIndex
CREATE INDEX "adaptor_audit_logs_user_id_timestamp_idx" ON "public"."adaptor_audit_logs"("user_id", "timestamp");

-- CreateIndex
CREATE INDEX "adaptor_audit_logs_action_timestamp_idx" ON "public"."adaptor_audit_logs"("action", "timestamp");

-- AddForeignKey
ALTER TABLE "public"."adaptor_sync_logs" ADD CONSTRAINT "adaptor_sync_logs_external_service_id_fkey" FOREIGN KEY ("external_service_id") REFERENCES "public"."external_services"("external_service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."adaptor_audit_logs" ADD CONSTRAINT "adaptor_audit_logs_external_service_id_fkey" FOREIGN KEY ("external_service_id") REFERENCES "public"."external_services"("external_service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."adaptor_audit_logs" ADD CONSTRAINT "adaptor_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

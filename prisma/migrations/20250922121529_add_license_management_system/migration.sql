-- CreateEnum
CREATE TYPE "public"."LicenseType" AS ENUM ('TRIAL', 'STANDARD', 'PROFESSIONAL', 'ENTERPRISE', 'GOVERNMENT', 'ACADEMIC');

-- CreateEnum
CREATE TYPE "public"."LicenseLevel" AS ENUM ('BASIC', 'ADVANCED', 'PREMIUM', 'UNLIMITED');

-- CreateEnum
CREATE TYPE "public"."LicenseStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED', 'PENDING_ACTIVATION');

-- CreateEnum
CREATE TYPE "public"."LicenseUsageType" AS ENUM ('FEATURE_ACCESS', 'DATA_PROCESSING', 'API_CALL', 'USER_SESSION', 'CONNECTOR_USAGE', 'REPORT_GENERATION');

-- CreateEnum
CREATE TYPE "public"."UsageStatus" AS ENUM ('SUCCESS', 'FAILED', 'PARTIAL', 'RATE_LIMITED', 'FEATURE_RESTRICTED');

-- CreateTable
CREATE TABLE "public"."licenses" (
    "license_id" UUID NOT NULL,
    "license_token" TEXT NOT NULL,
    "license_hash" VARCHAR(128) NOT NULL,
    "license_name" VARCHAR(255) NOT NULL,
    "license_type" "public"."LicenseType" NOT NULL,
    "license_level" "public"."LicenseLevel" NOT NULL,
    "issued_date" TIMESTAMP(3) NOT NULL,
    "activation_date" TIMESTAMP(3),
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "status" "public"."LicenseStatus" NOT NULL DEFAULT 'INACTIVE',
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "organization_name" VARCHAR(255) NOT NULL,
    "organization_id" VARCHAR(100),
    "contact_email" TEXT NOT NULL,
    "max_users" INTEGER,
    "max_connectors" INTEGER,
    "max_data_volume" BIGINT,
    "max_api_requests" INTEGER,
    "enabled_features" TEXT[],
    "restricted_features" TEXT[],
    "activation_key" VARCHAR(512),
    "client_fingerprint" VARCHAR(255),
    "hardware_lock" JSONB,
    "last_used" TIMESTAMP(3),
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("license_id")
);

-- CreateTable
CREATE TABLE "public"."license_usage_logs" (
    "usage_id" UUID NOT NULL,
    "license_id" UUID NOT NULL,
    "feature_used" VARCHAR(100) NOT NULL,
    "usage_type" "public"."LicenseUsageType" NOT NULL,
    "user_id" UUID,
    "session_id" VARCHAR(255),
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "data_processed" BIGINT,
    "api_calls" INTEGER,
    "processing_time" INTEGER,
    "usage_status" "public"."UsageStatus" NOT NULL,
    "error_message" TEXT,
    "metadata" JSONB,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "license_usage_logs_pkey" PRIMARY KEY ("usage_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "licenses_license_token_key" ON "public"."licenses"("license_token");

-- CreateIndex
CREATE INDEX "licenses_license_token_idx" ON "public"."licenses"("license_token");

-- CreateIndex
CREATE INDEX "licenses_status_expiration_date_idx" ON "public"."licenses"("status", "expiration_date");

-- CreateIndex
CREATE INDEX "licenses_organization_id_idx" ON "public"."licenses"("organization_id");

-- CreateIndex
CREATE INDEX "license_usage_logs_license_id_timestamp_idx" ON "public"."license_usage_logs"("license_id", "timestamp");

-- CreateIndex
CREATE INDEX "license_usage_logs_feature_used_timestamp_idx" ON "public"."license_usage_logs"("feature_used", "timestamp");

-- CreateIndex
CREATE INDEX "license_usage_logs_user_id_timestamp_idx" ON "public"."license_usage_logs"("user_id", "timestamp");

-- AddForeignKey
ALTER TABLE "public"."license_usage_logs" ADD CONSTRAINT "license_usage_logs_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "public"."licenses"("license_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."license_usage_logs" ADD CONSTRAINT "license_usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

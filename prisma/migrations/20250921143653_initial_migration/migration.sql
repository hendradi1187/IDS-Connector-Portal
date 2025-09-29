-- CreateEnum
CREATE TYPE "public"."RequestType" AS ENUM ('GeoJSON', 'Seismic', 'Production');

-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('pending', 'approved', 'rejected', 'delivered');

-- CreateEnum
CREATE TYPE "public"."ResourceType" AS ENUM ('GeoJSON', 'CSV', 'Well Data');

-- CreateEnum
CREATE TYPE "public"."AccessPolicy" AS ENUM ('restricted', 'public', 'contract-only');

-- CreateEnum
CREATE TYPE "public"."RouteStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."ValidationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."NetworkProtocol" AS ENUM ('HTTPS', 'VPN', 'IDS Broker');

-- CreateEnum
CREATE TYPE "public"."NetworkStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."ContainerStatus" AS ENUM ('running', 'stopped', 'error', 'starting', 'stopping');

-- CreateEnum
CREATE TYPE "public"."ServiceApplicationStatus" AS ENUM ('active', 'inactive', 'maintenance', 'error');

-- CreateEnum
CREATE TYPE "public"."ContractStatus" AS ENUM ('draft', 'pending', 'active', 'expired', 'terminated', 'rejected');

-- CreateEnum
CREATE TYPE "public"."ContractType" AS ENUM ('data_sharing', 'service_access', 'api_usage', 'resource_access');

-- CreateEnum
CREATE TYPE "public"."LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL');

-- CreateEnum
CREATE TYPE "public"."ApiStatusType" AS ENUM ('healthy', 'degraded', 'unhealthy', 'unknown');

-- CreateEnum
CREATE TYPE "public"."ProcessingStatus" AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."ExternalServiceType" AS ENUM ('IDS_BROKER', 'DATA_CATALOG', 'AUTHENTICATION', 'MONITORING', 'ANALYTICS');

-- CreateEnum
CREATE TYPE "public"."AuthenticationType" AS ENUM ('API_KEY', 'OAUTH2', 'BASIC_AUTH', 'CERTIFICATE', 'NONE');

-- CreateEnum
CREATE TYPE "public"."ExternalServiceStatus" AS ENUM ('active', 'inactive', 'error', 'syncing');

-- CreateEnum
CREATE TYPE "public"."DataspaceConnectorStatus" AS ENUM ('online', 'offline', 'synchronizing', 'error');

-- CreateEnum
CREATE TYPE "public"."RoutingType" AS ENUM ('ROUND_ROBIN', 'WEIGHTED', 'FAILOVER', 'RANDOM');

-- CreateEnum
CREATE TYPE "public"."LoadBalancingType" AS ENUM ('ROUND_ROBIN', 'LEAST_CONNECTIONS', 'IP_HASH', 'WEIGHTED_ROUND_ROBIN');

-- CreateEnum
CREATE TYPE "public"."RoutingServiceStatus" AS ENUM ('active', 'inactive', 'error');

-- CreateEnum
CREATE TYPE "public"."EndpointStatus" AS ENUM ('active', 'inactive', 'unhealthy');

-- CreateEnum
CREATE TYPE "public"."ConnectorControllerType" AS ENUM ('IDS_CONNECTOR', 'DATA_PROCESSOR', 'BROKER_INTERFACE', 'SECURITY_GATEWAY');

-- CreateEnum
CREATE TYPE "public"."ConnectorControllerStatus" AS ENUM ('active', 'inactive', 'error', 'maintenance');

-- CreateEnum
CREATE TYPE "public"."ConnectorMetricType" AS ENUM ('CPU_USAGE', 'MEMORY_USAGE', 'DISK_USAGE', 'NETWORK_IN', 'NETWORK_OUT', 'REQUEST_COUNT', 'ERROR_RATE', 'RESPONSE_TIME');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."requests" (
    "request_id" UUID NOT NULL,
    "requester_id" UUID NOT NULL,
    "provider_id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "request_type" "public"."RequestType" NOT NULL,
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'pending',
    "purpose" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "public"."resources" (
    "resource_id" UUID NOT NULL,
    "provider_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "public"."ResourceType" NOT NULL,
    "storage_path" TEXT,
    "metadata" JSONB,
    "access_policy" "public"."AccessPolicy" NOT NULL DEFAULT 'restricted',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("resource_id")
);

-- CreateTable
CREATE TABLE "public"."routes" (
    "route_id" UUID NOT NULL,
    "provider_id" UUID NOT NULL,
    "consumer_id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "status" "public"."RouteStatus" NOT NULL DEFAULT 'active',
    "valid_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("route_id")
);

-- CreateTable
CREATE TABLE "public"."brokers" (
    "broker_id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "validation_status" "public"."ValidationStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brokers_pkey" PRIMARY KEY ("broker_id")
);

-- CreateTable
CREATE TABLE "public"."network_settings" (
    "setting_id" UUID NOT NULL,
    "provider_id" UUID NOT NULL,
    "api_endpoint" TEXT,
    "protocol" "public"."NetworkProtocol" NOT NULL,
    "status" "public"."NetworkStatus" NOT NULL DEFAULT 'active',
    "last_checked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "network_settings_pkey" PRIMARY KEY ("setting_id")
);

-- CreateTable
CREATE TABLE "public"."containers" (
    "container_id" UUID NOT NULL,
    "service_name" VARCHAR(100) NOT NULL,
    "provider_id" UUID NOT NULL,
    "status" "public"."ContainerStatus" NOT NULL DEFAULT 'stopped',
    "image" TEXT,
    "ports" JSONB,
    "volumes" JSONB,
    "environment" JSONB,
    "cpu_usage" DOUBLE PRECISION,
    "memory_usage" DOUBLE PRECISION,
    "logs" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "containers_pkey" PRIMARY KEY ("container_id")
);

-- CreateTable
CREATE TABLE "public"."data_sources" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER,
    "database" TEXT,
    "username" TEXT,
    "password" TEXT,
    "schema" TEXT,
    "table" TEXT,
    "query" TEXT,
    "connection_string" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "last_sync" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."configs" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "type" TEXT NOT NULL DEFAULT 'string',
    "is_secret" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_applications" (
    "service_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "version" VARCHAR(50) NOT NULL,
    "provider_id" UUID NOT NULL,
    "status" "public"."ServiceApplicationStatus" NOT NULL DEFAULT 'inactive',
    "endpoint" TEXT,
    "health_check" TEXT,
    "api_key" TEXT,
    "metadata" JSONB,
    "last_check" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_applications_pkey" PRIMARY KEY ("service_id")
);

-- CreateTable
CREATE TABLE "public"."contracts" (
    "contract_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "provider_id" UUID NOT NULL,
    "consumer_id" UUID NOT NULL,
    "service_application_id" UUID,
    "resource_id" UUID,
    "status" "public"."ContractStatus" NOT NULL DEFAULT 'draft',
    "contract_type" "public"."ContractType" NOT NULL,
    "terms" JSONB,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "signed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("contract_id")
);

-- CreateTable
CREATE TABLE "public"."system_logs" (
    "log_id" UUID NOT NULL,
    "service" VARCHAR(100) NOT NULL,
    "level" "public"."LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "user_id" UUID,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "public"."api_statuses" (
    "status_id" UUID NOT NULL,
    "service_name" VARCHAR(100) NOT NULL,
    "endpoint" TEXT NOT NULL,
    "status" "public"."ApiStatusType" NOT NULL DEFAULT 'unknown',
    "response_time" INTEGER,
    "status_code" INTEGER,
    "error_message" TEXT,
    "last_checked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_statuses_pkey" PRIMARY KEY ("status_id")
);

-- CreateTable
CREATE TABLE "public"."processing_logs" (
    "processing_id" UUID NOT NULL,
    "process_type" VARCHAR(100) NOT NULL,
    "resource_id" UUID,
    "request_id" UUID,
    "status" "public"."ProcessingStatus" NOT NULL DEFAULT 'pending',
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "duration" INTEGER,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "details" JSONB,
    "error_message" TEXT,

    CONSTRAINT "processing_logs_pkey" PRIMARY KEY ("processing_id")
);

-- CreateTable
CREATE TABLE "public"."external_services" (
    "external_service_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "service_type" "public"."ExternalServiceType" NOT NULL,
    "endpoint" TEXT NOT NULL,
    "auth_type" "public"."AuthenticationType" NOT NULL,
    "credentials" JSONB,
    "status" "public"."ExternalServiceStatus" NOT NULL DEFAULT 'inactive',
    "last_sync" TIMESTAMP(3),
    "sync_interval" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_services_pkey" PRIMARY KEY ("external_service_id")
);

-- CreateTable
CREATE TABLE "public"."dataspace_connectors" (
    "connector_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "connector_url" TEXT NOT NULL,
    "version" VARCHAR(50) NOT NULL,
    "status" "public"."DataspaceConnectorStatus" NOT NULL DEFAULT 'offline',
    "registration_id" TEXT,
    "security_profile" TEXT,
    "supported_formats" JSONB,
    "capabilities" JSONB,
    "last_heartbeat" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dataspace_connectors_pkey" PRIMARY KEY ("connector_id")
);

-- CreateTable
CREATE TABLE "public"."routing_services" (
    "routing_service_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "routing_type" "public"."RoutingType" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "load_balancing" "public"."LoadBalancingType" NOT NULL,
    "health_check" TEXT,
    "status" "public"."RoutingServiceStatus" NOT NULL DEFAULT 'inactive',
    "configuration" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routing_services_pkey" PRIMARY KEY ("routing_service_id")
);

-- CreateTable
CREATE TABLE "public"."routing_endpoints" (
    "endpoint_id" UUID NOT NULL,
    "routing_service_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "status" "public"."EndpointStatus" NOT NULL DEFAULT 'active',
    "response_time" INTEGER,
    "last_check" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routing_endpoints_pkey" PRIMARY KEY ("endpoint_id")
);

-- CreateTable
CREATE TABLE "public"."connector_controllers" (
    "controller_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "controller_type" "public"."ConnectorControllerType" NOT NULL,
    "status" "public"."ConnectorControllerStatus" NOT NULL DEFAULT 'inactive',
    "ip_address" TEXT,
    "port" INTEGER,
    "version" VARCHAR(50),
    "capabilities" JSONB,
    "configuration" JSONB,
    "last_communication" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connector_controllers_pkey" PRIMARY KEY ("controller_id")
);

-- CreateTable
CREATE TABLE "public"."connector_metrics" (
    "metric_id" UUID NOT NULL,
    "connector_controller_id" UUID NOT NULL,
    "metric_type" "public"."ConnectorMetricType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" VARCHAR(20),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connector_metrics_pkey" PRIMARY KEY ("metric_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "configs_key_key" ON "public"."configs"("key");

-- CreateIndex
CREATE INDEX "system_logs_service_level_timestamp_idx" ON "public"."system_logs"("service", "level", "timestamp");

-- CreateIndex
CREATE INDEX "api_statuses_service_name_status_idx" ON "public"."api_statuses"("service_name", "status");

-- CreateIndex
CREATE INDEX "processing_logs_process_type_status_idx" ON "public"."processing_logs"("process_type", "status");

-- CreateIndex
CREATE INDEX "connector_metrics_connector_controller_id_metric_type_times_idx" ON "public"."connector_metrics"("connector_controller_id", "metric_type", "timestamp");

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("resource_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resources" ADD CONSTRAINT "resources_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."routes" ADD CONSTRAINT "routes_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."routes" ADD CONSTRAINT "routes_consumer_id_fkey" FOREIGN KEY ("consumer_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."routes" ADD CONSTRAINT "routes_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("resource_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."brokers" ADD CONSTRAINT "brokers_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("request_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."network_settings" ADD CONSTRAINT "network_settings_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."containers" ADD CONSTRAINT "containers_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_applications" ADD CONSTRAINT "service_applications_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_consumer_id_fkey" FOREIGN KEY ("consumer_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_service_application_id_fkey" FOREIGN KEY ("service_application_id") REFERENCES "public"."service_applications"("service_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("resource_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."system_logs" ADD CONSTRAINT "system_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."processing_logs" ADD CONSTRAINT "processing_logs_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("resource_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."processing_logs" ADD CONSTRAINT "processing_logs_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("request_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."routing_endpoints" ADD CONSTRAINT "routing_endpoints_routing_service_id_fkey" FOREIGN KEY ("routing_service_id") REFERENCES "public"."routing_services"("routing_service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connector_metrics" ADD CONSTRAINT "connector_metrics_connector_controller_id_fkey" FOREIGN KEY ("connector_controller_id") REFERENCES "public"."connector_controllers"("controller_id") ON DELETE CASCADE ON UPDATE CASCADE;

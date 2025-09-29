-- CreateIndex
CREATE INDEX "external_services_service_type_status_idx" ON "public"."external_services"("service_type", "status");

-- CreateIndex
CREATE INDEX "external_services_status_last_sync_idx" ON "public"."external_services"("status", "last_sync");

-- CreateIndex
CREATE INDEX "external_services_auth_type_idx" ON "public"."external_services"("auth_type");

-- CreateIndex
CREATE INDEX "requests_status_created_at_idx" ON "public"."requests"("status", "created_at");

-- CreateIndex
CREATE INDEX "requests_provider_id_status_idx" ON "public"."requests"("provider_id", "status");

-- CreateIndex
CREATE INDEX "requests_requester_id_status_idx" ON "public"."requests"("requester_id", "status");

-- CreateIndex
CREATE INDEX "resources_provider_id_type_idx" ON "public"."resources"("provider_id", "type");

-- CreateIndex
CREATE INDEX "resources_type_access_policy_idx" ON "public"."resources"("type", "access_policy");

-- CreateIndex
CREATE INDEX "resources_provider_id_access_policy_idx" ON "public"."resources"("provider_id", "access_policy");

-- CreateIndex
CREATE INDEX "routes_status_valid_until_idx" ON "public"."routes"("status", "valid_until");

-- CreateIndex
CREATE INDEX "routes_provider_id_status_idx" ON "public"."routes"("provider_id", "status");

-- CreateIndex
CREATE INDEX "routes_consumer_id_status_idx" ON "public"."routes"("consumer_id", "status");

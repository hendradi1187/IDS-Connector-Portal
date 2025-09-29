# IDS Connector Portal API Documentation

## Overview
API endpoints untuk modul GUI IDS Connector Portal yang terhubung dengan PostgreSQL database.

## Base URL
```
/api
```

## API Client Usage

```typescript
import { apiClient } from '@/lib/api/client';

// Example: Get all resources
const resources = await apiClient.resources.getAll();

// Example: Create a new container
const container = await apiClient.containers.create({
  serviceName: 'my-service',
  providerId: 'user-id',
  image: 'nginx:latest'
});
```

## Endpoints

### 1. Resources (`/api/resources`)

**GET /api/resources**
- Query params: `?providerId=xxx&type=xxx&accessPolicy=xxx`
- Response: Array of resources with provider info

**POST /api/resources**
- Body: `{ name, description, type, providerId, storagePath, metadata, accessPolicy }`
- Response: Created resource

**GET /api/resources/[id]**
- Response: Single resource with relations

**PUT /api/resources/[id]**
- Body: Resource update data
- Response: Updated resource

**DELETE /api/resources/[id]**
- Response: Success message

### 2. Routes (`/api/routes`)

**GET /api/routes**
- Query params: `?providerId=xxx&consumerId=xxx&status=xxx`
- Response: Array of routes with provider, consumer, resource info

**POST /api/routes**
- Body: `{ providerId, consumerId, resourceId, status, validUntil }`
- Response: Created route

**GET /api/routes/[id]**
- Response: Single route with relations

**PUT /api/routes/[id]**
- Body: Route update data
- Response: Updated route

**DELETE /api/routes/[id]**
- Response: Success message

### 3. Brokers (`/api/brokers`)

**GET /api/brokers**
- Query params: `?validationStatus=xxx`
- Response: Array of brokers with request info

**POST /api/brokers**
- Body: `{ transactionId, requestId, validationStatus, notes }`
- Response: Created broker

**GET /api/brokers/[id]**
- Response: Single broker with relations

**PUT /api/brokers/[id]**
- Body: Broker update data
- Response: Updated broker

**DELETE /api/brokers/[id]**
- Response: Success message

### 4. Containers (`/api/containers`)

**GET /api/containers**
- Query params: `?status=xxx`
- Response: Array of containers with provider info

**POST /api/containers**
- Body: `{ serviceName, providerId, status, image, ports, volumes, environment }`
- Response: Created container

**GET /api/containers/[id]**
- Response: Single container with relations

**PUT /api/containers/[id]**
- Body: Container update data
- Response: Updated container

**DELETE /api/containers/[id]**
- Response: Success message

**POST /api/containers/[id]/actions**
- Body: `{ action: 'start' | 'stop' | 'restart' }`
- Response: Action result with updated container

### 5. Data Sources (`/api/data-sources`)

**GET /api/data-sources**
- Query params: `?type=xxx&status=xxx`
- Response: Array of data sources

**POST /api/data-sources**
- Body: `{ name, type, host, port, database, username, password, connectionString, metadata }`
- Response: Created data source

**GET /api/data-sources/[id]**
- Response: Single data source

**PUT /api/data-sources/[id]**
- Body: Data source update data
- Response: Updated data source

**DELETE /api/data-sources/[id]**
- Response: Success message

**POST /api/data-sources/[id]/test**
- Response: `{ success: boolean, message: string }`

### 6. Network Settings (`/api/network-settings`)

**GET /api/network-settings**
- Query params: `?providerId=xxx&protocol=xxx&status=xxx`
- Response: Array of network settings with provider info

**POST /api/network-settings**
- Body: `{ providerId, apiEndpoint, protocol, status }`
- Response: Created network setting

**GET /api/network-settings/[id]**
- Response: Single network setting with relations

**PUT /api/network-settings/[id]**
- Body: Network setting update data
- Response: Updated network setting

**DELETE /api/network-settings/[id]**
- Response: Success message

### 7. Configs (`/api/configs`)

**GET /api/configs**
- Query params: `?category=xxx&secrets=true/false`
- Response: Array of configs (secret values masked)

**POST /api/configs**
- Body: `{ key, value, description, category, type, isSecret }`
- Response: Created config (secret values masked)

**GET /api/configs/[id]**
- Response: Single config (secret values masked)

**PUT /api/configs/[id]**
- Body: Config update data
- Response: Updated config (secret values masked)

**DELETE /api/configs/[id]**
- Response: Success message

### 8. Data Requests (`/api/requests`)

**GET /api/requests**
- Query params: `?requesterId=xxx&providerId=xxx&status=xxx&requestType=xxx`
- Response: Array of requests with requester, provider, resource info

**POST /api/requests**
- Body: `{ requesterId, providerId, resourceId, requestType, status, purpose }`
- Response: Created request

**GET /api/requests/[id]**
- Response: Single request with relations and brokers

**PUT /api/requests/[id]**
- Body: Request update data
- Response: Updated request

**DELETE /api/requests/[id]**
- Response: Success message

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Authentication

⚠️ **Note**: Authentication belum diimplementasikan. Untuk production, tambahkan:
- JWT authentication middleware
- Role-based access control
- API rate limiting

## Database Relations

- **User** → Resources (provider), Requests (requester/provider), Routes (provider/consumer), NetworkSettings, Containers
- **Resource** → Requests, Routes
- **Request** → Brokers
- **Route** → Resource, Provider, Consumer

Semua query menggunakan Prisma ORM dengan proper relation loading untuk performa optimal.
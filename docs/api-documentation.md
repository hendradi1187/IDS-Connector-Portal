# IDS Connector Portal API Documentation

## Overview
This API provides endpoints for managing International Data Spaces (IDS) connectors, data resources, routing services, and external integrations for oil & gas upstream operations in Indonesia.

**Base URL**: `http://localhost:9002/api`

**Authentication**: Bearer JWT Token (coming soon)

## Core Endpoints

### 1. External Services

#### GET /api/external-services
Get list of external services (IDS brokers, catalogs, authentication providers, etc.)

**Query Parameters:**
- `status` (optional): `active | inactive | error | syncing`
- `serviceType` (optional): `IDS_BROKER | DATA_CATALOG | AUTHENTICATION | MONITORING | ANALYTICS`
- `authType` (optional): `API_KEY | OAUTH2 | BASIC_AUTH | CERTIFICATE | NONE`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "IDS Metadata Broker",
    "description": "Central metadata broker for IDS ecosystem",
    "serviceType": "IDS_BROKER",
    "endpoint": "https://broker.ids-ecosystem.org",
    "authType": "CERTIFICATE",
    "status": "active",
    "lastSync": "2024-01-21T10:30:00Z",
    "syncInterval": 60,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-21T10:30:00Z"
  }
]
```

#### POST /api/external-services
Create new external service integration

**Request Body:**
```json
{
  "name": "Service Name",
  "description": "Service description",
  "serviceType": "IDS_BROKER",
  "endpoint": "https://api.example.com",
  "authType": "API_KEY",
  "credentials": {
    "api_key": "encrypted_key"
  },
  "syncInterval": 60,
  "status": "active"
}
```

### 2. Routing Services

#### GET /api/routing-services
Get list of routing services for data flow management

**Query Parameters:**
- `status` (optional): `active | inactive | error`
- `routingType` (optional): `ROUND_ROBIN | WEIGHTED | FAILOVER | RANDOM`
- `loadBalancing` (optional): `ROUND_ROBIN | LEAST_CONNECTIONS | IP_HASH | WEIGHTED_ROUND_ROBIN`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Primary Load Balancer",
    "description": "Main load balancer for data distribution",
    "routingType": "ROUND_ROBIN",
    "priority": 100,
    "loadBalancing": "ROUND_ROBIN",
    "status": "active",
    "configuration": {
      "health_check_interval": 30,
      "timeout": 5000
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-21T10:30:00Z"
  }
]
```

### 3. Data Routes

#### GET /api/routes
Get data flow routes between providers (KKKS) and consumers (SKK Migas)

**Query Parameters:**
- `status` (optional): `active | inactive`
- `providerId` (optional): Filter by provider UUID
- `consumerId` (optional): Filter by consumer UUID

**Response:**
```json
[
  {
    "id": "uuid",
    "providerId": "uuid",
    "consumerId": "uuid",
    "resourceId": "uuid",
    "status": "active",
    "validUntil": "2025-12-31T23:59:59Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "provider": {
      "id": "uuid",
      "name": "Pertamina Hulu Energi",
      "organization": "KKKS"
    },
    "consumer": {
      "id": "uuid",
      "name": "SKK Migas",
      "organization": "Government"
    },
    "resource": {
      "id": "uuid",
      "name": "Data GeoJSON Blok Mahakam",
      "type": "GeoJSON",
      "description": "Peta geografis blok eksplorasi"
    }
  }
]
```

### 4. Resources

#### GET /api/resources
Get available data resources from KKKS providers

**Query Parameters:**
- `type` (optional): `GeoJSON | CSV | WellData`
- `providerId` (optional): Filter by provider UUID
- `accessPolicy` (optional): `restricted | public | contractOnly`

### 5. Users

#### GET /api/users
Get list of users (SKK Migas admins, KKKS providers)

**Query Parameters:**
- `role` (optional): `admin | provider | consumer`
- `isActive` (optional): `true | false`

### 6. System Monitoring

#### GET /api/system-logs
Get system operation logs

**Query Parameters:**
- `service` (optional): Filter by service name
- `level` (optional): `DEBUG | INFO | WARN | ERROR | FATAL`
- `userId` (optional): Filter by user UUID
- `limit` (optional): Number of records (default: 50, max: 500)
- `offset` (optional): Pagination offset

#### GET /api/api-status
Get API endpoint health status

#### GET /api/processing-logs
Get data processing operation logs

## Data Validation Rules

### External Services
- `name`: Required, 1-100 characters
- `endpoint`: Required, valid URL format
- `serviceType`: Required, must be valid enum value
- `authType`: Required, must be valid enum value

### Routing Services
- `name`: Required, 1-100 characters
- `routingType`: Required, must be valid enum value
- `priority`: Optional, integer 0-100
- `loadBalancing`: Required, must be valid enum value

### Data Routes
- `providerId`: Required, must be valid UUID
- `consumerId`: Required, must be valid UUID
- `resourceId`: Required, must be valid UUID
- `validUntil`: Optional, must be future date

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation details"
  }
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

- **General endpoints**: 100 requests/minute per IP
- **Data upload endpoints**: 10 requests/minute per user
- **Authentication endpoints**: 5 requests/minute per IP

## Pagination

For endpoints returning large datasets, use these parameters:
- `limit`: Number of records (default: 50, max: 500)
- `offset`: Starting position (default: 0)
- `orderBy`: Sort field (default: createdAt)
- `order`: Sort direction `asc | desc` (default: desc)

## Security Notes

1. All endpoints require valid JWT authentication (except documentation)
2. API keys for external services are encrypted at rest
3. Sensitive fields are not returned in responses
4. All inputs are sanitized to prevent injection attacks
5. CORS is configured for approved origins only

## Industries-Specific Context

This API is designed for Indonesian oil & gas upstream operations:

- **KKKS**: Kontrak Kerja Sama (Oil & Gas Contractors)
- **SKK Migas**: Special Task Force for Upstream Oil and Gas Business Activities
- **Data Types**: GeoJSON (geographical boundaries), CSV (production data), Well Data (drilling logs)
- **Compliance**: Follows Indonesian oil & gas data governance regulations

## Contact & Support

For API support and integration questions:
- Email: support@ids-connector-portal.com
- Documentation: https://docs.ids-connector-portal.com
- GitHub Issues: https://github.com/ids-connector-portal/issues
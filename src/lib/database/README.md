# Database Migration Guide - Firestore to PostgreSQL

## Overview
Panduan migrasi dari Firestore ke PostgreSQL untuk IDS Connector Portal.

## Setup Database

### 1. Install PostgreSQL
```bash
# Download dari: https://www.postgresql.org/download/
# Atau menggunakan Docker:
docker run --name postgres-ids -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

### 2. Konfigurasi Environment
```bash
cp .env.example .env
```

Edit `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ids_connector_portal"
```

### 3. Jalankan Migrasi
```bash
# Generate migration
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed database (optional)
npx prisma db seed
```

## Struktur Database

### Tables Created:
- `users` - User management
- `requests` - Data requests (consumer)
- `resources` - Resource management (provider)
- `routes` - Data routes
- `brokers` - Broker management
- `network_settings` - Network configuration
- `containers` - Container management
- `data_sources` - External data sources
- `configs` - Application configuration

### Key Features:
- UUID primary keys
- Proper foreign key relationships
- Enum constraints for data integrity
- JSONB metadata fields
- Automatic timestamps

## Repository Pattern

Setiap model memiliki repository di `src/lib/database/repositories/`:
- `ResourceRepository` - Manajemen resources
- `RouteRepository` - Manajemen routes
- `BrokerRepository` - Manajemen brokers
- `ContainerRepository` - Container operations
- `DataSourceRepository` - External data management

## Usage Example

```typescript
import { ResourceRepository } from '@/lib/database/repositories';

const resourceRepo = new ResourceRepository();

// Create resource
const resource = await resourceRepo.create({
  name: 'Seismic Data',
  type: 'GeoJSON',
  providerId: 'user-id',
  description: 'Seismic survey data',
  accessPolicy: 'restricted'
});

// Get all resources
const resources = await resourceRepo.findAll();
```

## Migration from Firestore

1. **Export Firestore Data**
   ```bash
   # Use Firebase CLI or custom script
   firebase firestore:export ./firestore-backup
   ```

2. **Transform Data**
   ```typescript
   // Custom migration script needed
   // Transform Firestore documents to PostgreSQL format
   ```

3. **Import to PostgreSQL**
   ```bash
   # Use prisma db seed or custom import script
   npx prisma db seed
   ```

## Next Steps

1. Set up PostgreSQL database
2. Run migrations
3. Update environment variables
4. Test GUI components
5. Migrate existing Firestore data (if any)
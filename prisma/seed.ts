import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Users (SKK Migas and KKKS)
  const skkUser = await prisma.user.upsert({
    where: { email: 'admin@skkmigas.go.id' },
    update: {},
    create: {
      email: 'admin@skkmigas.go.id',
      name: 'SKK Migas Admin',
      role: 'admin',
      isActive: true,
      lastLogin: new Date(),
    },
  });

  const kkksUser1 = await prisma.user.upsert({
    where: { email: 'ops@pertaminahulu.com' },
    update: {},
    create: {
      email: 'ops@pertaminahulu.com',
      name: 'Pertamina Hulu Energy',
      role: 'provider',
      isActive: true,
      lastLogin: new Date(),
    },
  });

  const kkksUser2 = await prisma.user.upsert({
    where: { email: 'data@chevron.co.id' },
    update: {},
    create: {
      email: 'data@chevron.co.id',
      name: 'Chevron Indonesia',
      role: 'provider',
      isActive: true,
      lastLogin: new Date(),
    },
  });

  // Create Resources
  const resource1 = await prisma.resource.create({
    data: {
      providerId: kkksUser1.id,
      name: 'Data GeoJSON Blok Mahakam',
      description: 'Peta geografis dan batas wilayah kerja blok Mahakam',
      type: 'GeoJSON',
      storagePath: '/storage/geojson/mahakam-block.json',
      accessPolicy: 'restricted',
      metadata: {
        coordinates: 'EPSG:4326',
        area: '15000 km²',
        lastUpdate: '2024-01-15',
        classification: 'restricted'
      }
    },
  });

  const resource2 = await prisma.resource.create({
    data: {
      providerId: kkksUser2.id,
      name: 'Data Produksi Harian Rokan',
      description: 'Data produksi minyak dan gas harian blok Rokan',
      type: 'CSV',
      storagePath: '/storage/production/rokan-daily.csv',
      accessPolicy: 'contractOnly',
      metadata: {
        fields: ['date', 'oil_production', 'gas_production', 'water_cut'],
        unit: 'barrel/day',
        period: '2024-01-01 to 2024-12-31'
      }
    },
  });

  // Create Requests
  const request1 = await prisma.request.create({
    data: {
      requesterId: skkUser.id,
      providerId: kkksUser1.id,
      resourceId: resource1.id,
      requestType: 'GeoJSON',
      status: 'approved',
      purpose: 'Monitoring dan evaluasi wilayah kerja untuk pelaporan SKK Migas',
    },
  });

  // Create Routes
  const route1 = await prisma.route.create({
    data: {
      providerId: kkksUser1.id,
      consumerId: skkUser.id,
      resourceId: resource1.id,
      status: 'active',
      validUntil: new Date('2025-12-31'),
    },
  });

  // Create External Services
  await prisma.externalService.createMany({
    data: [
      {
        name: 'IDS Metadata Broker',
        description: 'Central metadata broker for IDS ecosystem',
        serviceType: 'IDS_BROKER',
        endpoint: 'https://broker.ids-ecosystem.org',
        authType: 'CERTIFICATE',
        status: 'active',
        lastSync: new Date(),
        syncInterval: 60,
        metadata: {
          version: '5.0.0',
          connector_count: 25,
          region: 'SEA'
        }
      },
      {
        name: 'SKK Migas Data Catalog',
        description: 'Government data catalog service',
        serviceType: 'DATA_CATALOG',
        endpoint: 'https://data.skkmigas.go.id/api',
        authType: 'API_KEY',
        status: 'active',
        lastSync: new Date(),
        syncInterval: 30
      },
      {
        name: 'OAuth2 Identity Provider',
        description: 'Central authentication service',
        serviceType: 'AUTHENTICATION',
        endpoint: 'https://auth.migas.go.id',
        authType: 'OAUTH2',
        status: 'active',
        lastSync: new Date(),
        syncInterval: 15
      }
    ]
  });

  // Create Routing Services
  await prisma.routingService.createMany({
    data: [
      {
        name: 'Primary Load Balancer',
        description: 'Main load balancer for data distribution',
        routingType: 'ROUND_ROBIN',
        priority: 100,
        loadBalancing: 'ROUND_ROBIN',
        status: 'active',
        configuration: {
          health_check_interval: 30,
          timeout: 5000,
          max_retries: 3
        }
      },
      {
        name: 'Failover Router',
        description: 'Backup routing service for high availability',
        routingType: 'FAILOVER',
        priority: 50,
        loadBalancing: 'LEAST_CONNECTIONS',
        status: 'inactive',
        configuration: {
          primary_check: true,
          failover_threshold: 3
        }
      }
    ]
  });

  // Create System Logs
  await prisma.systemLog.createMany({
    data: [
      {
        service: 'api-gateway',
        level: 'INFO',
        message: 'System started successfully',
        userId: skkUser.id,
        details: {
          startup_time: '2.3s',
          environment: 'production'
        }
      },
      {
        service: 'database',
        level: 'INFO',
        message: 'Database connection established',
        details: {
          connection_pool: 10,
          latency: '15ms'
        }
      },
      {
        service: 'auth-service',
        level: 'WARN',
        message: 'Failed login attempt',
        details: {
          ip: '192.168.1.100',
          user_agent: 'Mozilla/5.0',
          attempts: 3
        }
      }
    ]
  });

  console.log('✅ Seed completed successfully!');
  console.log(`👤 Created users: ${skkUser.name}, ${kkksUser1.name}, ${kkksUser2.name}`);
  console.log(`📁 Created ${2} resources`);
  console.log(`🔗 Created ${1} active routes`);
  console.log(`🌐 Created ${3} external services`);
  console.log(`📊 Created routing services and system logs`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
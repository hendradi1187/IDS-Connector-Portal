import { PrismaClient, ContainerStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedContainers() {
  try {
    console.log('🌱 Seeding containers...');

    // Get or create a provider user
    let provider = await prisma.user.findFirst({
      where: { role: 'Admin' }
    });

    if (!provider) {
      provider = await prisma.user.create({
        data: {
          email: 'admin@ids-portal.com',
          name: 'Admin User',
          role: 'Admin',
          isActive: true
        }
      });
      console.log('✅ Created admin user for containers');
    }

    // Clear existing containers
    await prisma.container.deleteMany();
    console.log('🗑️ Cleared existing containers');

    // Sample containers data
    const containersData = [
      {
        serviceName: 'ids-connector-main',
        providerId: provider.id,
        status: 'running' as ContainerStatus,
        image: 'ids-connector:latest',
        ports: {
          '8080': '8080',
          '8443': '8443'
        },
        volumes: {
          '/data': '/app/data',
          '/logs': '/app/logs'
        },
        environment: {
          'NODE_ENV': 'production',
          'PORT': '8080',
          'IDS_CONNECTOR_MODE': 'provider'
        },
        cpuUsage: 45.2,
        memoryUsage: 768.5,
        logs: `Container started successfully
Listening on port 8080
Connected to broker at broker.ids-connector.com
IDS Connector Provider mode activated
Resource catalog synchronized
Ready to accept data requests`
      },
      {
        serviceName: 'ids-broker-service',
        providerId: provider.id,
        status: 'running' as ContainerStatus,
        image: 'ids-broker:v1.2.0',
        ports: {
          '9090': '9090',
          '9443': '9443'
        },
        volumes: {
          '/config': '/app/config',
          '/certs': '/app/certs'
        },
        environment: {
          'BROKER_MODE': 'cluster',
          'SSL_ENABLED': 'true',
          'CLUSTER_SIZE': '3'
        },
        cpuUsage: 23.1,
        memoryUsage: 512.0,
        logs: `Broker service initialized
Cluster mode enabled with 3 nodes
SSL certificates loaded
Ready to accept connections
Broker network established
Resource registry synchronized`
      },
      {
        serviceName: 'data-processor',
        providerId: provider.id,
        status: 'stopped' as ContainerStatus,
        image: 'data-processor:v2.1.0',
        ports: {
          '7070': '7070'
        },
        volumes: {
          '/temp': '/app/temp',
          '/processed': '/app/processed'
        },
        environment: {
          'WORKER_THREADS': '4',
          'PROCESSING_MODE': 'batch',
          'MAX_FILE_SIZE': '1GB'
        },
        cpuUsage: 0,
        memoryUsage: 0,
        logs: `Data processor initialized
Worker threads: 4
Processing mode: batch
Container stopped by user request
Last processed: 50 files (2.3GB)`
      },
      {
        serviceName: 'ogc-osdu-adaptor',
        providerId: provider.id,
        status: 'running' as ContainerStatus,
        image: 'ogc-osdu-adaptor:v1.5.0',
        ports: {
          '6060': '6060'
        },
        volumes: {
          '/cache': '/app/cache'
        },
        environment: {
          'OSDU_ENDPOINT': 'https://osdu.skk-migas.go.id',
          'OGC_VERSION': '2.0',
          'CACHE_ENABLED': 'true'
        },
        cpuUsage: 18.7,
        memoryUsage: 384.2,
        logs: `OGC-OSDU Adaptor started
Connected to OSDU endpoint
OGC Web Services v2.0 ready
Cache service enabled
Ready to serve geospatial data
SKK Migas integration active`
      },
      {
        serviceName: 'monitoring-agent',
        providerId: provider.id,
        status: 'running' as ContainerStatus,
        image: 'monitoring-agent:latest',
        ports: {
          '5050': '5050'
        },
        volumes: {
          '/metrics': '/app/metrics'
        },
        environment: {
          'METRICS_INTERVAL': '30s',
          'ALERT_WEBHOOK': 'https://alerts.ids-portal.com',
          'LOG_LEVEL': 'info'
        },
        cpuUsage: 8.4,
        memoryUsage: 128.0,
        logs: `Monitoring agent started
Collecting metrics every 30s
Alert webhook configured
Health checks running
System monitoring active
Performance baseline established`
      }
    ];

    // Insert containers
    for (const containerData of containersData) {
      const container = await prisma.container.create({
        data: containerData
      });
      console.log(`✅ Created container: ${container.serviceName} (${container.status})`);
    }

    console.log('🎉 Container seeding completed successfully!');
    console.log(`📊 Created ${containersData.length} containers`);

  } catch (error) {
    console.error('❌ Error seeding containers:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedContainers()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedContainers };
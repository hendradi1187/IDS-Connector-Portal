'use server';

import { prisma } from '@/lib/database/prisma';

export async function seedSampleMetadata() {
  try {
    // Check if sample data already exists
    const existing = await prisma.datasetMetadata.findFirst({
      where: {
        title: 'Seismic Survey Lapangan Minas 2024'
      }
    });

    if (existing) {
      return {
        success: true,
        message: 'Sample data already exists',
        skipped: true
      };
    }

    // Get first admin user for ownerId
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'Admin'
      }
    });

    if (!adminUser) {
      return {
        success: false,
        message: 'No admin user found. Please create a user first.'
      };
    }

    // Create sample datasets
    const sampleDatasets = [
      {
        title: 'Seismic Survey Lapangan Minas 2024',
        description: 'Data seismik 3D terbaru dari lapangan Minas dengan processing post-stack. Survey dilakukan menggunakan metode marine seismic dengan frekuensi sampling 2ms.',
        schema: {
          owner: 'Chevron Pacific Indonesia',
          ownerType: 'KKKS',
          location: 'https://api.chevron.com/seismic/minas-2024',
          locationType: 'API',
          format: 'SEG-Y',
          dataType: 'SEISMIC',
          quality: 'EXCELLENT',
          accessLevel: 'RESTRICTED',
          lastValidation: '2024-09-25',
          status: 'ACTIVE',
          workingArea: 'WK-001',
          coordinates: {
            latitude: 0.8562,
            longitude: 101.4500,
            coordinateSystem: 'WGS84'
          },
          acquisitionDate: '2024-06-15',
          period: '2024-06-15 to 2024-08-30'
        },
        source: 'Chevron Pacific Indonesia',
        ownerId: adminUser.id,
        tags: ['3D', 'Post-stack', 'Processed', 'Marine'],
        category: 'SEISMIC',
        domain: 'MIGAS',
        status: 'APPROVED',
        version: 1,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      },
      {
        title: 'Well Log Data Sumur Duri-001',
        description: 'Data wireline log lengkap sumur eksplorasi Duri-001 mencakup Gamma Ray, Resistivity, Density, Neutron, dan Sonic logs. Well depth: 3,245 meters.',
        schema: {
          owner: 'Pertamina Hulu Energi',
          ownerType: 'KKKS',
          location: '/storage/well-logs/duri-001.las',
          locationType: 'STORAGE',
          format: 'LAS',
          dataType: 'WELL',
          quality: 'GOOD',
          accessLevel: 'PUBLIC',
          lastValidation: '2024-09-20',
          status: 'ACTIVE',
          workingArea: 'WK-002',
          uwi: 'ID-RIAU-DURI-001',
          wellName: 'DURI-001',
          coordinates: {
            latitude: 1.2345,
            longitude: 101.5678,
            coordinateSystem: 'WGS84'
          },
          totalDepth: 3245,
          acquisitionDate: '2024-07-10'
        },
        source: 'Pertamina Hulu Energi',
        ownerId: adminUser.id,
        tags: ['Wireline', 'Gamma Ray', 'Resistivity', 'LAS 2.0'],
        category: 'WELL',
        domain: 'MIGAS',
        status: 'APPROVED',
        version: 1,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      },
      {
        title: 'Production Data Lapangan Badak Q3 2024',
        description: 'Data produksi bulanan minyak dan gas lapangan Badak untuk Q3 2024. Termasuk data produksi per well, pressure, temperature, dan water cut.',
        schema: {
          owner: 'SKK Migas',
          ownerType: 'SKK_MIGAS',
          location: 'https://data.skkmigas.go.id/production/badak',
          locationType: 'URL',
          format: 'CSV',
          dataType: 'PRODUCTION',
          quality: 'GOOD',
          accessLevel: 'PUBLIC',
          lastValidation: '2024-09-28',
          status: 'ACTIVE',
          workingArea: 'WK-003',
          fieldId: 'FIELD-BADAK-001',
          coordinates: {
            latitude: -0.1234,
            longitude: 117.5678,
            coordinateSystem: 'WGS84'
          },
          acquisitionDate: '2024-09-30',
          period: '2024-07-01 to 2024-09-30'
        },
        source: 'SKK Migas',
        ownerId: adminUser.id,
        tags: ['Monthly', 'Oil', 'Gas', 'Q3-2024'],
        category: 'PRODUCTION',
        domain: 'MIGAS',
        status: 'APPROVED',
        version: 1,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      },
      {
        title: 'Geological Map Cekungan Sumatera Tengah',
        description: 'Peta geologi detail cekungan Sumatera Tengah dengan analisis struktural, stratigrafi, dan pemetaan formasi batuan. Skala 1:50,000.',
        schema: {
          owner: 'Institut Teknologi Bandung',
          ownerType: 'VENDOR',
          location: '/storage/geological/sumatra-central-basin.shp',
          locationType: 'STORAGE',
          format: 'Shapefile',
          dataType: 'GEOLOGICAL',
          quality: 'FAIR',
          accessLevel: 'RESTRICTED',
          lastValidation: '2024-08-10',
          status: 'PENDING_REVIEW',
          workingArea: 'WK-004',
          coordinates: {
            latitude: 0.5000,
            longitude: 101.0000,
            coordinateSystem: 'WGS84'
          },
          acquisitionDate: '2024-05-20',
          scale: '1:50000'
        },
        source: 'Institut Teknologi Bandung',
        ownerId: adminUser.id,
        tags: ['Geological', 'Basin', 'Structural', 'GIS'],
        category: 'GEOLOGICAL',
        domain: 'MIGAS',
        status: 'PENDING',
        version: 1,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      }
    ];

    // Insert sample data
    const results = await prisma.datasetMetadata.createMany({
      data: sampleDatasets,
      skipDuplicates: true
    });

    return {
      success: true,
      message: `Successfully created ${results.count} sample datasets`,
      count: results.count
    };
  } catch (error) {
    console.error('Error seeding sample metadata:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to seed sample data'
    };
  }
}

export async function clearSampleMetadata() {
  try {
    const result = await prisma.datasetMetadata.deleteMany({
      where: {
        domain: 'MIGAS',
        title: {
          in: [
            'Seismic Survey Lapangan Minas 2024',
            'Well Log Data Sumur Duri-001',
            'Production Data Lapangan Badak Q3 2024',
            'Geological Map Cekungan Sumatera Tengah'
          ]
        }
      }
    });

    return {
      success: true,
      message: `Deleted ${result.count} sample datasets`,
      count: result.count
    };
  } catch (error) {
    console.error('Error clearing sample metadata:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to clear sample data'
    };
  }
}

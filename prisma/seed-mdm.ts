import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MDM seed...');

  // Clean existing MDM data (optional)
  console.log('🧹 Cleaning existing MDM data...');
  await prisma.facility.deleteMany();
  await prisma.well.deleteMany();
  await prisma.field.deleteMany();
  await prisma.seismicSurvey.deleteMany();
  await prisma.workingArea.deleteMany();

  // Seed Working Areas first
  console.log('📍 Seeding Working Areas...');
  const workingAreas = await Promise.all([
    prisma.workingArea.create({
      data: {
        wkId: 'WK-001',
        namaWk: 'Blok Mahakam',
        statusWk: 'AKTIF',
        lokasi: 'OFFSHORE',
        jenisKontrak: 'PSC',
        effectiveDate: new Date('2020-01-01'),
        expireDate: new Date('2030-12-31'),
        holding: 'PT Total E&P Indonesie',
        provinsi1: 'Kalimantan Timur',
        provinsi2: '',
        namaCekungan: 'Kutai',
        luasWk: 2500.75,
        faseWk: 'PRODUKSI',
        participatingInterest: 60.0,
        kewenangan: 'PUSAT',
        attachment: { contractFile: 'mahakam_contract.pdf' },
        shape: {
          type: 'Polygon',
          coordinates: [[
            [117.0, -0.5],
            [118.0, -0.5],
            [118.0, -1.5],
            [117.0, -1.5],
            [117.0, -0.5]
          ]]
        },
        crsEpsg: 4326
      }
    }),
    prisma.workingArea.create({
      data: {
        wkId: 'WK-002',
        namaWk: 'Blok Natuna',
        statusWk: 'AKTIF',
        lokasi: 'OFFSHORE',
        jenisKontrak: 'PSC',
        effectiveDate: new Date('2019-06-15'),
        expireDate: new Date('2029-06-14'),
        holding: 'PT Medco Energi',
        provinsi1: 'Kepulauan Riau',
        provinsi2: '',
        namaCekungan: 'Natuna',
        luasWk: 1850.25,
        faseWk: 'EKSPLORASI',
        participatingInterest: 45.0,
        kewenangan: 'PUSAT',
        attachment: { contractFile: 'natuna_contract.pdf' },
        shape: {
          type: 'Polygon',
          coordinates: [[
            [108.0, 3.0],
            [109.5, 3.0],
            [109.5, 2.0],
            [108.0, 2.0],
            [108.0, 3.0]
          ]]
        },
        crsEpsg: 4326
      }
    }),
    prisma.workingArea.create({
      data: {
        wkId: 'WK-003',
        namaWk: 'Blok Rokan',
        statusWk: 'AKTIF',
        lokasi: 'ONSHORE',
        jenisKontrak: 'PSC',
        effectiveDate: new Date('2018-08-01'),
        expireDate: new Date('2028-07-31'),
        holding: 'PT Pertamina Rokan',
        provinsi1: 'Riau',
        provinsi2: '',
        namaCekungan: 'Sumatra Tengah',
        luasWk: 3200.50,
        faseWk: 'PRODUKSI',
        participatingInterest: 100.0,
        kewenangan: 'PUSAT',
        attachment: { contractFile: 'rokan_contract.pdf' },
        shape: {
          type: 'Polygon',
          coordinates: [[
            [100.5, 1.5],
            [102.0, 1.5],
            [102.0, 0.5],
            [100.5, 0.5],
            [100.5, 1.5]
          ]]
        },
        crsEpsg: 4326
      }
    })
  ]);

  // Seed Fields second (before Wells since Wells reference Fields)
  console.log('🏭 Seeding Fields...');
  const fields = await Promise.all([
    prisma.field.create({
      data: {
        fieldId: 'FLD-001',
        fieldName: 'Mahakam Deep Field',
        wkId: 'WK-001',
        basin: 'Kutai',
        formationName: 'Balikpapan Group',
        discoveryDate: new Date('2020-12-15'),
        fieldType: 'OIL_GAS',
        status: 'ACTIVE',
        operator: 'PT Total E&P Indonesie',
        isOffshore: true,
        reservoirType: 'Sandstone',
        estimatedReserves: 150.5,
        currentProduction: 15000.0,
        shape: {
          type: 'Polygon',
          coordinates: [[
            [117.4, -0.9],
            [117.6, -0.9],
            [117.6, -1.1],
            [117.4, -1.1],
            [117.4, -0.9]
          ]]
        }
      }
    }),
    prisma.field.create({
      data: {
        fieldId: 'FLD-002',
        fieldName: 'Rokan Central Field',
        wkId: 'WK-003',
        basin: 'Sumatra Tengah',
        formationName: 'Duri Formation',
        discoveryDate: new Date('1985-03-20'),
        fieldType: 'OIL',
        status: 'ACTIVE',
        operator: 'PT Pertamina Rokan',
        isOffshore: false,
        reservoirType: 'Sandstone',
        estimatedReserves: 850.2,
        currentProduction: 45000.0,
        shape: {
          type: 'Polygon',
          coordinates: [[
            [101.0, 0.8],
            [101.5, 0.8],
            [101.5, 1.2],
            [101.0, 1.2],
            [101.0, 0.8]
          ]]
        }
      }
    })
  ]);

  // Seed Seismic Surveys
  console.log('🌊 Seeding Seismic Surveys...');
  const seismicSurveys = await Promise.all([
    prisma.seismicSurvey.create({
      data: {
        seisAcqtnSurveyId: 'SEIS-001',
        acqtnSurveyName: 'Mahakam 3D 2023',
        baLongName: 'PT Total E&P Indonesie',
        wkId: 'WK-001',
        projectId: 'MAH-3D-2023',
        projectLevel: 'Production',
        startDate: new Date('2023-03-15'),
        completedDate: new Date('2023-06-30'),
        shotBy: 'PT CGG Services Indonesia',
        seisDimension: 'THREE_D',
        environment: 'MARINE',
        seisLineType: 'CMP',
        crsRemark: 'WGS 84, EPSG:4326',
        shape: {
          type: 'Polygon',
          coordinates: [[
            [117.2, -0.7],
            [117.8, -0.7],
            [117.8, -1.3],
            [117.2, -1.3],
            [117.2, -0.7]
          ]]
        },
        shapeArea: 150.5,
        crsEpsg: 4326
      }
    }),
    prisma.seismicSurvey.create({
      data: {
        seisAcqtnSurveyId: 'SEIS-002',
        acqtnSurveyName: 'Natuna 2D Survey 2024',
        baLongName: 'PT Medco Energi',
        wkId: 'WK-002',
        projectId: 'NAT-2D-2024',
        projectLevel: 'Exploration',
        startDate: new Date('2024-01-10'),
        shotBy: 'PT Seismic Asia Pacific',
        seisDimension: 'TWO_D',
        environment: 'MARINE',
        seisLineType: 'SHOT_POINT',
        crsRemark: 'WGS 84, EPSG:4326',
        shape: {
          type: 'MultiLineString',
          coordinates: [
            [[108.2, 2.8], [109.3, 2.2]],
            [[108.5, 2.5], [109.0, 2.0]]
          ]
        },
        shapeLength: 120.8,
        crsEpsg: 4326
      }
    })
  ]);

  // Seed Wells (after Fields are created)
  console.log('🔩 Seeding Wells...');
  const wells = await Promise.all([
    prisma.well.create({
      data: {
        uwi: 'MAH-001',
        wkId: 'WK-001',
        fieldId: 'FLD-001',
        wellName: 'Mahakam Deep-1',
        operator: 'PT Total E&P Indonesie',
        currentClass: 'DEVELOPMENT',
        statusType: 'PRODUCE',
        environmentType: 'MARINE',
        profileType: 'VERTICAL',
        spudDate: new Date('2023-08-15'),
        finalDrillDate: new Date('2023-11-20'),
        surfaceLongitude: 117.5,
        surfaceLatitude: -1.0,
        nsUtm: 8890000,
        ewUtm: 450000,
        utmEpsg: 32750,
        totalDepth: 3500.0,
        waterDepth: 45.0,
        kellyBushingElevation: 12.5,
        shape: {
          type: 'Point',
          coordinates: [117.5, -1.0]
        }
      }
    }),
    prisma.well.create({
      data: {
        uwi: 'NAT-001',
        wkId: 'WK-002',
        wellName: 'Natuna Explorer-1',
        operator: 'PT Medco Energi',
        currentClass: 'EXPLORATION',
        statusType: 'DRILLING',
        environmentType: 'MARINE',
        profileType: 'DIRECTIONAL',
        spudDate: new Date('2024-02-01'),
        surfaceLongitude: 108.8,
        surfaceLatitude: 2.5,
        nsUtm: 276000,
        ewUtm: 456000,
        utmEpsg: 32648,
        totalDepth: 4200.0,
        waterDepth: 125.0,
        kellyBushingElevation: 15.0,
        shape: {
          type: 'Point',
          coordinates: [108.8, 2.5]
        }
      }
    }),
    prisma.well.create({
      data: {
        uwi: 'ROK-001',
        wkId: 'WK-003',
        fieldId: 'FLD-002',
        wellName: 'Rokan Producer-1',
        operator: 'PT Pertamina Rokan',
        currentClass: 'DEVELOPMENT',
        statusType: 'PRODUCE',
        environmentType: 'LAND',
        profileType: 'HORIZONTAL',
        spudDate: new Date('2023-05-10'),
        finalDrillDate: new Date('2023-08-25'),
        surfaceLongitude: 101.25,
        surfaceLatitude: 1.0,
        nsUtm: 110000,
        ewUtm: 345000,
        utmEpsg: 32647,
        totalDepth: 2800.0,
        kellyBushingElevation: 35.0,
        shape: {
          type: 'Point',
          coordinates: [101.25, 1.0]
        }
      }
    })
  ]);

  // Seed Facilities
  console.log('🏗️ Seeding Facilities...');
  const facilities = await Promise.all([
    prisma.facility.create({
      data: {
        facilityId: 'FAC-001',
        facilityName: 'Mahakam Central Platform',
        facilityType: 'PLATFORM',
        subType: 'Fixed Platform',
        wkId: 'WK-001',
        fieldId: 'FLD-001',
        operator: 'PT Total E&P Indonesie',
        status: 'OPERATIONAL',
        installationDate: new Date('2021-06-15'),
        commissioningDate: new Date('2021-09-01'),
        capacityProd: 25000.0,
        waterDepth: 45.0,
        noOfWell: 8,
        shape: {
          type: 'Point',
          coordinates: [117.5, -1.0]
        },
        crsEpsg: 4326
      }
    }),
    prisma.facility.create({
      data: {
        facilityId: 'FAC-002',
        facilityName: 'Rokan Processing Plant',
        facilityType: 'PROCESSING_PLANT',
        subType: 'Oil Processing',
        wkId: 'WK-003',
        fieldId: 'FLD-002',
        operator: 'PT Pertamina Rokan',
        status: 'OPERATIONAL',
        installationDate: new Date('1990-05-20'),
        commissioningDate: new Date('1990-08-15'),
        storageCapacity: 50000.0,
        plantCapacity: 60000.0,
        power: 25.5,
        shape: {
          type: 'Polygon',
          coordinates: [[
            [101.24, 0.99],
            [101.26, 0.99],
            [101.26, 1.01],
            [101.24, 1.01],
            [101.24, 0.99]
          ]]
        },
        crsEpsg: 4326
      }
    }),
    prisma.facility.create({
      data: {
        facilityId: 'FAC-003',
        facilityName: 'Mahakam-Balikpapan Pipeline',
        facilityType: 'PIPELINE',
        subType: 'Oil Pipeline',
        wkId: 'WK-001',
        operator: 'PT Total E&P Indonesie',
        status: 'OPERATIONAL',
        installationDate: new Date('2021-12-10'),
        commissioningDate: new Date('2022-03-01'),
        diameter: 20.0,
        length: 85.5,
        fluidType: 'Crude Oil',
        shape: {
          type: 'LineString',
          coordinates: [
            [117.5, -1.0],
            [117.2, -1.1],
            [117.0, -1.2],
            [116.8, -1.3]
          ]
        },
        crsEpsg: 4326
      }
    })
  ]);

  console.log('✅ MDM seed completed successfully!');
  console.log(`📊 Created:`);
  console.log(`   - ${workingAreas.length} Working Areas`);
  console.log(`   - ${fields.length} Fields`);
  console.log(`   - ${seismicSurveys.length} Seismic Surveys`);
  console.log(`   - ${wells.length} Wells`);
  console.log(`   - ${facilities.length} Facilities`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
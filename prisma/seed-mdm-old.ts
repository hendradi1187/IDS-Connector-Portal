import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MDM seed...');

  // Clean existing MDM data (optional)
  console.log('🧹 Cleaning existing MDM data...');
  await prisma.facility.deleteMany();
  await prisma.field.deleteMany();
  await prisma.well.deleteMany();
  await prisma.seismicSurvey.deleteMany();
  await prisma.workingArea.deleteMany();

  // Seed Working Areas
  console.log('📍 Seeding Working Areas...');
  const workingAreas = await Promise.all([
    prisma.workingArea.create({
      data: {
        wkId: 'WK-001',
        namaWk: 'Blok Mahakam',
        statusWk: 'Produksi',
        lokasi: 'Kalimantan Timur',
        jenisKontrak: 'PSC',
        effectiveDate: new Date('2020-01-01'),
        expireDate: new Date('2030-12-31'),
        holding: 'PT Total E&P Indonesie',
        provinsi1: 'Kalimantan Timur',
        provinsi2: '',
        namaCekungan: 'Kutai',
        luasWk: 2500.75,
        faseWk: 'Produksi',
        participatingInterest: 60.0,
        kewenangan: 'Pusat',
        attachment: 'mahakam_contract.pdf',
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
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.workingArea.create({
      data: {
        wkId: 'WK-002',
        namaWk: 'Blok Natuna',
        statusWk: 'Eksplorasi',
        lokasi: 'Kepulauan Riau',
        jenisKontrak: 'PSC',
        effectiveDate: new Date('2019-06-15'),
        expireDate: new Date('2029-06-14'),
        holding: 'PT Medco Energi',
        provinsi1: 'Kepulauan Riau',
        provinsi2: '',
        namaCekungan: 'Natuna',
        luasWk: 1850.25,
        faseWk: 'Eksplorasi',
        participatingInterest: 45.0,
        kewenangan: 'Pusat',
        attachment: 'natuna_contract.pdf',
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
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.workingArea.create({
      data: {
        wkId: 'WK-003',
        namaWk: 'Blok Rokan',
        statusWk: 'Produksi',
        lokasi: 'Riau',
        jenisKontrak: 'PSC',
        effectiveDate: new Date('2018-08-01'),
        expireDate: new Date('2028-07-31'),
        holding: 'PT Pertamina Rokan',
        provinsi1: 'Riau',
        provinsi2: '',
        namaCekungan: 'Sumatra Tengah',
        luasWk: 3200.50,
        faseWk: 'Produksi',
        participatingInterest: 100.0,
        kewenangan: 'Pusat',
        attachment: 'rokan_contract.pdf',
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
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.workingArea.create({
      data: {
        wkId: 'WK-004',
        namaWk: 'Blok Cepu',
        statusWk: 'Produksi',
        lokasi: 'Jawa Tengah',
        jenisKontrak: 'JOB',
        effectiveDate: new Date('2006-07-01'),
        expireDate: new Date('2036-06-30'),
        holding: 'ExxonMobil Cepu Ltd',
        provinsi1: 'Jawa Tengah',
        provinsi2: 'Jawa Timur',
        namaCekungan: 'Jawa Timur',
        luasWk: 1200.30,
        faseWk: 'Produksi',
        participatingInterest: 55.0,
        kewenangan: 'Pusat',
        attachment: 'cepu_contract.pdf',
        shape: {
          type: 'Polygon',
          coordinates: [[
            [111.0, -7.0],
            [111.8, -7.0],
            [111.8, -7.5],
            [111.0, -7.5],
            [111.0, -7.0]
          ]]
        },
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.workingArea.create({
      data: {
        wkId: 'WK-005',
        namaWk: 'Blok Masela',
        statusWk: 'Pengembangan',
        lokasi: 'Maluku',
        jenisKontrak: 'PSC',
        effectiveDate: new Date('2015-04-01'),
        expireDate: new Date('2045-03-31'),
        holding: 'Shell Indonesia',
        provinsi1: 'Maluku',
        provinsi2: '',
        namaCekungan: 'Arafura',
        luasWk: 2800.90,
        faseWk: 'Pengembangan',
        participatingInterest: 35.0,
        kewenangan: 'Pusat',
        attachment: 'masela_contract.pdf',
        shape: {
          type: 'Polygon',
          coordinates: [[
            [129.5, -8.0],
            [131.0, -8.0],
            [131.0, -9.0],
            [129.5, -9.0],
            [129.5, -8.0]
          ]]
        },
        crsEpsg: 4326,
        isActive: true
      }
    })
  ]);

  // Seed Seismic Surveys
  console.log('🌊 Seeding Seismic Surveys...');
  const seismicSurveys = await Promise.all([
    prisma.seismicSurvey.create({
      data: {
        surveyName: 'Mahakam 3D 2023',
        surveyType: '3D',
        contractor: 'PT CGG Services Indonesia',
        acquisitionDate: new Date('2023-03-15'),
        area: 250.5,
        surveyStatus: 'Completed',
        dataFormat: 'SEG-Y',
        coordinate: 'WGS84',
        foldCoverage: 30,
        lineSpacing: 25.0,
        shotPointInterval: 12.5,
        receiverInterval: 12.5,
        recordLength: 6.0,
        sampleRate: 2.0,
        lowCutFilter: 3.0,
        highCutFilter: 125.0,
        shape: {
          type: 'Polygon',
          coordinates: [[
            [117.2, -0.7],
            [117.8, -0.7],
            [117.8, -1.2],
            [117.2, -1.2],
            [117.2, -0.7]
          ]]
        },
        workingAreaId: workingAreas[0].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.seismicSurvey.create({
      data: {
        surveyName: 'Natuna 2D Regional',
        surveyType: '2D',
        contractor: 'PT Seismic Asia Pacific',
        acquisitionDate: new Date('2023-07-20'),
        area: 180.0,
        surveyStatus: 'Processing',
        dataFormat: 'SEG-Y',
        coordinate: 'WGS84',
        foldCoverage: 60,
        lineSpacing: 50.0,
        shotPointInterval: 25.0,
        receiverInterval: 25.0,
        recordLength: 8.0,
        sampleRate: 4.0,
        lowCutFilter: 2.0,
        highCutFilter: 100.0,
        shape: {
          type: 'MultiLineString',
          coordinates: [
            [[108.2, 2.8], [109.3, 2.8]],
            [[108.2, 2.6], [109.3, 2.6]],
            [[108.2, 2.4], [109.3, 2.4]]
          ]
        },
        workingAreaId: workingAreas[1].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.seismicSurvey.create({
      data: {
        surveyName: 'Rokan Development 3D',
        surveyType: '3D',
        contractor: 'PT Geophysical Prospecting',
        acquisitionDate: new Date('2023-09-10'),
        area: 320.75,
        surveyStatus: 'Completed',
        dataFormat: 'SEG-Y',
        coordinate: 'WGS84',
        foldCoverage: 25,
        lineSpacing: 20.0,
        shotPointInterval: 10.0,
        receiverInterval: 10.0,
        recordLength: 5.0,
        sampleRate: 2.0,
        lowCutFilter: 4.0,
        highCutFilter: 150.0,
        shape: {
          type: 'Polygon',
          coordinates: [[
            [100.8, 1.2],
            [101.5, 1.2],
            [101.5, 0.8],
            [100.8, 0.8],
            [100.8, 1.2]
          ]]
        },
        workingAreaId: workingAreas[2].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.seismicSurvey.create({
      data: {
        surveyName: 'Cepu 3D Extension',
        surveyType: '3D',
        contractor: 'PT Schlumberger Geophysics',
        acquisitionDate: new Date('2023-11-05'),
        area: 150.25,
        surveyStatus: 'Planning',
        dataFormat: 'SEG-Y',
        coordinate: 'WGS84',
        foldCoverage: 40,
        lineSpacing: 15.0,
        shotPointInterval: 8.0,
        receiverInterval: 8.0,
        recordLength: 4.0,
        sampleRate: 1.0,
        lowCutFilter: 5.0,
        highCutFilter: 200.0,
        shape: {
          type: 'Polygon',
          coordinates: [[
            [111.2, -7.1],
            [111.6, -7.1],
            [111.6, -7.4],
            [111.2, -7.4],
            [111.2, -7.1]
          ]]
        },
        workingAreaId: workingAreas[3].id,
        crsEpsg: 4326,
        isActive: true
      }
    })
  ]);

  // Seed Wells
  console.log('🕳️ Seeding Wells...');
  const wells = await Promise.all([
    prisma.well.create({
      data: {
        wellName: 'MHK-001',
        wellType: 'Eksplorasi',
        wellStatus: 'Completed',
        spudDate: new Date('2023-01-15'),
        completionDate: new Date('2023-04-20'),
        totalDepth: 3250.5,
        waterDepth: 45.2,
        kelly: 12.5,
        elevation: 8.3,
        coordinate: 'WGS84',
        latitude: -1.0,
        longitude: 117.5,
        contractor: 'PT Diamond Offshore Indonesia',
        rigName: 'KKKS Rig-05',
        purpose: 'Exploration',
        shape: {
          type: 'Point',
          coordinates: [117.5, -1.0]
        },
        workingAreaId: workingAreas[0].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.well.create({
      data: {
        wellName: 'MHK-002',
        wellType: 'Pengembangan',
        wellStatus: 'Drilling',
        spudDate: new Date('2023-08-10'),
        completionDate: null,
        totalDepth: 2890.0,
        waterDepth: 52.1,
        kelly: 15.0,
        elevation: 10.2,
        coordinate: 'WGS84',
        latitude: -1.1,
        longitude: 117.6,
        contractor: 'PT Transocean Indonesia',
        rigName: 'KKKS Rig-08',
        purpose: 'Development',
        shape: {
          type: 'Point',
          coordinates: [117.6, -1.1]
        },
        workingAreaId: workingAreas[0].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.well.create({
      data: {
        wellName: 'NTN-001',
        wellType: 'Eksplorasi',
        wellStatus: 'Planning',
        spudDate: new Date('2024-02-01'),
        completionDate: null,
        totalDepth: 4100.0,
        waterDepth: 85.5,
        kelly: 18.0,
        elevation: 12.8,
        coordinate: 'WGS84',
        latitude: 2.5,
        longitude: 108.8,
        contractor: 'PT Offshore Drilling Indonesia',
        rigName: 'Ocean Explorer',
        purpose: 'Exploration',
        shape: {
          type: 'Point',
          coordinates: [108.8, 2.5]
        },
        workingAreaId: workingAreas[1].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.well.create({
      data: {
        wellName: 'RKN-001',
        wellType: 'Produksi',
        wellStatus: 'Producing',
        spudDate: new Date('2022-05-10'),
        completionDate: new Date('2022-09-15'),
        totalDepth: 2750.25,
        waterDepth: 0.0,
        kelly: 8.5,
        elevation: 25.0,
        coordinate: 'WGS84',
        latitude: 1.0,
        longitude: 101.2,
        contractor: 'PT Nabors Drilling Indonesia',
        rigName: 'Rokan Rig-03',
        purpose: 'Production',
        shape: {
          type: 'Point',
          coordinates: [101.2, 1.0]
        },
        workingAreaId: workingAreas[2].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.well.create({
      data: {
        wellName: 'RKN-002',
        wellType: 'Injeksi',
        wellStatus: 'Completed',
        spudDate: new Date('2023-02-20'),
        completionDate: new Date('2023-06-10'),
        totalDepth: 2980.75,
        waterDepth: 0.0,
        kelly: 9.2,
        elevation: 28.5,
        coordinate: 'WGS84',
        latitude: 1.1,
        longitude: 101.3,
        contractor: 'PT Nabors Drilling Indonesia',
        rigName: 'Rokan Rig-07',
        purpose: 'Water Injection',
        shape: {
          type: 'Point',
          coordinates: [101.3, 1.1]
        },
        workingAreaId: workingAreas[2].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.well.create({
      data: {
        wellName: 'CPU-001',
        wellType: 'Produksi',
        wellStatus: 'Producing',
        spudDate: new Date('2023-04-15'),
        completionDate: new Date('2023-08-30'),
        totalDepth: 3100.50,
        waterDepth: 0.0,
        kelly: 10.5,
        elevation: 35.2,
        coordinate: 'WGS84',
        latitude: -7.2,
        longitude: 111.4,
        contractor: 'PT Halliburton Indonesia',
        rigName: 'Cepu Rig-01',
        purpose: 'Production',
        shape: {
          type: 'Point',
          coordinates: [111.4, -7.2]
        },
        workingAreaId: workingAreas[3].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.well.create({
      data: {
        wellName: 'MSL-001',
        wellType: 'Eksplorasi',
        wellStatus: 'Suspended',
        spudDate: new Date('2022-10-20'),
        completionDate: new Date('2023-03-15'),
        totalDepth: 4500.75,
        waterDepth: 120.5,
        kelly: 22.0,
        elevation: 15.8,
        coordinate: 'WGS84',
        latitude: -8.5,
        longitude: 130.2,
        contractor: 'PT Noble Corporation Indonesia',
        rigName: 'Noble Discoverer',
        purpose: 'Exploration',
        shape: {
          type: 'Point',
          coordinates: [130.2, -8.5]
        },
        workingAreaId: workingAreas[4].id,
        crsEpsg: 4326,
        isActive: true
      }
    })
  ]);

  // Seed Fields
  console.log('🏭 Seeding Fields...');
  const fields = await Promise.all([
    prisma.field.create({
      data: {
        fieldName: 'Mahakam Field',
        fieldType: 'Gas',
        discovery: new Date('1972-03-15'),
        productionStart: new Date('1977-08-20'),
        fieldStatus: 'Producing',
        reservoirType: 'Conventional',
        driveType: 'Gas Expansion',
        fluidType: 'Gas Condensate',
        reserves: 15.2,
        areaSize: 125.5,
        coordinate: 'WGS84',
        shape: {
          type: 'Polygon',
          coordinates: [[
            [117.3, -0.8],
            [117.7, -0.8],
            [117.7, -1.1],
            [117.3, -1.1],
            [117.3, -0.8]
          ]]
        },
        workingAreaId: workingAreas[0].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.field.create({
      data: {
        fieldName: 'Natuna D-Alpha',
        fieldType: 'Gas',
        discovery: new Date('1973-11-10'),
        productionStart: null,
        fieldStatus: 'Under Development',
        reservoirType: 'Conventional',
        driveType: 'Gas Expansion',
        fluidType: 'Gas with CO2',
        reserves: 46.0,
        areaSize: 230.8,
        coordinate: 'WGS84',
        shape: {
          type: 'Polygon',
          coordinates: [[
            [108.3, 2.7],
            [109.2, 2.7],
            [109.2, 2.2],
            [108.3, 2.2],
            [108.3, 2.7]
          ]]
        },
        workingAreaId: workingAreas[1].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.field.create({
      data: {
        fieldName: 'Minas Field',
        fieldType: 'Oil',
        discovery: new Date('1944-07-01'),
        productionStart: new Date('1952-01-15'),
        fieldStatus: 'Mature',
        reservoirType: 'Conventional',
        driveType: 'Water Drive',
        fluidType: 'Light Oil',
        reserves: 8.5,
        areaSize: 180.2,
        coordinate: 'WGS84',
        shape: {
          type: 'Polygon',
          coordinates: [[
            [101.0, 1.1],
            [101.4, 1.1],
            [101.4, 0.9],
            [101.0, 0.9],
            [101.0, 1.1]
          ]]
        },
        workingAreaId: workingAreas[2].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.field.create({
      data: {
        fieldName: 'Duri Field',
        fieldType: 'Oil',
        discovery: new Date('1941-02-12'),
        productionStart: new Date('1958-06-10'),
        fieldStatus: 'EOR',
        reservoirType: 'Heavy Oil',
        driveType: 'Steam Injection',
        fluidType: 'Heavy Oil',
        reserves: 12.3,
        areaSize: 220.7,
        coordinate: 'WGS84',
        shape: {
          type: 'Polygon',
          coordinates: [[
            [101.1, 1.3],
            [101.6, 1.3],
            [101.6, 1.0],
            [101.1, 1.0],
            [101.1, 1.3]
          ]]
        },
        workingAreaId: workingAreas[2].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.field.create({
      data: {
        fieldName: 'Banyu Urip Field',
        fieldType: 'Oil',
        discovery: new Date('2001-09-20'),
        productionStart: new Date('2009-04-12'),
        fieldStatus: 'Producing',
        reservoirType: 'Conventional',
        driveType: 'Water Drive',
        fluidType: 'Heavy Oil',
        reserves: 1.8,
        areaSize: 85.3,
        coordinate: 'WGS84',
        shape: {
          type: 'Polygon',
          coordinates: [[
            [111.1, -7.1],
            [111.5, -7.1],
            [111.5, -7.3],
            [111.1, -7.3],
            [111.1, -7.1]
          ]]
        },
        workingAreaId: workingAreas[3].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.field.create({
      data: {
        fieldName: 'Abadi Gas Field',
        fieldType: 'Gas',
        discovery: new Date('1998-05-30'),
        productionStart: null,
        fieldStatus: 'Under Development',
        reservoirType: 'Conventional',
        driveType: 'Gas Expansion',
        fluidType: 'Dry Gas',
        reserves: 10.5,
        areaSize: 195.8,
        coordinate: 'WGS84',
        shape: {
          type: 'Polygon',
          coordinates: [[
            [129.8, -8.3],
            [130.5, -8.3],
            [130.5, -8.7],
            [129.8, -8.7],
            [129.8, -8.3]
          ]]
        },
        workingAreaId: workingAreas[4].id,
        crsEpsg: 4326,
        isActive: true
      }
    })
  ]);

  // Seed Facilities
  console.log('🏗️ Seeding Facilities...');
  await Promise.all([
    prisma.facility.create({
      data: {
        facilityName: 'Badak LNG Train 1-8',
        facilityType: 'LNG Plant',
        facilityStatus: 'Operating',
        operationStart: new Date('1977-07-05'),
        capacity: 22.5,
        operator: 'PT Badak NGL',
        location: 'Bontang, Kalimantan Timur',
        coordinate: 'WGS84',
        latitude: -0.12,
        longitude: 117.48,
        purpose: 'LNG Production and Export',
        shape: {
          type: 'Point',
          coordinates: [117.48, -0.12]
        },
        fieldId: fields[0].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.facility.create({
      data: {
        facilityName: 'Central Processing Platform Mahakam',
        facilityType: 'Processing Platform',
        facilityStatus: 'Operating',
        operationStart: new Date('1979-03-20'),
        capacity: 850.0,
        operator: 'Total E&P Indonesie',
        location: 'Mahakam Delta',
        coordinate: 'WGS84',
        latitude: -0.95,
        longitude: 117.55,
        purpose: 'Gas Processing and Compression',
        shape: {
          type: 'Point',
          coordinates: [117.55, -0.95]
        },
        fieldId: fields[0].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.facility.create({
      data: {
        facilityName: 'Minas CPP',
        facilityType: 'CPP',
        facilityStatus: 'Operating',
        operationStart: new Date('1954-08-15'),
        capacity: 180.0,
        operator: 'PT Pertamina Rokan',
        location: 'Minas, Riau',
        coordinate: 'WGS84',
        latitude: 1.05,
        longitude: 101.25,
        purpose: 'Oil Processing and Separation',
        shape: {
          type: 'Point',
          coordinates: [101.25, 1.05]
        },
        fieldId: fields[2].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.facility.create({
      data: {
        facilityName: 'Duri Steam Plant',
        facilityType: 'Steam Generation',
        facilityStatus: 'Operating',
        operationStart: new Date('1985-11-12'),
        capacity: 450.0,
        operator: 'PT Pertamina Rokan',
        location: 'Duri, Riau',
        coordinate: 'WGS84',
        latitude: 1.15,
        longitude: 101.35,
        purpose: 'Steam Generation for EOR',
        shape: {
          type: 'Point',
          coordinates: [101.35, 1.15]
        },
        fieldId: fields[3].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.facility.create({
      data: {
        facilityName: 'Dumai Refinery',
        facilityType: 'Refinery',
        facilityStatus: 'Operating',
        operationStart: new Date('1968-04-20'),
        capacity: 170.0,
        operator: 'PT Pertamina RU II',
        location: 'Dumai, Riau',
        coordinate: 'WGS84',
        latitude: 1.68,
        longitude: 101.45,
        purpose: 'Oil Refining and Product Distribution',
        shape: {
          type: 'Point',
          coordinates: [101.45, 1.68]
        },
        fieldId: fields[2].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.facility.create({
      data: {
        facilityName: 'Cepu Oil Terminal',
        facilityType: 'Oil Terminal',
        facilityStatus: 'Operating',
        operationStart: new Date('2008-12-10'),
        capacity: 200.0,
        operator: 'ExxonMobil Cepu Ltd',
        location: 'Cepu, Jawa Tengah',
        coordinate: 'WGS84',
        latitude: -7.15,
        longitude: 111.35,
        purpose: 'Oil Storage and Export',
        shape: {
          type: 'Point',
          coordinates: [111.35, -7.15]
        },
        fieldId: fields[4].id,
        crsEpsg: 4326,
        isActive: true
      }
    }),
    prisma.facility.create({
      data: {
        facilityName: 'Masela FLNG Unit',
        facilityType: 'FLNG',
        facilityStatus: 'Under Construction',
        operationStart: null,
        capacity: 9.5,
        operator: 'Shell Indonesia',
        location: 'Masela Block, Arafura Sea',
        coordinate: 'WGS84',
        latitude: -8.4,
        longitude: 130.0,
        purpose: 'Floating LNG Production',
        shape: {
          type: 'Point',
          coordinates: [130.0, -8.4]
        },
        fieldId: fields[5].id,
        crsEpsg: 4326,
        isActive: true
      }
    })
  ]);

  console.log('✅ MDM seed completed!');
  console.log(`📊 Created:`);
  console.log(`  • ${workingAreas.length} Working Areas`);
  console.log(`  • ${seismicSurveys.length} Seismic Surveys`);
  console.log(`  • ${wells.length} Wells`);
  console.log(`  • ${fields.length} Fields`);
  console.log(`  • 7 Facilities`);
}

main()
  .catch((e) => {
    console.error('❌ MDM seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
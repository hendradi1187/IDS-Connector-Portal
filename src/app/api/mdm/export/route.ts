import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domains, format, type } = body;

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return NextResponse.json(
        { message: 'Domains array is required' },
        { status: 400 }
      );
    }

    if (!format || !type) {
      return NextResponse.json(
        { message: 'Format and type are required' },
        { status: 400 }
      );
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock report content based on type and format
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const reportData = await generateReportData(domains, type);

    let content: string | Buffer;
    let contentType: string;
    let fileExtension: string;

    switch (format) {
      case 'pdf':
        content = generatePDFContent(reportData, type);
        contentType = 'application/pdf';
        fileExtension = 'pdf';
        break;
      case 'excel':
        content = generateExcelContent(reportData, type);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
        break;
      case 'csv':
        content = generateCSVContent(reportData, type);
        contentType = 'text/csv';
        fileExtension = 'csv';
        break;
      default:
        return NextResponse.json(
          { message: 'Unsupported format' },
          { status: 400 }
        );
    }

    const filename = `MDM_${type}_Report_${timestamp}.${fileExtension}`;

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': content.length.toString(),
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { message: 'Export failed due to server error' },
      { status: 500 }
    );
  }
}

async function generateReportData(domains: string[], type: string) {
  const reportData: any = {
    metadata: {
      generatedAt: new Date().toISOString(),
      domains,
      type,
      title: getReportTitle(type)
    },
    summary: {
      totalDomains: domains.length,
      totalRecords: 0,
      compliantRecords: 0,
      issueRecords: 0
    },
    domains: []
  };

  // Generate mock data for each domain
  for (const domain of domains) {
    const domainData = await generateDomainData(domain, type);
    reportData.domains.push(domainData);
    reportData.summary.totalRecords += domainData.totalRecords;
    reportData.summary.compliantRecords += domainData.compliantRecords;
    reportData.summary.issueRecords += domainData.issueRecords;
  }

  return reportData;
}

async function generateDomainData(domain: string, type: string) {
  const totalRecords = Math.floor(Math.random() * 100) + 10;
  const compliantRecords = Math.floor(totalRecords * 0.85);
  const issueRecords = totalRecords - compliantRecords;

  return {
    domain,
    domainName: getDomainName(domain),
    totalRecords,
    compliantRecords,
    issueRecords,
    complianceRate: Math.round((compliantRecords / totalRecords) * 100),
    lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    details: type === 'detailed' ? generateDetailedData(domain) : null
  };
}

function generateDetailedData(domain: string) {
  const sampleData = [];
  const recordCount = Math.floor(Math.random() * 20) + 5;

  for (let i = 0; i < recordCount; i++) {
    sampleData.push({
      id: `${domain.toUpperCase()}_${String(i + 1).padStart(3, '0')}`,
      name: `Sample ${domain} ${i + 1}`,
      status: Math.random() > 0.15 ? 'Compliant' : 'Issue',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      validationErrors: Math.random() > 0.85 ? ['Geometry validation failed'] : []
    });
  }

  return sampleData;
}

function getDomainName(domain: string): string {
  const domainMap: { [key: string]: string } = {
    'working-areas': 'Wilayah Kerja',
    'seismic-surveys': 'Survei Seismik',
    'wells': 'Sumur',
    'fields': 'Lapangan',
    'facilities': 'Fasilitas'
  };
  return domainMap[domain] || domain;
}

function getReportTitle(type: string): string {
  const typeMap: { [key: string]: string } = {
    'summary': 'Laporan Ringkasan MDM Hulu Migas',
    'detailed': 'Laporan Detail MDM Hulu Migas',
    'compliance': 'Laporan Kepatuhan SKK Migas'
  };
  return typeMap[type] || 'Laporan MDM';
}

function generatePDFContent(data: any, type: string): string {
  // Mock PDF content - in real implementation, use a PDF library like jsPDF or puppeteer
  return `%PDF-1.4
%Mock PDF Content
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 100 >>
stream
BT
/F1 12 Tf
100 700 Td
(${data.metadata.title}) Tj
0 -20 Td
(Generated: ${data.metadata.generatedAt}) Tj
0 -20 Td
(Total Records: ${data.summary.totalRecords}) Tj
0 -20 Td
(Compliant: ${data.summary.compliantRecords}) Tj
0 -20 Td
(Issues: ${data.summary.issueRecords}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000125 00000 n
0000000185 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
400
%%EOF`;
}

function generateExcelContent(data: any, type: string): string {
  // Mock Excel content - in real implementation, use a library like xlsx
  let csv = `${data.metadata.title}\n\n`;
  csv += `Generated,${data.metadata.generatedAt}\n`;
  csv += `Report Type,${type}\n\n`;
  csv += `Summary\n`;
  csv += `Total Domains,${data.summary.totalDomains}\n`;
  csv += `Total Records,${data.summary.totalRecords}\n`;
  csv += `Compliant Records,${data.summary.compliantRecords}\n`;
  csv += `Issue Records,${data.summary.issueRecords}\n\n`;

  csv += `Domain Details\n`;
  csv += `Domain,Name,Total Records,Compliant,Issues,Compliance Rate\n`;

  data.domains.forEach((domain: any) => {
    csv += `${domain.domain},${domain.domainName},${domain.totalRecords},${domain.compliantRecords},${domain.issueRecords},${domain.complianceRate}%\n`;
  });

  return csv;
}

function generateCSVContent(data: any, type: string): string {
  let csv = `Domain,Name,Total Records,Compliant Records,Issue Records,Compliance Rate,Last Updated\n`;

  data.domains.forEach((domain: any) => {
    csv += `${domain.domain},${domain.domainName},${domain.totalRecords},${domain.compliantRecords},${domain.issueRecords},${domain.complianceRate}%,${domain.lastUpdated}\n`;
  });

  if (type === 'detailed') {
    csv += `\nDetailed Records\n`;
    csv += `Domain,Record ID,Name,Status,Created At,Validation Errors\n`;

    data.domains.forEach((domain: any) => {
      if (domain.details) {
        domain.details.forEach((record: any) => {
          csv += `${domain.domain},${record.id},${record.name},${record.status},${record.createdAt},"${record.validationErrors.join('; ')}"\n`;
        });
      }
    });
  }

  return csv;
}
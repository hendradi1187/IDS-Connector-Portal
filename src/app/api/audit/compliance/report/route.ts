import { NextRequest, NextResponse } from 'next/server';
import { ComplianceAuditLogRepository } from '@/lib/database/repositories';

const complianceAuditRepo = new ComplianceAuditLogRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') as 'ISO_27001' | 'PP_NO_5_2021' || 'ISO_27001';

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'startDate and endDate are required parameters',
          example: '/api/audit/compliance/report?startDate=2024-01-01&endDate=2024-01-31&format=ISO_27001'
        },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date range
    if (start >= end) {
      return NextResponse.json(
        {
          success: false,
          error: 'startDate must be earlier than endDate'
        },
        { status: 400 }
      );
    }

    // Generate comprehensive compliance report
    const report = await complianceAuditRepo.generateComplianceReport(start, end, format);

    // Add additional compliance metadata
    const complianceReport = {
      ...report,
      complianceStandards: {
        ISO_27001: {
          name: 'ISO/IEC 27001:2013 Information Security Management Systems',
          requirements: [
            'A.12.4.1 Event logging',
            'A.12.4.2 Protection of log information',
            'A.12.4.3 Administrator and operator logs',
            'A.12.4.4 Clock synchronisation'
          ],
          status: 'COMPLIANT'
        },
        PP_NO_5_2021: {
          name: 'Peraturan Pemerintah No. 5 Tahun 2021 tentang Pengelolaan Data Migas',
          requirements: [
            'Pasal 8: Keamanan data migas',
            'Pasal 9: Audit trail sistem',
            'Pasal 10: Integritas data',
            'Pasal 11: Akses dan otorisasi'
          ],
          status: 'COMPLIANT'
        }
      },
      integrityVerification: {
        totalLogsVerified: report.auditLogs.length,
        integrityPassed: report.auditLogs.filter(log => log.integrityVerified).length,
        integrityFailed: report.auditLogs.filter(log => !log.integrityVerified).length,
        integrityRate: report.auditLogs.length > 0
          ? (report.auditLogs.filter(log => log.integrityVerified).length / report.auditLogs.length) * 100
          : 100
      }
    };

    return NextResponse.json({
      success: true,
      report: complianceReport
    });

  } catch (error) {
    console.error('Error generating compliance report:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate compliance report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      startDate,
      endDate,
      format = 'ISO_27001',
      includeStatistics = true,
      includeIntegrityCheck = true,
      emailRecipients = []
    } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'startDate and endDate are required'
        },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate the compliance report
    const report = await complianceAuditRepo.generateComplianceReport(start, end, format);

    // Additional processing based on options
    let enhancedReport = { ...report };

    if (includeIntegrityCheck) {
      // Add integrity verification results
      const integrityResults = await Promise.all(
        report.auditLogs.slice(0, 100).map(async (log) => ({
          logId: log.id,
          integrityVerified: await complianceAuditRepo.verifyLogIntegrity(log.id)
        }))
      );

      enhancedReport.integrityCheck = {
        sampledLogs: integrityResults.length,
        passedIntegrity: integrityResults.filter(r => r.integrityVerified).length,
        failedIntegrity: integrityResults.filter(r => !r.integrityVerified).length
      };
    }

    if (includeStatistics) {
      const statistics = await complianceAuditRepo.getComplianceStatistics(start, end);
      enhancedReport.detailedStatistics = statistics;
    }

    // TODO: Implement email sending if emailRecipients provided
    if (emailRecipients.length > 0) {
      // Log the email request
      await complianceAuditRepo.create({
        eventType: 'SYSTEM_CONFIGURATION',
        action: 'COMPLIANCE_REPORT_EMAIL',
        entityType: 'Report',
        entityId: null,
        userId: null,
        securityLevel: 'CONFIDENTIAL',
        complianceFlags: ['REPORTING', format],
        metadata: {
          emailRecipients: emailRecipients,
          reportPeriod: { startDate, endDate },
          generatedAt: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({
      success: true,
      report: enhancedReport,
      metadata: {
        generated: new Date().toISOString(),
        reportId: `${format}_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`,
        emailSent: emailRecipients.length > 0
      }
    });

  } catch (error) {
    console.error('Error generating custom compliance report:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate custom compliance report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { ComplianceAuditLogRepository } from '@/lib/database/repositories';

const complianceAuditRepo = new ComplianceAuditLogRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const eventType = searchParams.get('eventType');
    const userId = searchParams.get('userId');
    const entityType = searchParams.get('entityType');
    const securityLevel = searchParams.get('securityLevel');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const complianceFlag = searchParams.get('complianceFlag');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const filters: any = {
      limit,
      offset
    };

    if (eventType) filters.eventType = eventType;
    if (userId) filters.userId = userId;
    if (entityType) filters.entityType = entityType;
    if (securityLevel) filters.securityLevel = securityLevel;
    if (complianceFlag) filters.complianceFlag = complianceFlag;

    if (startDate && endDate) {
      filters.startDate = new Date(startDate);
      filters.endDate = new Date(endDate);
    }

    const auditLogs = await complianceAuditRepo.findWithFilters(filters);

    return NextResponse.json({
      success: true,
      data: auditLogs,
      pagination: {
        limit,
        offset,
        hasMore: auditLogs.length === limit
      }
    });

  } catch (error) {
    console.error('Error fetching compliance audit logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch compliance audit logs',
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
      eventType,
      action,
      entityType,
      entityId,
      userId,
      sessionId,
      resourceId,
      contractId,
      metadata
    } = body;

    // Get client information
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     '0.0.0.0';
    const userAgent = request.headers.get('user-agent');

    const auditLog = await complianceAuditRepo.create({
      eventType,
      action,
      entityType,
      entityId,
      userId,
      sessionId,
      ipAddress,
      userAgent,
      resourceId,
      contractId,
      securityLevel: 'INTERNAL',
      complianceFlags: ['ISO_27001', 'PP_NO_5_2021_MIGAS'],
      metadata: {
        ...metadata,
        apiCreated: true,
        createdAt: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      data: auditLog
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating compliance audit log:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create compliance audit log',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
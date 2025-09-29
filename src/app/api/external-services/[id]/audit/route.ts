import { NextRequest, NextResponse } from 'next/server';
import { AdaptorAuditLogRepository, ExternalServiceRepository } from '@/lib/database/repositories';

const auditLogRepo = new AdaptorAuditLogRepository();
const externalServiceRepo = new ExternalServiceRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Verify service exists
    const service = await externalServiceRepo.findById(params.id);
    if (!service) {
      return NextResponse.json(
        { error: 'External service not found' },
        { status: 404 }
      );
    }

    let auditLogs;

    if (action) {
      auditLogs = await auditLogRepo.findByAction(action, limit);
      // Filter by service ID
      auditLogs = auditLogs.filter(log => log.externalServiceId === params.id);
    } else if (startDate && endDate) {
      auditLogs = await auditLogRepo.findByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
      // Filter by service ID
      auditLogs = auditLogs.filter(log => log.externalServiceId === params.id);
    } else {
      auditLogs = await auditLogRepo.findByServiceId(params.id, limit);
    }

    return NextResponse.json(auditLogs);

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      action,
      endpoint,
      method,
      requestParams,
      responseStatus,
      responseTime,
      userAgent,
      ipAddress
    } = body;

    // Verify service exists
    const service = await externalServiceRepo.findById(params.id);
    if (!service) {
      return NextResponse.json(
        { error: 'External service not found' },
        { status: 404 }
      );
    }

    const auditLog = await auditLogRepo.create({
      externalServiceId: params.id,
      userId: null, // TODO: Get from auth
      action,
      endpoint,
      requestMethod: method,
      requestParams,
      responseStatus,
      responseTime,
      userAgent,
      ipAddress
    });

    return NextResponse.json(auditLog, { status: 201 });

  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json(
      { error: 'Failed to create audit log' },
      { status: 500 }
    );
  }
}
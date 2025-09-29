import { NextRequest, NextResponse } from 'next/server';
import { RequestActionAuditLogRepository } from '@/lib/database/repositories';

const requestAuditRepo = new RequestActionAuditLogRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const requestId = searchParams.get('requestId');
    const userId = searchParams.get('userId');
    const actionType = searchParams.get('actionType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    let requestLogs;

    if (requestId) {
      requestLogs = await requestAuditRepo.findByRequestId(requestId, limit);
    } else if (userId) {
      requestLogs = await requestAuditRepo.findByUserId(userId, limit);
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // For date range queries, return statistics
      const statistics = await requestAuditRepo.getRequestStatistics(start, end);

      return NextResponse.json({
        success: true,
        data: {
          statistics,
          period: { startDate: start, endDate: end }
        }
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide either requestId, userId, or date range (startDate and endDate)'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: requestLogs
    });

  } catch (error) {
    console.error('Error fetching request audit logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch request audit logs',
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
      requestId,
      actionType,
      performedByUserId,
      authorizedByUserId,
      dataRequested,
      businessJustification,
      projectCode,
      contractId,
      rejectionReason,
      deliveredData,
      deliveryMethod
    } = body;

    // Validate required fields
    if (!requestId || !actionType || !performedByUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: requestId, actionType, performedByUserId'
        },
        { status: 400 }
      );
    }

    // Get client information
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     '0.0.0.0';
    const userAgent = request.headers.get('user-agent');
    const sessionId = request.headers.get('x-session-id');

    let requestLog;

    // Route to appropriate logging method based on action type
    switch (actionType.toLowerCase()) {
      case 'submit':
        requestLog = await requestAuditRepo.logRequestSubmission(
          requestId,
          performedByUserId,
          dataRequested,
          businessJustification,
          projectCode,
          contractId,
          ipAddress,
          userAgent,
          sessionId
        );
        break;

      case 'approve':
        requestLog = await requestAuditRepo.logRequestApproval(
          requestId,
          performedByUserId,
          authorizedByUserId,
          undefined, // previousStatus - will be determined by repository
          undefined, // newStatus - will be determined by repository
          {
            accessGranted: dataRequested,
            deliveryMethod: deliveryMethod || 'secure_download'
          },
          ipAddress,
          userAgent,
          sessionId
        );
        break;

      case 'reject':
        if (!rejectionReason) {
          return NextResponse.json(
            {
              success: false,
              error: 'rejectionReason is required for reject action'
            },
            { status: 400 }
          );
        }

        requestLog = await requestAuditRepo.logRequestRejection(
          requestId,
          performedByUserId,
          rejectionReason,
          undefined, // previousStatus - will be determined by repository
          ipAddress,
          userAgent,
          sessionId
        );
        break;

      case 'deliver':
        if (!deliveredData || !deliveryMethod) {
          return NextResponse.json(
            {
              success: false,
              error: 'deliveredData and deliveryMethod are required for deliver action'
            },
            { status: 400 }
          );
        }

        requestLog = await requestAuditRepo.logDataDelivery(
          requestId,
          performedByUserId,
          deliveredData,
          deliveryMethod,
          ipAddress,
          userAgent,
          sessionId
        );
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported action type: ${actionType}. Supported types: submit, approve, reject, deliver`
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: requestLog
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating request audit log:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create request audit log',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
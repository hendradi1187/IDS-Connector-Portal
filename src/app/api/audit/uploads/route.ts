import { NextRequest, NextResponse } from 'next/server';
import { ResourceUploadAuditLogRepository } from '@/lib/database/repositories';

const uploadAuditRepo = new ResourceUploadAuditLogRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const resourceId = searchParams.get('resourceId');
    const userId = searchParams.get('userId');
    const uploadStatus = searchParams.get('uploadStatus');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');

    let uploadLogs;

    if (resourceId) {
      uploadLogs = await uploadAuditRepo.findByResourceId(resourceId, limit);
    } else if (userId) {
      uploadLogs = await uploadAuditRepo.findByUserId(userId, limit);
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // For date range queries, we'll fetch statistics
      const statistics = await uploadAuditRepo.getUploadStatistics(start, end);
      const highRiskUploads = await uploadAuditRepo.findHighRiskUploads(start, end);

      return NextResponse.json({
        success: true,
        data: {
          statistics,
          highRiskUploads,
          period: { startDate: start, endDate: end }
        }
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide either resourceId, userId, or date range (startDate and endDate)'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: uploadLogs
    });

  } catch (error) {
    console.error('Error fetching upload audit logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch upload audit logs',
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
      resourceId,
      originalFileName,
      fileSize,
      fileType,
      mimeType,
      userId,
      businessJustification,
      projectCode,
      contractId
    } = body;

    // Validate required fields
    if (!resourceId || !originalFileName || !fileSize || !fileType || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: resourceId, originalFileName, fileSize, fileType, userId'
        },
        { status: 400 }
      );
    }

    // Get client information
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     '0.0.0.0';
    const userAgent = request.headers.get('user-agent');

    const uploadLog = await uploadAuditRepo.logUploadInitiated(
      userId,
      resourceId,
      originalFileName,
      BigInt(fileSize),
      fileType,
      mimeType,
      ipAddress,
      userAgent,
      businessJustification,
      projectCode,
      contractId
    );

    return NextResponse.json({
      success: true,
      data: uploadLog
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating upload audit log:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create upload audit log',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
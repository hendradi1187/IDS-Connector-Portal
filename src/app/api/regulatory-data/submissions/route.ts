import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';

// GET /api/regulatory-data/submissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Parse status filter
    let statusFilter: string[] = [];
    if (status) {
      statusFilter = status.split(',');
    }

    // Build where clause
    const where: any = {};
    if (statusFilter.length > 0) {
      where.status = {
        in: statusFilter
      };
    }

    // Mock data for demo purposes since database schema is still being set up
    const mockSubmissions = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        submissionType: 'SEISMIC_DATA',
        status: 'SUBMITTED',
        priority: 'NORMAL',
        contractorWorkArea: 'Mahakam Block',
        reportingPeriod: 'MONTHLY',
        submittedAt: new Date('2024-01-15T08:30:00Z').toISOString(),
        dueDate: new Date('2024-01-30T17:00:00Z').toISOString(),
        submitter: {
          id: 'user-001',
          name: 'PT Pertamina EP',
          email: 'submission@pertamina.com'
        },
        receiver: {
          id: 'skk-001',
          name: 'SKK Migas',
          email: 'data@skkmigas.go.id'
        },
        reviewer: null,
        currentValidations: 0,
        requiredValidations: 2
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        submissionType: 'WELL_LOG_DATA',
        status: 'UNDER_REVIEW',
        priority: 'HIGH',
        contractorWorkArea: 'Natuna Block',
        reportingPeriod: 'QUARTERLY',
        submittedAt: new Date('2024-01-10T14:20:00Z').toISOString(),
        dueDate: new Date('2024-01-25T17:00:00Z').toISOString(),
        submitter: {
          id: 'user-002',
          name: 'PT Chevron Pacific Indonesia',
          email: 'data@chevron.com'
        },
        receiver: {
          id: 'skk-001',
          name: 'SKK Migas',
          email: 'data@skkmigas.go.id'
        },
        reviewer: {
          id: 'rev-001',
          name: 'Dr. Ahmad Reviewer',
          email: 'ahmad.reviewer@skkmigas.go.id'
        },
        currentValidations: 1,
        requiredValidations: 2
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        submissionType: 'PRODUCTION_DATA',
        status: 'APPROVED',
        priority: 'NORMAL',
        contractorWorkArea: 'Cepu Block',
        reportingPeriod: 'MONTHLY',
        submittedAt: new Date('2024-01-05T09:15:00Z').toISOString(),
        dueDate: new Date('2024-01-20T17:00:00Z').toISOString(),
        submitter: {
          id: 'user-003',
          name: 'PT ExxonMobil Cepu Limited',
          email: 'reporting@exxonmobil.com'
        },
        receiver: {
          id: 'skk-001',
          name: 'SKK Migas',
          email: 'data@skkmigas.go.id'
        },
        reviewer: {
          id: 'rev-002',
          name: 'Ir. Siti Reviewer',
          email: 'siti.reviewer@skkmigas.go.id'
        },
        currentValidations: 2,
        requiredValidations: 2
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        submissionType: 'ENVIRONMENTAL_REPORT',
        status: 'REVISION_REQUIRED',
        priority: 'URGENT',
        contractorWorkArea: 'Sanga-Sanga Block',
        reportingPeriod: 'ANNUALLY',
        submittedAt: new Date('2024-01-08T11:45:00Z').toISOString(),
        dueDate: new Date('2024-01-22T17:00:00Z').toISOString(),
        submitter: {
          id: 'user-004',
          name: 'PT Total E&P Indonesie',
          email: 'env@total.com'
        },
        receiver: {
          id: 'skk-001',
          name: 'SKK Migas',
          email: 'data@skkmigas.go.id'
        },
        reviewer: {
          id: 'rev-003',
          name: 'Dr. Budi Environment',
          email: 'budi.env@skkmigas.go.id'
        },
        currentValidations: 1,
        requiredValidations: 3
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        submissionType: 'FINANCIAL_REPORT',
        status: 'ACKNOWLEDGED',
        priority: 'NORMAL',
        contractorWorkArea: 'Rokan Block',
        reportingPeriod: 'QUARTERLY',
        submittedAt: new Date('2024-01-01T10:00:00Z').toISOString(),
        dueDate: new Date('2024-01-15T17:00:00Z').toISOString(),
        submitter: {
          id: 'user-005',
          name: 'PT Pertamina Rokan',
          email: 'finance@pertamina-rokan.com'
        },
        receiver: {
          id: 'skk-001',
          name: 'SKK Migas',
          email: 'data@skkmigas.go.id'
        },
        reviewer: {
          id: 'rev-004',
          name: 'Drs. Andi Finance',
          email: 'andi.finance@skkmigas.go.id'
        },
        currentValidations: 2,
        requiredValidations: 2
      }
    ];

    // Filter by status if provided
    let filteredSubmissions = mockSubmissions;
    if (statusFilter.length > 0) {
      filteredSubmissions = mockSubmissions.filter(submission =>
        statusFilter.includes(submission.status)
      );
    }

    return NextResponse.json({
      success: true,
      submissions: filteredSubmissions,
      total: filteredSubmissions.length
    });

  } catch (error) {
    console.error('Error fetching regulatory data submissions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch regulatory data submissions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/regulatory-data/submissions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      submissionType,
      submitterId,
      receiverId,
      priority = 'NORMAL',
      requiredValidations = 2
    } = body;

    if (!submissionType || !submitterId || !receiverId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: submissionType, submitterId, receiverId'
        },
        { status: 400 }
      );
    }

    // Mock submission creation
    const newSubmission = {
      id: `550e8400-e29b-41d4-a716-${Date.now()}`,
      submissionType,
      status: 'SUBMITTED',
      priority,
      contractorWorkArea: body.contractorWorkArea || null,
      reportingPeriod: body.reportingPeriod || null,
      submittedAt: new Date().toISOString(),
      dueDate: body.dueDate || null,
      submitter: {
        id: submitterId,
        name: 'KKKS Contractor', // In real app, fetch from database
        email: 'contractor@example.com'
      },
      receiver: {
        id: receiverId,
        name: 'SKK Migas',
        email: 'data@skkmigas.go.id'
      },
      reviewer: null,
      currentValidations: 0,
      requiredValidations,
      submissionData: body.submissionData || {},
      complianceStandard: body.complianceStandard || 'SKK_MIGAS_STANDARD',
      documentFormat: body.documentFormat || 'PDF',
      dataFormat: body.dataFormat || 'JSON'
    };

    return NextResponse.json({
      success: true,
      submission: newSubmission,
      message: 'Regulatory data submission created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating regulatory data submission:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create regulatory data submission',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
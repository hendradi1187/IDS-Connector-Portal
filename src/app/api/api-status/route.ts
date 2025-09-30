import { NextRequest, NextResponse } from 'next/server';
import { ApiStatusRepository } from '@/lib/database/repositories';
import { ApiStatusType } from '@prisma/client';

const apiStatusRepo = new ApiStatusRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceName = searchParams.get('serviceName');
    const status = searchParams.get('status') as ApiStatusType;

    let apiStatuses;

    if (serviceName) {
      apiStatuses = await apiStatusRepo.findByServiceName(serviceName);
    } else if (status) {
      apiStatuses = await apiStatusRepo.findByStatus(status);
    } else {
      apiStatuses = await apiStatusRepo.findAll();
    }

    return NextResponse.json(apiStatuses);
  } catch (error) {
    console.error('Error fetching API statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API statuses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const apiStatus = await apiStatusRepo.create({
      serviceName: body.serviceName,
      endpoint: body.endpoint,
      status: body.status || 'unknown',
      responseTime: body.responseTime,
      statusCode: body.statusCode,
      errorMessage: body.errorMessage
    });

    return NextResponse.json(apiStatus, { status: 201 });
  } catch (error) {
    console.error('Error creating API status:', error);
    return NextResponse.json(
      { error: 'Failed to create API status' },
      { status: 500 }
    );
  }
}
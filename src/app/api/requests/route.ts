import { NextRequest, NextResponse } from 'next/server';
import { RequestRepository } from '@/lib/database/repositories';
import { RequestType, RequestStatus } from '@prisma/client';

const requestRepo = new RequestRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requesterId = searchParams.get('requesterId');
    const providerId = searchParams.get('providerId');
    const status = searchParams.get('status') as RequestStatus;
    const requestType = searchParams.get('requestType') as RequestType;

    let requests;

    if (requesterId) {
      requests = await requestRepo.findByRequesterId(requesterId);
    } else if (providerId) {
      requests = await requestRepo.findByProviderId(providerId);
    } else if (status) {
      requests = await requestRepo.findByStatus(status);
    } else if (requestType) {
      requests = await requestRepo.findByRequestType(requestType);
    } else {
      requests = await requestRepo.findAll();
    }

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const dataRequest = await requestRepo.create({
      requesterId: body.requesterId,
      providerId: body.providerId,
      resourceId: body.resourceId,
      requestType: body.requestType,
      status: body.status || 'pending',
      purpose: body.purpose
    });

    return NextResponse.json(dataRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
}
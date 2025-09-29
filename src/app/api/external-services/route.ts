import { NextRequest, NextResponse } from 'next/server';
import { ExternalServiceRepository } from '@/lib/database/repositories';
import { ExternalServiceType, ExternalServiceStatus, AuthenticationType } from '@/generated/prisma';
import { validateQuery, validateBody, externalServiceQuerySchema, externalServiceCreateSchema, createErrorResponse, validatePagination } from '@/lib/validation';

const externalServiceRepo = new ExternalServiceRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get('serviceType') as ExternalServiceType;
    const status = searchParams.get('status') as ExternalServiceStatus;
    const authType = searchParams.get('authType') as AuthenticationType;

    let services;

    if (serviceType) {
      services = await externalServiceRepo.findByServiceType(serviceType);
    } else if (status) {
      services = await externalServiceRepo.findByStatus(status);
    } else if (authType) {
      services = await externalServiceRepo.findByAuthType(authType);
    } else {
      services = await externalServiceRepo.findAll();
    }

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching external services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch external services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const service = await externalServiceRepo.create({
      name: body.name,
      description: body.description,
      serviceType: body.serviceType,
      endpoint: body.endpoint,
      authType: body.authType,
      credentials: body.credentials,
      status: body.status || 'inactive',
      syncInterval: body.syncInterval,
      metadata: body.metadata
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating external service:', error);
    return NextResponse.json(
      { error: 'Failed to create external service' },
      { status: 500 }
    );
  }
}
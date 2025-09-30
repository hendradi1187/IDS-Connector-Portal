import { NextRequest, NextResponse } from 'next/server';
import { ServiceApplicationRepository } from '@/lib/database/repositories';
import { ServiceApplicationStatus } from '@prisma/client';

const serviceAppRepo = new ServiceApplicationRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const status = searchParams.get('status') as ServiceApplicationStatus;

    let serviceApplications;

    if (providerId) {
      serviceApplications = await serviceAppRepo.findByProviderId(providerId);
    } else if (status) {
      serviceApplications = await serviceAppRepo.findByStatus(status);
    } else {
      serviceApplications = await serviceAppRepo.findAll();
    }

    return NextResponse.json(serviceApplications);
  } catch (error) {
    console.error('Error fetching service applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service applications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const serviceApplication = await serviceAppRepo.create({
      name: body.name,
      description: body.description,
      version: body.version,
      providerId: body.providerId,
      status: body.status || 'inactive',
      endpoint: body.endpoint,
      healthCheck: body.healthCheck,
      apiKey: body.apiKey,
      metadata: body.metadata
    });

    return NextResponse.json(serviceApplication, { status: 201 });
  } catch (error) {
    console.error('Error creating service application:', error);
    return NextResponse.json(
      { error: 'Failed to create service application' },
      { status: 500 }
    );
  }
}
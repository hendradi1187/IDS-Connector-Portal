import { NextRequest, NextResponse } from 'next/server';
import { ServiceApplicationRepository } from '@/lib/database/repositories';

const serviceAppRepo = new ServiceApplicationRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceApplication = await serviceAppRepo.findById(params.id);

    if (!serviceApplication) {
      return NextResponse.json(
        { error: 'Service application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(serviceApplication);
  } catch (error) {
    console.error('Error fetching service application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service application' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const serviceApplication = await serviceAppRepo.update(params.id, {
      name: body.name,
      description: body.description,
      version: body.version,
      providerId: body.providerId,
      status: body.status,
      endpoint: body.endpoint,
      healthCheck: body.healthCheck,
      apiKey: body.apiKey,
      metadata: body.metadata
    });

    return NextResponse.json(serviceApplication);
  } catch (error) {
    console.error('Error updating service application:', error);
    return NextResponse.json(
      { error: 'Failed to update service application' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await serviceAppRepo.delete(params.id);

    return NextResponse.json({ message: 'Service application deleted successfully' });
  } catch (error) {
    console.error('Error deleting service application:', error);
    return NextResponse.json(
      { error: 'Failed to delete service application' },
      { status: 500 }
    );
  }
}
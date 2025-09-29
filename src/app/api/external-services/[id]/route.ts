import { NextRequest, NextResponse } from 'next/server';
import { ExternalServiceRepository } from '@/lib/database/repositories';

const externalServiceRepo = new ExternalServiceRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await externalServiceRepo.findById(params.id);

    if (!service) {
      return NextResponse.json(
        { error: 'External service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching external service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch external service' },
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

    const service = await externalServiceRepo.update(params.id, {
      name: body.name,
      description: body.description,
      serviceType: body.serviceType,
      endpoint: body.endpoint,
      authType: body.authType,
      credentials: body.credentials,
      status: body.status,
      syncInterval: body.syncInterval,
      metadata: body.metadata
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating external service:', error);
    return NextResponse.json(
      { error: 'Failed to update external service' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await externalServiceRepo.delete(params.id);

    return NextResponse.json({ message: 'External service deleted successfully' });
  } catch (error) {
    console.error('Error deleting external service:', error);
    return NextResponse.json(
      { error: 'Failed to delete external service' },
      { status: 500 }
    );
  }
}
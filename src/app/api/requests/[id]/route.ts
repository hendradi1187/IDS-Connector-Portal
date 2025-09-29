import { NextRequest, NextResponse } from 'next/server';
import { RequestRepository } from '@/lib/database/repositories';

const requestRepo = new RequestRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dataRequest = await requestRepo.findById(params.id);

    if (!dataRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(dataRequest);
  } catch (error) {
    console.error('Error fetching request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request' },
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

    const dataRequest = await requestRepo.update(params.id, {
      requesterId: body.requesterId,
      providerId: body.providerId,
      resourceId: body.resourceId,
      requestType: body.requestType,
      status: body.status,
      purpose: body.purpose
    });

    return NextResponse.json(dataRequest);
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requestRepo.delete(params.id);

    return NextResponse.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    return NextResponse.json(
      { error: 'Failed to delete request' },
      { status: 500 }
    );
  }
}
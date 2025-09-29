import { NextRequest, NextResponse } from 'next/server';
import { BrokerRepository } from '@/lib/database/repositories';

const brokerRepo = new BrokerRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const broker = await brokerRepo.findById(params.id);

    if (!broker) {
      return NextResponse.json(
        { error: 'Broker not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(broker);
  } catch (error) {
    console.error('Error fetching broker:', error);
    return NextResponse.json(
      { error: 'Failed to fetch broker' },
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

    const broker = await brokerRepo.update(params.id, {
      transactionId: body.transactionId,
      requestId: body.requestId,
      validationStatus: body.validationStatus,
      notes: body.notes
    });

    return NextResponse.json(broker);
  } catch (error) {
    console.error('Error updating broker:', error);
    return NextResponse.json(
      { error: 'Failed to update broker' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await brokerRepo.delete(params.id);

    return NextResponse.json({ message: 'Broker deleted successfully' });
  } catch (error) {
    console.error('Error deleting broker:', error);
    return NextResponse.json(
      { error: 'Failed to delete broker' },
      { status: 500 }
    );
  }
}
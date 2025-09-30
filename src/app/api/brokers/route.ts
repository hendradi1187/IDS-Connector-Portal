import { NextRequest, NextResponse } from 'next/server';
import { BrokerRepository } from '@/lib/database/repositories';
import { ValidationStatus } from '@prisma/client';

const brokerRepo = new BrokerRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validationStatus = searchParams.get('validationStatus') as ValidationStatus;

    let brokers;

    if (validationStatus) {
      brokers = await brokerRepo.findByValidationStatus(validationStatus);
    } else {
      brokers = await brokerRepo.findAll();
    }

    return NextResponse.json(brokers);
  } catch (error) {
    console.error('Error fetching brokers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brokers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const broker = await brokerRepo.create({
      transactionId: body.transactionId,
      requestId: body.requestId,
      validationStatus: body.validationStatus || 'pending',
      notes: body.notes
    });

    return NextResponse.json(broker, { status: 201 });
  } catch (error) {
    console.error('Error creating broker:', error);
    return NextResponse.json(
      { error: 'Failed to create broker' },
      { status: 500 }
    );
  }
}
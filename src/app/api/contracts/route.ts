import { NextRequest, NextResponse } from 'next/server';
import { ContractRepository } from '@/lib/database/repositories';
import { ContractStatus, ContractType } from '@/generated/prisma';

const contractRepo = new ContractRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const consumerId = searchParams.get('consumerId');
    const status = searchParams.get('status') as ContractStatus;
    const contractType = searchParams.get('contractType') as ContractType;

    let contracts;

    if (providerId) {
      contracts = await contractRepo.findByProviderId(providerId);
    } else if (consumerId) {
      contracts = await contractRepo.findByConsumerId(consumerId);
    } else if (status) {
      contracts = await contractRepo.findByStatus(status);
    } else if (contractType) {
      contracts = await contractRepo.findByType(contractType);
    } else {
      contracts = await contractRepo.findAll();
    }

    return NextResponse.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const contract = await contractRepo.create({
      title: body.title,
      description: body.description,
      providerId: body.providerId,
      consumerId: body.consumerId,
      serviceApplicationId: body.serviceApplicationId,
      resourceId: body.resourceId,
      status: body.status || 'draft',
      contractType: body.contractType,
      terms: body.terms,
      validFrom: new Date(body.validFrom),
      validUntil: new Date(body.validUntil)
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    );
  }
}
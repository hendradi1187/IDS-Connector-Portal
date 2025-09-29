import { NextRequest, NextResponse } from 'next/server';
import { ContractRepository } from '@/lib/database/repositories';

const contractRepo = new ContractRepository();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contract = await contractRepo.findById(params.id);

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    if (contract.status !== 'active') {
      return NextResponse.json(
        { error: 'Only active contracts can be terminated' },
        { status: 400 }
      );
    }

    const terminatedContract = await contractRepo.terminateContract(params.id);

    return NextResponse.json({
      message: 'Contract terminated successfully',
      contract: terminatedContract
    });
  } catch (error) {
    console.error('Error terminating contract:', error);
    return NextResponse.json(
      { error: 'Failed to terminate contract' },
      { status: 500 }
    );
  }
}
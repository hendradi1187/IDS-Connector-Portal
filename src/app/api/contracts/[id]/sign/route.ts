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

    if (contract.status !== 'pending') {
      return NextResponse.json(
        { error: 'Contract must be in pending status to be signed' },
        { status: 400 }
      );
    }

    const signedContract = await contractRepo.signContract(params.id);

    return NextResponse.json({
      message: 'Contract signed successfully',
      contract: signedContract
    });
  } catch (error) {
    console.error('Error signing contract:', error);
    return NextResponse.json(
      { error: 'Failed to sign contract' },
      { status: 500 }
    );
  }
}
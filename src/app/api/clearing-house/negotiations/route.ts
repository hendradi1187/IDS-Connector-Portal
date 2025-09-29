import { NextRequest, NextResponse } from 'next/server';
import { clearingHouseTransactionRepository } from '@/lib/database/repositories';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate transaction exists
    const transaction = await clearingHouseTransactionRepository.findById(data.transactionId);
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Create negotiation entry
    const negotiation = await clearingHouseTransactionRepository.createNegotiation({
      transactionId: data.transactionId,
      contractId: data.contractId,
      proposedByUserId: data.proposedByUserId,
      proposalType: data.proposalType,
      proposedTerms: data.proposedTerms,
      previousTerms: data.previousTerms,
      changes: data.changes,
      proposedPrice: data.proposedPrice ? parseFloat(data.proposedPrice) : null,
      paymentTerms: data.paymentTerms,
      validUntil: new Date(data.validUntil),
      autoAccept: data.autoAccept || false
    });

    // Update transaction status to negotiating if not already
    if (transaction.status === 'INITIATED' || transaction.status === 'PENDING_VALIDATION') {
      await clearingHouseTransactionRepository.update(data.transactionId, {
        status: 'NEGOTIATING'
      });
    }

    // Create audit log
    await clearingHouseTransactionRepository.createAuditLog({
      transactionId: data.transactionId,
      eventType: 'NEGOTIATION_STARTED',
      eventDescription: `New ${data.proposalType.toLowerCase().replace('_', ' ')} submitted`,
      actorUserId: data.proposedByUserId,
      newState: negotiation,
      metadata: {
        negotiationId: negotiation.id,
        proposalType: data.proposalType,
        round: negotiation.round
      }
    });

    return NextResponse.json(negotiation, { status: 201 });
  } catch (error) {
    console.error('Error creating negotiation:', error);
    return NextResponse.json(
      { error: 'Failed to create negotiation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    const status = searchParams.get('status');
    const proposedByUserId = searchParams.get('proposedByUserId');

    const filters: any = {};
    if (transactionId) filters.transactionId = transactionId;
    if (status) filters.status = status;
    if (proposedByUserId) filters.proposedByUserId = proposedByUserId;

    const negotiations = await clearingHouseTransactionRepository.findNegotiations({
      where: filters,
      include: {
        transaction: {
          select: {
            id: true,
            transactionType: true,
            status: true,
            totalAmount: true,
            currency: true
          }
        },
        contract: {
          select: {
            id: true,
            title: true,
            contractType: true,
            status: true
          }
        },
        proposedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        responseBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { proposedAt: 'desc' }
    });

    return NextResponse.json(negotiations);
  } catch (error) {
    console.error('Error fetching negotiations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch negotiations' },
      { status: 500 }
    );
  }
}
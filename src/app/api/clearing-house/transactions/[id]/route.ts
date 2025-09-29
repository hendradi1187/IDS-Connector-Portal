import { NextRequest, NextResponse } from 'next/server';
import { clearingHouseTransactionRepository } from '@/lib/database/repositories';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await clearingHouseTransactionRepository.findById(params.id, {
      include: {
        initiator: { select: { id: true, name: true, email: true, role: true } },
        provider: { select: { id: true, name: true, email: true, role: true } },
        consumer: { select: { id: true, name: true, email: true, role: true } },
        contract: {
          select: {
            id: true,
            title: true,
            status: true,
            contractType: true,
            terms: true,
            validFrom: true,
            validUntil: true
          }
        },
        request: {
          select: {
            id: true,
            requestType: true,
            status: true,
            purpose: true,
            createdAt: true
          }
        },
        resource: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true,
            accessPolicy: true
          }
        },
        validations: {
          include: {
            validator: { select: { id: true, name: true, email: true, role: true } }
          },
          orderBy: { requestedAt: 'desc' }
        },
        payments: {
          include: {
            payer: { select: { id: true, name: true, email: true } },
            payee: { select: { id: true, name: true, email: true } }
          },
          orderBy: { requestedAt: 'desc' }
        },
        negotiations: {
          include: {
            proposedBy: { select: { id: true, name: true, email: true } },
            responseBy: { select: { id: true, name: true, email: true } }
          },
          orderBy: { proposedAt: 'desc' }
        },
        auditLogs: {
          include: {
            actor: { select: { id: true, name: true, email: true } }
          },
          orderBy: { timestamp: 'desc' },
          take: 50 // Limit audit logs for performance
        }
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const transactionId = params.id;

    // Get current transaction for audit trail
    const currentTransaction = await clearingHouseTransactionRepository.findById(transactionId);
    if (!currentTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const updatedTransaction = await clearingHouseTransactionRepository.update(transactionId, {
      status: data.status,
      priority: data.priority,
      totalAmount: data.totalAmount ? parseFloat(data.totalAmount) : undefined,
      currency: data.currency,
      billingModel: data.billingModel,
      complianceLevel: data.complianceLevel,
      securityRating: data.securityRating,
      riskScore: data.riskScore,
      expectedCompletion: data.expectedCompletion ? new Date(data.expectedCompletion) : undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      completedAt: data.status === 'COMPLETED' ? new Date() : undefined,
      transactionData: data.transactionData,
      contractTerms: data.contractTerms,
      metadata: data.metadata
    });

    // Create audit log for the update
    await clearingHouseTransactionRepository.createAuditLog({
      transactionId,
      eventType: 'STATUS_CHANGED',
      eventDescription: `Transaction status changed from ${currentTransaction.status} to ${data.status}`,
      actorUserId: data.actorUserId,
      previousState: currentTransaction,
      newState: updatedTransaction,
      changedFields: Object.keys(data),
      metadata: { source: 'api', userAgent: request.headers.get('user-agent') }
    });

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = params.id;
    const { searchParams } = new URL(request.url);
    const actorUserId = searchParams.get('actorUserId');

    const transaction = await clearingHouseTransactionRepository.findById(transactionId);
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of transactions in certain states
    if (!['INITIATED', 'PENDING_VALIDATION', 'REJECTED', 'CANCELLED'].includes(transaction.status)) {
      return NextResponse.json(
        { error: 'Transaction cannot be deleted in current status' },
        { status: 400 }
      );
    }

    await clearingHouseTransactionRepository.delete(transactionId);

    // Create audit log for deletion
    if (actorUserId) {
      await clearingHouseTransactionRepository.createAuditLog({
        transactionId,
        eventType: 'TRANSACTION_CANCELLED',
        eventDescription: `Transaction ${transactionId} deleted`,
        actorUserId,
        previousState: transaction,
        metadata: { source: 'api', userAgent: request.headers.get('user-agent') }
      });
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
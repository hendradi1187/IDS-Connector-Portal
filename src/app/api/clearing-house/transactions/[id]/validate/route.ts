import { NextRequest, NextResponse } from 'next/server';
import { clearingHouseTransactionRepository } from '@/lib/database/repositories';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const transactionId = params.id;

    // Check if transaction exists
    const transaction = await clearingHouseTransactionRepository.findById(transactionId);
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Create validation entry
    const validation = await clearingHouseTransactionRepository.createValidation({
      transactionId,
      validationType: data.validationType,
      validatorRole: data.validatorRole,
      validatorId: data.validatorId,
      validationData: data.validationData,
      evidenceHash: data.evidenceHash,
      digitalSignature: data.digitalSignature,
      decision: data.decision,
      reasoning: data.reasoning,
      conditions: data.conditions,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
    });

    // Update transaction approval count if validation is approved
    if (data.decision === 'APPROVE') {
      const updatedTransaction = await clearingHouseTransactionRepository.update(transactionId, {
        currentApprovals: transaction.currentApprovals + 1
      });

      // Check if we have enough approvals
      if (updatedTransaction.currentApprovals >= updatedTransaction.requiredApprovals) {
        await clearingHouseTransactionRepository.update(transactionId, {
          status: 'APPROVED'
        });

        // Create audit log for approval
        await clearingHouseTransactionRepository.createAuditLog({
          transactionId,
          eventType: 'TRANSACTION_COMPLETED',
          eventDescription: `Transaction approved with ${updatedTransaction.currentApprovals}/${updatedTransaction.requiredApprovals} validations`,
          actorUserId: data.validatorId,
          newState: { ...updatedTransaction, status: 'APPROVED' },
          metadata: { validationId: validation.id }
        });
      }
    } else if (data.decision === 'REJECT') {
      // Reject the entire transaction
      await clearingHouseTransactionRepository.update(transactionId, {
        status: 'REJECTED'
      });

      // Create audit log for rejection
      await clearingHouseTransactionRepository.createAuditLog({
        transactionId,
        eventType: 'TRANSACTION_FAILED',
        eventDescription: `Transaction rejected by validator: ${data.reasoning}`,
        actorUserId: data.validatorId,
        newState: { status: 'REJECTED', rejectionReason: data.reasoning },
        metadata: { validationId: validation.id }
      });
    }

    // Create validation audit log
    await clearingHouseTransactionRepository.createAuditLog({
      transactionId,
      eventType: 'VALIDATION_COMPLETED',
      eventDescription: `Validation completed by ${data.validatorRole} with decision: ${data.decision}`,
      actorUserId: data.validatorId,
      newState: validation,
      metadata: {
        validationId: validation.id,
        validationType: data.validationType,
        decision: data.decision
      }
    });

    return NextResponse.json(validation, { status: 201 });
  } catch (error) {
    console.error('Error creating validation:', error);
    return NextResponse.json(
      { error: 'Failed to create validation' },
      { status: 500 }
    );
  }
}
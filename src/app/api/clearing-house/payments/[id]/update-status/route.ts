import { NextRequest, NextResponse } from 'next/server';
import { clearingHouseTransactionRepository } from '@/lib/database/repositories';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const paymentId = params.id;

    // Get current payment
    const payment = await clearingHouseTransactionRepository.findPaymentById(paymentId);
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status
    const updatedPayment = await clearingHouseTransactionRepository.updatePayment(paymentId, {
      status: data.status,
      gatewayTransactionId: data.gatewayTransactionId,
      gatewayResponse: data.gatewayResponse,
      paymentHash: data.paymentHash,
      digitalSignature: data.digitalSignature,
      processedAt: data.status === 'PROCESSING' ? new Date() : payment.processedAt,
      settledAt: data.status === 'COMPLETED' ? new Date() : payment.settledAt
    });

    // Update transaction status based on payment status
    if (data.status === 'COMPLETED') {
      // Check if all payments for this transaction are completed
      const allPayments = await clearingHouseTransactionRepository.findPayments({
        where: { transactionId: payment.transactionId }
      });

      const allCompleted = allPayments.every(p =>
        p.id === paymentId ? data.status === 'COMPLETED' : p.status === 'COMPLETED'
      );

      if (allCompleted) {
        await clearingHouseTransactionRepository.update(payment.transactionId, {
          status: 'COMPLETED',
          completedAt: new Date()
        });

        // Create audit log for transaction completion
        await clearingHouseTransactionRepository.createAuditLog({
          transactionId: payment.transactionId,
          eventType: 'TRANSACTION_COMPLETED',
          eventDescription: 'Transaction completed - all payments settled',
          actorUserId: data.actorUserId,
          newState: { status: 'COMPLETED', completedAt: new Date() },
          metadata: {
            paymentId,
            finalPayment: true,
            totalPayments: allPayments.length
          }
        });
      }

      // Create audit log for payment completion
      await clearingHouseTransactionRepository.createAuditLog({
        transactionId: payment.transactionId,
        eventType: 'PAYMENT_COMPLETED',
        eventDescription: `Payment ${paymentId} completed via ${payment.paymentMethod}`,
        actorUserId: data.actorUserId,
        newState: updatedPayment,
        metadata: {
          paymentId,
          amount: payment.amount,
          currency: payment.currency,
          gatewayTransactionId: data.gatewayTransactionId
        }
      });

    } else if (data.status === 'FAILED') {
      // Update transaction status to failed if payment fails
      await clearingHouseTransactionRepository.update(payment.transactionId, {
        status: 'FAILED',
        errorDetails: {
          reason: 'Payment failed',
          paymentId,
          gatewayResponse: data.gatewayResponse
        }
      });

      // Create audit log for payment failure
      await clearingHouseTransactionRepository.createAuditLog({
        transactionId: payment.transactionId,
        eventType: 'TRANSACTION_FAILED',
        eventDescription: `Transaction failed due to payment failure: ${data.errorMessage || 'Unknown error'}`,
        actorUserId: data.actorUserId,
        newState: { status: 'FAILED' },
        errorDetails: data.gatewayResponse,
        metadata: {
          paymentId,
          failureReason: data.errorMessage
        }
      });
    }

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}
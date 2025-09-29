import { NextRequest, NextResponse } from 'next/server';
import { clearingHouseTransactionRepository } from '@/lib/database/repositories';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate transaction exists and is in correct state
    const transaction = await clearingHouseTransactionRepository.findById(data.transactionId);
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (!['APPROVED', 'EXECUTING'].includes(transaction.status)) {
      return NextResponse.json(
        { error: 'Transaction must be approved before payment can be initiated' },
        { status: 400 }
      );
    }

    // Create payment entry
    const payment = await clearingHouseTransactionRepository.createPayment({
      transactionId: data.transactionId,
      paymentType: data.paymentType,
      paymentMethod: data.paymentMethod,
      amount: parseFloat(data.amount),
      currency: data.currency,
      exchangeRate: data.exchangeRate ? parseFloat(data.exchangeRate) : null,
      payerUserId: data.payerUserId,
      payeeUserId: data.payeeUserId,
      paymentReference: data.paymentReference,
      processingFee: data.processingFee ? parseFloat(data.processingFee) : null,
      brokerageFee: data.brokerageFee ? parseFloat(data.brokerageFee) : null,
      networkFee: data.networkFee ? parseFloat(data.networkFee) : null,
      totalFees: data.totalFees ? parseFloat(data.totalFees) : null
    });

    // Update transaction status to executing
    await clearingHouseTransactionRepository.update(data.transactionId, {
      status: 'EXECUTING'
    });

    // Create audit log
    await clearingHouseTransactionRepository.createAuditLog({
      transactionId: data.transactionId,
      eventType: 'PAYMENT_INITIATED',
      eventDescription: `Payment of ${data.amount} ${data.currency} initiated via ${data.paymentMethod}`,
      actorUserId: data.payerUserId,
      newState: payment,
      metadata: {
        paymentId: payment.id,
        paymentMethod: data.paymentMethod,
        amount: data.amount,
        currency: data.currency
      }
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    const status = searchParams.get('status');
    const payerUserId = searchParams.get('payerUserId');
    const payeeUserId = searchParams.get('payeeUserId');

    const filters: any = {};
    if (transactionId) filters.transactionId = transactionId;
    if (status) filters.status = status;
    if (payerUserId) filters.payerUserId = payerUserId;
    if (payeeUserId) filters.payeeUserId = payeeUserId;

    const payments = await clearingHouseTransactionRepository.findPayments({
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
        payer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        payee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { requestedAt: 'desc' }
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
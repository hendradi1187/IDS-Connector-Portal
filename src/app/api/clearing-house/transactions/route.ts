import { NextRequest, NextResponse } from 'next/server';
import { clearingHouseTransactionRepository } from '@/lib/database/repositories';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const transactionType = searchParams.get('transactionType');
    const userId = searchParams.get('userId');

    const filters: any = {};
    if (status) filters.status = status;
    if (transactionType) filters.transactionType = transactionType;
    if (userId) {
      filters.OR = [
        { initiatorId: userId },
        { providerId: userId },
        { consumerId: userId }
      ];
    }

    const transactions = await clearingHouseTransactionRepository.findMany({
      where: filters,
      include: {
        initiator: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        consumer: { select: { id: true, name: true, email: true } },
        contract: { select: { id: true, title: true, status: true } },
        request: { select: { id: true, requestType: true, status: true } },
        resource: { select: { id: true, name: true, type: true } },
        validations: {
          include: {
            validator: { select: { id: true, name: true, email: true } }
          }
        },
        payments: true,
        negotiations: {
          include: {
            proposedBy: { select: { id: true, name: true, email: true } },
            responseBy: { select: { id: true, name: true, email: true } }
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { initiatedAt: 'desc' }
    });

    const total = await clearingHouseTransactionRepository.count({
      where: filters
    });

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching clearing house transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const transaction = await clearingHouseTransactionRepository.create({
      data: {
        transactionType: data.transactionType,
        initiatorId: data.initiatorId,
        providerId: data.providerId,
        consumerId: data.consumerId,
        contractId: data.contractId,
        requestId: data.requestId,
        resourceId: data.resourceId,
        transactionData: data.transactionData,
        contractTerms: data.contractTerms,
        totalAmount: data.totalAmount ? parseFloat(data.totalAmount) : null,
        currency: data.currency,
        billingModel: data.billingModel,
        requiredApprovals: data.requiredApprovals || 2,
        complianceLevel: data.complianceLevel || 'STANDARD',
        expectedCompletion: data.expectedCompletion ? new Date(data.expectedCompletion) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        metadata: data.metadata
      },
      include: {
        initiator: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        consumer: { select: { id: true, name: true, email: true } }
      }
    });

    // Create initial audit log
    await clearingHouseTransactionRepository.createAuditLog({
      transactionId: transaction.id,
      eventType: 'TRANSACTION_INITIATED',
      eventDescription: `Transaction ${transaction.id} initiated by ${transaction.initiator.name}`,
      actorUserId: data.initiatorId,
      newState: transaction,
      metadata: { source: 'api', userAgent: request.headers.get('user-agent') }
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating clearing house transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
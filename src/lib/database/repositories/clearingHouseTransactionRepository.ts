import prisma from '@/lib/database/prisma';



export const clearingHouseTransactionRepository = {
  // Transaction CRUD operations
  async create(data: any) {
    return await prisma.clearingHouseTransaction.create({
      data,
      include: {
        initiator: { select: { id: true, name: true, email: true, role: true } },
        provider: { select: { id: true, name: true, email: true, role: true } },
        consumer: { select: { id: true, name: true, email: true, role: true } },
        contract: true,
        request: true,
        resource: true
      }
    });
  },

  async findMany(options: any = {}) {
    return await prisma.clearingHouseTransaction.findMany(options);
  },

  async findById(id: string, options: any = {}) {
    return await prisma.clearingHouseTransaction.findUnique({
      where: { id },
      ...options
    });
  },

  async update(id: string, data: any) {
    return await prisma.clearingHouseTransaction.update({
      where: { id },
      data,
      include: {
        initiator: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        consumer: { select: { id: true, name: true, email: true } }
      }
    });
  },

  async delete(id: string) {
    return await prisma.clearingHouseTransaction.delete({
      where: { id }
    });
  },

  async count(options: any = {}) {
    return await prisma.clearingHouseTransaction.count(options);
  },

  // Validation operations
  async createValidation(data: any) {
    const validation = await prisma.transactionValidation.create({
      data: {
        ...data,
        status: 'PENDING',
        respondedAt: data.decision ? new Date() : null
      },
      include: {
        validator: { select: { id: true, name: true, email: true, role: true } },
        transaction: { select: { id: true, status: true, currentApprovals: true, requiredApprovals: true } }
      }
    });

    // If decision is provided, update the validation status
    if (data.decision) {
      return await prisma.transactionValidation.update({
        where: { id: validation.id },
        data: {
          status: data.decision === 'APPROVE' ? 'APPROVED' :
                 data.decision === 'REJECT' ? 'REJECTED' : 'CONDITIONAL',
          respondedAt: new Date()
        },
        include: {
          validator: { select: { id: true, name: true, email: true, role: true } },
          transaction: { select: { id: true, status: true, currentApprovals: true, requiredApprovals: true } }
        }
      });
    }

    return validation;
  },

  async findValidations(options: any = {}) {
    return await prisma.transactionValidation.findMany(options);
  },

  async updateValidation(id: string, data: any) {
    return await prisma.transactionValidation.update({
      where: { id },
      data
    });
  },

  // Negotiation operations
  async createNegotiation(data: any) {
    return await prisma.contractNegotiation.create({
      data,
      include: {
        transaction: { select: { id: true, status: true, transactionType: true } },
        contract: { select: { id: true, title: true, status: true } },
        proposedBy: { select: { id: true, name: true, email: true, role: true } }
      }
    });
  },

  async findNegotiations(options: any = {}) {
    return await prisma.contractNegotiation.findMany(options);
  },

  async findNegotiationById(id: string) {
    return await prisma.contractNegotiation.findUnique({
      where: { id },
      include: {
        transaction: true,
        contract: true,
        proposedBy: { select: { id: true, name: true, email: true } },
        responseBy: { select: { id: true, name: true, email: true } }
      }
    });
  },

  async updateNegotiation(id: string, data: any) {
    return await prisma.contractNegotiation.update({
      where: { id },
      data,
      include: {
        transaction: { select: { id: true, status: true } },
        proposedBy: { select: { id: true, name: true, email: true } },
        responseBy: { select: { id: true, name: true, email: true } }
      }
    });
  },

  // Payment operations
  async createPayment(data: any) {
    return await prisma.transactionPayment.create({
      data,
      include: {
        transaction: { select: { id: true, status: true, totalAmount: true, currency: true } },
        payer: { select: { id: true, name: true, email: true } },
        payee: { select: { id: true, name: true, email: true } }
      }
    });
  },

  async findPayments(options: any = {}) {
    return await prisma.transactionPayment.findMany(options);
  },

  async findPaymentById(id: string) {
    return await prisma.transactionPayment.findUnique({
      where: { id },
      include: {
        transaction: { select: { id: true, status: true } },
        payer: { select: { id: true, name: true, email: true } },
        payee: { select: { id: true, name: true, email: true } }
      }
    });
  },

  async updatePayment(id: string, data: any) {
    return await prisma.transactionPayment.update({
      where: { id },
      data,
      include: {
        transaction: { select: { id: true, status: true } },
        payer: { select: { id: true, name: true, email: true } },
        payee: { select: { id: true, name: true, email: true } }
      }
    });
  },

  // Audit log operations
  async createAuditLog(data: {
    transactionId: string;
    eventType: string;
    eventDescription: string;
    actorUserId?: string;
    actorRole?: string;
    actorIpAddress?: string;
    previousState?: any;
    newState?: any;
    changedFields?: string[];
    metadata?: any;
    errorDetails?: any;
  }) {
    // Generate integrity hash (simplified - in production use proper cryptographic hash)
    const hashData = `${data.transactionId}-${data.eventType}-${data.eventDescription}-${Date.now()}`;
    const integrityHash = Buffer.from(hashData).toString('base64');

    return await prisma.transactionAuditLog.create({
      data: {
        ...data,
        integrityHash,
        timestamp: new Date()
      }
    });
  },

  async findAuditLogs(options: any = {}) {
    return await prisma.transactionAuditLog.findMany(options);
  },

  // Dashboard and analytics
  async getTransactionStats(filters: any = {}) {
    const [
      totalTransactions,
      pendingTransactions,
      completedTransactions,
      failedTransactions,
      totalValue
    ] = await Promise.all([
      prisma.clearingHouseTransaction.count({ where: filters }),
      prisma.clearingHouseTransaction.count({
        where: { ...filters, status: { in: ['INITIATED', 'PENDING_VALIDATION', 'VALIDATING', 'NEGOTIATING', 'PENDING_APPROVAL'] } }
      }),
      prisma.clearingHouseTransaction.count({
        where: { ...filters, status: 'COMPLETED' }
      }),
      prisma.clearingHouseTransaction.count({
        where: { ...filters, status: { in: ['FAILED', 'REJECTED', 'CANCELLED'] } }
      }),
      prisma.clearingHouseTransaction.aggregate({
        where: { ...filters, status: 'COMPLETED' },
        _sum: { totalAmount: true }
      })
    ]);

    return {
      totalTransactions,
      pendingTransactions,
      completedTransactions,
      failedTransactions,
      totalValue: totalValue._sum.totalAmount || 0,
      successRate: totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0
    };
  },

  async getTransactionsByType(filters: any = {}) {
    return await prisma.clearingHouseTransaction.groupBy({
      by: ['transactionType'],
      where: filters,
      _count: { transactionType: true },
      _sum: { totalAmount: true }
    });
  },

  async getValidationStats(filters: any = {}) {
    return await prisma.transactionValidation.groupBy({
      by: ['status'],
      where: filters,
      _count: { status: true }
    });
  },

  async getPaymentStats(filters: any = {}) {
    return await prisma.transactionPayment.groupBy({
      by: ['status', 'paymentMethod'],
      where: filters,
      _count: { status: true },
      _sum: { amount: true }
    });
  },

  // Workflow helpers
  async getTransactionsRequiringValidation(validatorId: string) {
    return await prisma.clearingHouseTransaction.findMany({
      where: {
        status: { in: ['PENDING_VALIDATION', 'VALIDATING'] },
        currentApprovals: { lt: prisma.clearingHouseTransaction.fields.requiredApprovals }
      },
      include: {
        initiator: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        consumer: { select: { id: true, name: true, email: true } },
        validations: {
          where: { validatorId },
          select: { id: true, status: true, decision: true }
        }
      }
    });
  },

  async getActiveNegotiations(userId: string) {
    return await prisma.contractNegotiation.findMany({
      where: {
        status: { in: ['OPEN', 'COUNTER_OFFERED'] },
        OR: [
          { proposedByUserId: userId },
          { transaction: { OR: [{ providerId: userId }, { consumerId: userId }] } }
        ]
      },
      include: {
        transaction: {
          select: {
            id: true,
            transactionType: true,
            status: true,
            provider: { select: { id: true, name: true } },
            consumer: { select: { id: true, name: true } }
          }
        },
        proposedBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: { proposedAt: 'desc' }
    });
  }
};

export default clearingHouseTransactionRepository;
import { NextRequest, NextResponse } from 'next/server';
import { clearingHouseTransactionRepository } from '@/lib/database/repositories';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const negotiationId = params.id;

    // Get the negotiation
    const negotiation = await clearingHouseTransactionRepository.findNegotiationById(negotiationId);
    if (!negotiation) {
      return NextResponse.json(
        { error: 'Negotiation not found' },
        { status: 404 }
      );
    }

    // Update the negotiation with response
    const updatedNegotiation = await clearingHouseTransactionRepository.updateNegotiation(negotiationId, {
      responseByUserId: data.responseByUserId,
      responseType: data.responseType,
      responseNotes: data.responseNotes,
      counterOffer: data.counterOffer,
      status: data.responseType === 'ACCEPT' ? 'ACCEPTED' :
              data.responseType === 'REJECT' ? 'REJECTED' :
              data.responseType === 'COUNTER' ? 'COUNTER_OFFERED' : 'OPEN',
      respondedAt: new Date()
    });

    // Handle different response types
    if (data.responseType === 'ACCEPT') {
      // Update transaction status
      await clearingHouseTransactionRepository.update(negotiation.transactionId, {
        status: 'PENDING_APPROVAL',
        contractTerms: negotiation.proposedTerms
      });

      // Create audit log for acceptance
      await clearingHouseTransactionRepository.createAuditLog({
        transactionId: negotiation.transactionId,
        eventType: 'PROPOSAL_RESPONDED',
        eventDescription: `Proposal accepted by ${data.responseByUserId}`,
        actorUserId: data.responseByUserId,
        newState: updatedNegotiation,
        metadata: {
          negotiationId,
          responseType: data.responseType,
          round: negotiation.round
        }
      });

    } else if (data.responseType === 'REJECT') {
      // Update negotiation status
      await clearingHouseTransactionRepository.updateNegotiation(negotiationId, {
        status: 'REJECTED'
      });

      // Create audit log for rejection
      await clearingHouseTransactionRepository.createAuditLog({
        transactionId: negotiation.transactionId,
        eventType: 'PROPOSAL_RESPONDED',
        eventDescription: `Proposal rejected: ${data.responseNotes}`,
        actorUserId: data.responseByUserId,
        newState: { ...updatedNegotiation, status: 'REJECTED' },
        metadata: {
          negotiationId,
          responseType: data.responseType,
          rejectionReason: data.responseNotes
        }
      });

    } else if (data.responseType === 'COUNTER') {
      // Create a new counter-proposal negotiation
      const counterNegotiation = await clearingHouseTransactionRepository.createNegotiation({
        transactionId: negotiation.transactionId,
        contractId: negotiation.contractId,
        round: negotiation.round + 1,
        proposedByUserId: data.responseByUserId,
        proposalType: 'COUNTER_OFFER',
        proposedTerms: data.counterOffer,
        previousTerms: negotiation.proposedTerms,
        changes: data.changes || {},
        proposedPrice: data.counterPrice ? parseFloat(data.counterPrice) : null,
        paymentTerms: data.counterPaymentTerms,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        autoAccept: false
      });

      // Create audit log for counter-offer
      await clearingHouseTransactionRepository.createAuditLog({
        transactionId: negotiation.transactionId,
        eventType: 'PROPOSAL_SUBMITTED',
        eventDescription: `Counter-offer submitted (Round ${counterNegotiation.round})`,
        actorUserId: data.responseByUserId,
        newState: counterNegotiation,
        metadata: {
          originalNegotiationId: negotiationId,
          newNegotiationId: counterNegotiation.id,
          round: counterNegotiation.round
        }
      });

      return NextResponse.json(counterNegotiation);
    }

    return NextResponse.json(updatedNegotiation);
  } catch (error) {
    console.error('Error responding to negotiation:', error);
    return NextResponse.json(
      { error: 'Failed to respond to negotiation' },
      { status: 500 }
    );
  }
}
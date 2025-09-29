'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, FileText, MessageSquare, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface NegotiationDialogProps {
  transaction: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNegotiationSubmitted?: () => void;
}

const proposalTypes = [
  { value: 'INITIAL_OFFER', label: 'Initial Offer' },
  { value: 'COUNTER_OFFER', label: 'Counter Offer' },
  { value: 'REVISED_TERMS', label: 'Revised Terms' },
  { value: 'FINAL_OFFER', label: 'Final Offer' },
  { value: 'AMENDMENT', label: 'Amendment' }
];

export default function NegotiationDialog({
  transaction,
  open,
  onOpenChange,
  onNegotiationSubmitted
}: NegotiationDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [validUntil, setValidUntil] = useState<Date>();

  const [formData, setFormData] = useState({
    proposalType: 'INITIAL_OFFER',
    proposedByUserId: '', // In real app, get from auth context
    proposedPrice: '',
    paymentTerms: '',
    contractTerms: '',
    deliveryTerms: '',
    dataUsageRights: '',
    securityRequirements: '',
    complianceTerms: '',
    slaTerms: '',
    penaltyClause: '',
    autoAccept: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.contractTerms) {
      toast({
        title: "Validation Error",
        description: "Please specify the proposed contract terms",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Structure the proposed terms
      const proposedTerms = {
        contractTerms: formData.contractTerms,
        deliveryTerms: formData.deliveryTerms,
        dataUsageRights: formData.dataUsageRights,
        securityRequirements: formData.securityRequirements,
        complianceTerms: formData.complianceTerms,
        slaTerms: formData.slaTerms,
        penaltyClause: formData.penaltyClause,
        proposedAt: new Date().toISOString()
      };

      const paymentTerms = formData.paymentTerms ? {
        description: formData.paymentTerms,
        proposedPrice: formData.proposedPrice ? parseFloat(formData.proposedPrice) : null,
        currency: transaction.currency || 'USD'
      } : null;

      // Determine changes from previous terms
      const changes = {
        priceChanged: formData.proposedPrice && parseFloat(formData.proposedPrice) !== transaction.totalAmount,
        termsModified: true,
        paymentTermsChanged: !!formData.paymentTerms,
        timestamp: new Date().toISOString()
      };

      const payload = {
        transactionId: transaction.id,
        contractId: transaction.contractId,
        proposedByUserId: formData.proposedByUserId || 'current-user-id', // Replace with actual user ID
        proposalType: formData.proposalType,
        proposedTerms,
        previousTerms: transaction.contractTerms || {},
        changes,
        proposedPrice: formData.proposedPrice ? parseFloat(formData.proposedPrice) : null,
        paymentTerms,
        validUntil: validUntil ? validUntil.toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days default
        autoAccept: formData.autoAccept
      };

      const response = await fetch('/api/clearing-house/negotiations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: "Proposal Submitted",
          description: `${formData.proposalType.replace('_', ' ').toLowerCase()} has been submitted for negotiation`,
        });

        // Reset form
        setFormData({
          proposalType: 'INITIAL_OFFER',
          proposedByUserId: '',
          proposedPrice: '',
          paymentTerms: '',
          contractTerms: '',
          deliveryTerms: '',
          dataUsageRights: '',
          securityRequirements: '',
          complianceTerms: '',
          slaTerms: '',
          penaltyClause: '',
          autoAccept: false
        });
        setValidUntil(undefined);

        onOpenChange(false);
        onNegotiationSubmitted?.();
      } else {
        throw new Error('Failed to submit negotiation');
      }
    } catch (error) {
      console.error('Error submitting negotiation:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit contract negotiation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Negotiation
          </DialogTitle>
          <DialogDescription>
            Submit a proposal for transaction {transaction.id.slice(0, 8)}...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction Context */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Current Transaction Terms</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-2">{transaction.transactionType.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline" className="ml-2">
                  {transaction.status.replace(/_/g, ' ')}
                </Badge>
              </div>
              {transaction.totalAmount && (
                <>
                  <div>
                    <span className="text-muted-foreground">Current Amount:</span>
                    <span className="ml-2">{transaction.currency} {transaction.totalAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Billing Model:</span>
                    <span className="ml-2">{transaction.billingModel?.replace(/_/g, ' ') || 'Not specified'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Proposal Type & Validity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proposalType">Proposal Type</Label>
                <Select
                  value={formData.proposalType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, proposalType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {proposalTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !validUntil && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {validUntil ? format(validUntil, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={validUntil}
                      onSelect={setValidUntil}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Financial Terms */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Terms
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proposedPrice">Proposed Price</Label>
                  <Input
                    id="proposedPrice"
                    type="number"
                    step="0.01"
                    value={formData.proposedPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, proposedPrice: e.target.value }))}
                    placeholder={`Current: ${transaction.totalAmount || 0}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    placeholder="e.g., Net 30, Upfront, Milestone-based"
                  />
                </div>
              </div>
            </div>

            {/* Contract Terms */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Contract Terms
              </h4>

              <div className="space-y-2">
                <Label htmlFor="contractTerms">Main Contract Terms *</Label>
                <Textarea
                  id="contractTerms"
                  value={formData.contractTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, contractTerms: e.target.value }))}
                  placeholder="Specify the main terms and conditions for this transaction..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryTerms">Delivery Terms</Label>
                  <Textarea
                    id="deliveryTerms"
                    value={formData.deliveryTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryTerms: e.target.value }))}
                    placeholder="Delivery method, timeline, and requirements..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataUsageRights">Data Usage Rights</Label>
                  <Textarea
                    id="dataUsageRights"
                    value={formData.dataUsageRights}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataUsageRights: e.target.value }))}
                    placeholder="Permitted uses, restrictions, sharing rights..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="securityRequirements">Security Requirements</Label>
                  <Textarea
                    id="securityRequirements"
                    value={formData.securityRequirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, securityRequirements: e.target.value }))}
                    placeholder="Encryption, access controls, audit requirements..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complianceTerms">Compliance Terms</Label>
                  <Textarea
                    id="complianceTerms"
                    value={formData.complianceTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, complianceTerms: e.target.value }))}
                    placeholder="Regulatory compliance, standards, certifications..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slaTerms">SLA Terms</Label>
                  <Textarea
                    id="slaTerms"
                    value={formData.slaTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, slaTerms: e.target.value }))}
                    placeholder="Service level agreements, uptime, response times..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="penaltyClause">Penalty Clause</Label>
                  <Textarea
                    id="penaltyClause"
                    value={formData.penaltyClause}
                    onChange={(e) => setFormData(prev => ({ ...prev, penaltyClause: e.target.value }))}
                    placeholder="Penalties for non-compliance or breach..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Proposal'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
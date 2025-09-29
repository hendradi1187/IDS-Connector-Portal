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
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ValidationDialogProps {
  transaction: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onValidationCompleted?: () => void;
}

const validationMethods = [
  { value: 'MANUAL_REVIEW', label: 'Manual Review' },
  { value: 'AUTOMATED_CHECK', label: 'Automated Check' },
  { value: 'DIGITAL_SIGNATURE', label: 'Digital Signature' },
  { value: 'MULTI_PARTY_CONSENSUS', label: 'Multi-Party Consensus' },
  { value: 'BLOCKCHAIN_VERIFICATION', label: 'Blockchain Verification' },
  { value: 'PKI_CERTIFICATE', label: 'PKI Certificate' },
  { value: 'BIOMETRIC_VERIFICATION', label: 'Biometric Verification' }
];

const validatorRoles = [
  { value: 'PROVIDER', label: 'Provider' },
  { value: 'CONSUMER', label: 'Consumer' },
  { value: 'BROKER', label: 'Broker' },
  { value: 'REGULATOR', label: 'Regulator' },
  { value: 'AUDITOR', label: 'Auditor' },
  { value: 'SYSTEM', label: 'System' }
];

const validationDecisions = [
  {
    value: 'APPROVE',
    label: 'Approve',
    icon: <CheckCircle className="h-4 w-4" />,
    description: 'Transaction meets all requirements'
  },
  {
    value: 'REJECT',
    label: 'Reject',
    icon: <XCircle className="h-4 w-4" />,
    description: 'Transaction does not meet requirements'
  },
  {
    value: 'CONDITIONAL_APPROVE',
    label: 'Conditional Approve',
    icon: <AlertTriangle className="h-4 w-4" />,
    description: 'Approve with conditions'
  },
  {
    value: 'REQUEST_MORE_INFO',
    label: 'Request More Info',
    icon: <AlertTriangle className="h-4 w-4" />,
    description: 'Need additional information'
  },
  {
    value: 'ESCALATE',
    label: 'Escalate',
    icon: <AlertTriangle className="h-4 w-4" />,
    description: 'Escalate to higher authority'
  }
];

export default function ValidationDialog({
  transaction,
  open,
  onOpenChange,
  onValidationCompleted
}: ValidationDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    validationType: '',
    validatorRole: '',
    validatorId: '', // In real app, get from auth context
    decision: '',
    reasoning: '',
    conditions: '',
    evidenceHash: '',
    digitalSignature: '',
    score: '',
    confidence: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.validationType || !formData.validatorRole || !formData.decision) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const validationData = {
        method: formData.validationType,
        score: formData.score ? parseInt(formData.score) : null,
        confidence: formData.confidence ? parseFloat(formData.confidence) : null,
        evidenceProvided: !!formData.evidenceHash,
        timestamp: new Date().toISOString()
      };

      const payload = {
        validationType: formData.validationType,
        validatorRole: formData.validatorRole,
        validatorId: formData.validatorId || 'current-user-id', // Replace with actual user ID
        validationData,
        evidenceHash: formData.evidenceHash || null,
        digitalSignature: formData.digitalSignature || null,
        decision: formData.decision,
        reasoning: formData.reasoning,
        conditions: formData.conditions ? JSON.parse(`{"conditions": "${formData.conditions}"}`) : null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      };

      const response = await fetch(`/api/clearing-house/transactions/${transaction.id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: "Validation Submitted",
          description: `Transaction validation completed with decision: ${formData.decision}`,
        });

        // Reset form
        setFormData({
          validationType: '',
          validatorRole: '',
          validatorId: '',
          decision: '',
          reasoning: '',
          conditions: '',
          evidenceHash: '',
          digitalSignature: '',
          score: '',
          confidence: ''
        });

        onOpenChange(false);
        onValidationCompleted?.();
      } else {
        throw new Error('Failed to submit validation');
      }
    } catch (error) {
      console.error('Error submitting validation:', error);
      toast({
        title: "Validation Failed",
        description: "Failed to submit transaction validation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Validate Transaction
          </DialogTitle>
          <DialogDescription>
            Validate transaction {transaction.id.slice(0, 8)}... for approval
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Transaction Summary</h4>
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
              <div>
                <span className="text-muted-foreground">Approvals:</span>
                <span className="ml-2">{transaction.currentApprovals}/{transaction.requiredApprovals}</span>
              </div>
              {transaction.totalAmount && (
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="ml-2">{transaction.currency} {transaction.totalAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Validation Method */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validationType">Validation Method *</Label>
                <Select
                  value={formData.validationType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, validationType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select validation method" />
                  </SelectTrigger>
                  <SelectContent>
                    {validationMethods.map(method => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validatorRole">Validator Role *</Label>
                <Select
                  value={formData.validatorRole}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, validatorRole: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {validatorRoles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Validation Decision */}
            <div className="space-y-2">
              <Label htmlFor="decision">Validation Decision *</Label>
              <Select
                value={formData.decision}
                onValueChange={(value) => setFormData(prev => ({ ...prev, decision: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select validation decision" />
                </SelectTrigger>
                <SelectContent>
                  {validationDecisions.map(decision => (
                    <SelectItem key={decision.value} value={decision.value}>
                      <div className="flex items-center gap-2">
                        {decision.icon}
                        <div>
                          <div className="font-medium">{decision.label}</div>
                          <div className="text-xs text-muted-foreground">{decision.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reasoning */}
            <div className="space-y-2">
              <Label htmlFor="reasoning">Reasoning *</Label>
              <Textarea
                id="reasoning"
                value={formData.reasoning}
                onChange={(e) => setFormData(prev => ({ ...prev, reasoning: e.target.value }))}
                placeholder="Explain the rationale behind your validation decision..."
                rows={3}
                required
              />
            </div>

            {/* Conditions (if conditional approval) */}
            {formData.decision === 'CONDITIONAL_APPROVE' && (
              <div className="space-y-2">
                <Label htmlFor="conditions">Conditions for Approval</Label>
                <Textarea
                  id="conditions"
                  value={formData.conditions}
                  onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                  placeholder="Specify the conditions that must be met..."
                  rows={2}
                />
              </div>
            )}

            {/* Validation Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="score">Validation Score (0-100)</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score}
                  onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value }))}
                  placeholder="Assessment score"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidence">Confidence Level (0.0-1.0)</Label>
                <Input
                  id="confidence"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.confidence}
                  onChange={(e) => setFormData(prev => ({ ...prev, confidence: e.target.value }))}
                  placeholder="Confidence level"
                />
              </div>
            </div>

            {/* Evidence */}
            <div className="space-y-4">
              <h4 className="font-medium">Evidence & Security</h4>

              <div className="space-y-2">
                <Label htmlFor="evidenceHash">Evidence Hash (Optional)</Label>
                <Input
                  id="evidenceHash"
                  value={formData.evidenceHash}
                  onChange={(e) => setFormData(prev => ({ ...prev, evidenceHash: e.target.value }))}
                  placeholder="SHA-256 hash of supporting evidence"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="digitalSignature">Digital Signature (Optional)</Label>
                <Textarea
                  id="digitalSignature"
                  value={formData.digitalSignature}
                  onChange={(e) => setFormData(prev => ({ ...prev, digitalSignature: e.target.value }))}
                  placeholder="Digital signature for validation authenticity"
                  rows={2}
                />
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
                {loading ? 'Submitting...' : 'Submit Validation'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
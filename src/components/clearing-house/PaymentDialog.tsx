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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Shield, DollarSign, AlertCircle } from 'lucide-react';

interface PaymentDialogProps {
  transaction: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentProcessed?: () => void;
}

const paymentTypes = [
  { value: 'UPFRONT', label: 'Upfront Payment', description: 'Full payment before service delivery' },
  { value: 'MILESTONE', label: 'Milestone Payment', description: 'Payment upon reaching milestones' },
  { value: 'COMPLETION', label: 'Completion Payment', description: 'Payment upon full completion' },
  { value: 'RECURRING', label: 'Recurring Payment', description: 'Regular subscription payments' },
  { value: 'ESCROW', label: 'Escrow Payment', description: 'Payment held in escrow until completion' },
  { value: 'REFUND', label: 'Refund', description: 'Refund of previous payment' }
];

const paymentMethods = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: '🏦' },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: '💳' },
  { value: 'DIGITAL_WALLET', label: 'Digital Wallet', icon: '📱' },
  { value: 'CRYPTOCURRENCY', label: 'Cryptocurrency', icon: '₿' },
  { value: 'INVOICE', label: 'Invoice', icon: '📄' },
  { value: 'ESCROW_SERVICE', label: 'Escrow Service', icon: '🔒' },
  { value: 'BARTER_EXCHANGE', label: 'Barter Exchange', icon: '🔄' }
];

export default function PaymentDialog({
  transaction,
  open,
  onOpenChange,
  onPaymentProcessed
}: PaymentDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    paymentType: '',
    paymentMethod: '',
    amount: transaction?.totalAmount?.toString() || '',
    currency: transaction?.currency || 'USD',
    exchangeRate: '',
    payerUserId: '', // In real app, get from auth context
    payeeUserId: '',
    paymentReference: '',
    processingFee: '',
    brokerageFee: '',
    networkFee: '',
    agreedToTerms: false,
    confirmPayment: false
  });

  const calculateTotalFees = () => {
    const processing = parseFloat(formData.processingFee) || 0;
    const brokerage = parseFloat(formData.brokerageFee) || 0;
    const network = parseFloat(formData.networkFee) || 0;
    return processing + brokerage + network;
  };

  const calculateTotalAmount = () => {
    const amount = parseFloat(formData.amount) || 0;
    const fees = calculateTotalFees();
    return amount + fees;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.paymentType || !formData.paymentMethod || !formData.amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required payment fields",
        variant: "destructive"
      });
      return;
    }

    if (!formData.agreedToTerms || !formData.confirmPayment) {
      toast({
        title: "Confirmation Required",
        description: "Please agree to terms and confirm the payment",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const totalFees = calculateTotalFees();

      const payload = {
        transactionId: transaction.id,
        paymentType: formData.paymentType,
        paymentMethod: formData.paymentMethod,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        exchangeRate: formData.exchangeRate ? parseFloat(formData.exchangeRate) : null,
        payerUserId: formData.payerUserId || 'current-user-id', // Replace with actual user ID
        payeeUserId: formData.payeeUserId || transaction.providerId, // Default to provider
        paymentReference: formData.paymentReference,
        processingFee: formData.processingFee ? parseFloat(formData.processingFee) : null,
        brokerageFee: formData.brokerageFee ? parseFloat(formData.brokerageFee) : null,
        networkFee: formData.networkFee ? parseFloat(formData.networkFee) : null,
        totalFees: totalFees > 0 ? totalFees : null
      };

      const response = await fetch('/api/clearing-house/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const payment = await response.json();

        toast({
          title: "Payment Initiated",
          description: `Payment of ${formData.currency} ${formData.amount} has been initiated via ${formData.paymentMethod.replace('_', ' ')}`,
        });

        // Reset form
        setFormData({
          paymentType: '',
          paymentMethod: '',
          amount: transaction?.totalAmount?.toString() || '',
          currency: transaction?.currency || 'USD',
          exchangeRate: '',
          payerUserId: '',
          payeeUserId: '',
          paymentReference: '',
          processingFee: '',
          brokerageFee: '',
          networkFee: '',
          agreedToTerms: false,
          confirmPayment: false
        });

        onOpenChange(false);
        onPaymentProcessed?.();
      } else {
        throw new Error('Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to initiate payment processing",
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
            <CreditCard className="h-5 w-5" />
            Process Payment
          </DialogTitle>
          <DialogDescription>
            Initiate payment for transaction {transaction.id.slice(0, 8)}...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="ml-2">{transaction.provider.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Consumer:</span>
                  <span className="ml-2">{transaction.consumer.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Type & Method */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentType">Payment Type *</Label>
                <Select
                  value={formData.paymentType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, paymentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center gap-2">
                          <span>{method.icon}</span>
                          {method.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amount & Currency */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="IDR">IDR</SelectItem>
                    <SelectItem value="SGD">SGD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exchangeRate">Exchange Rate</Label>
                <Input
                  id="exchangeRate"
                  type="number"
                  step="0.000001"
                  value={formData.exchangeRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, exchangeRate: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Payment Reference */}
            <div className="space-y-2">
              <Label htmlFor="paymentReference">Payment Reference</Label>
              <Input
                id="paymentReference"
                value={formData.paymentReference}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentReference: e.target.value }))}
                placeholder="Invoice number, PO number, etc."
              />
            </div>

            {/* Fees Breakdown */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Fee Breakdown
              </h4>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="processingFee">Processing Fee</Label>
                  <Input
                    id="processingFee"
                    type="number"
                    step="0.01"
                    value={formData.processingFee}
                    onChange={(e) => setFormData(prev => ({ ...prev, processingFee: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brokerageFee">Brokerage Fee</Label>
                  <Input
                    id="brokerageFee"
                    type="number"
                    step="0.01"
                    value={formData.brokerageFee}
                    onChange={(e) => setFormData(prev => ({ ...prev, brokerageFee: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="networkFee">Network Fee</Label>
                  <Input
                    id="networkFee"
                    type="number"
                    step="0.01"
                    value={formData.networkFee}
                    onChange={(e) => setFormData(prev => ({ ...prev, networkFee: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Total Calculation */}
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Payment Amount:</span>
                      <span>{formData.currency} {parseFloat(formData.amount || '0').toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Fees:</span>
                      <span>{formData.currency} {calculateTotalFees().toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total Amount:</span>
                        <span>{formData.currency} {calculateTotalAmount().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Confirmations */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Confirmations
              </h4>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreedToTerms: checked as boolean }))}
                  />
                  <Label htmlFor="agreedToTerms" className="text-sm">
                    I agree to the payment terms and conditions
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="confirmPayment"
                    checked={formData.confirmPayment}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, confirmPayment: checked as boolean }))}
                  />
                  <Label htmlFor="confirmPayment" className="text-sm">
                    I confirm this payment authorization
                  </Label>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Important Notice</p>
                    <p>This payment will be processed immediately. Please verify all details before confirming.</p>
                  </div>
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
              <Button
                type="submit"
                disabled={loading || !formData.agreedToTerms || !formData.confirmPayment}
              >
                {loading ? 'Processing...' : `Process Payment (${formData.currency} ${calculateTotalAmount().toLocaleString()})`}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, FileText, Users, CreditCard, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmissionCreated?: () => void;
}

const submissionTypes = [
  { value: 'SEISMIC_DATA', label: 'Seismic Data', icon: <FileText className="h-4 w-4" /> },
  { value: 'WELL_LOG_DATA', label: 'Well Log Data', icon: <FileText className="h-4 w-4" /> },
  { value: 'PRODUCTION_DATA', label: 'Production Data', icon: <Users className="h-4 w-4" /> },
  { value: 'FINANCIAL_REPORT', label: 'Financial Report', icon: <CreditCard className="h-4 w-4" /> },
  { value: 'ENVIRONMENTAL_REPORT', label: 'Environmental Report', icon: <Shield className="h-4 w-4" /> },
  { value: 'SAFETY_REPORT', label: 'Safety Report', icon: <Shield className="h-4 w-4" /> },
  { value: 'DRILLING_REPORT', label: 'Drilling Report', icon: <FileText className="h-4 w-4" /> },
  { value: 'COMPLETION_REPORT', label: 'Completion Report', icon: <FileText className="h-4 w-4" /> }
];

const priorities = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'CRITICAL', label: 'Critical' }
];

const complianceStandards = [
  { value: 'SKK_MIGAS_STANDARD', label: 'SKK Migas Standard' },
  { value: 'API_STANDARD', label: 'API Standard' },
  { value: 'ISO_STANDARD', label: 'ISO Standard' },
  { value: 'COMPANY_INTERNAL', label: 'Company Internal' },
  { value: 'REGULATORY_REQUIRED', label: 'Regulatory Required' }
];

const reportingPeriods = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUALLY', label: 'Annually' },
  { value: 'AD_HOC', label: 'Ad Hoc' }
];

export default function CreateSubmissionDialog({
  open,
  onOpenChange,
  onSubmissionCreated
}: CreateSubmissionDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dueDate, setDueDate] = useState<Date>();
  const [reportingPeriodStart, setReportingPeriodStart] = useState<Date>();
  const [reportingPeriodEnd, setReportingPeriodEnd] = useState<Date>();

  const [formData, setFormData] = useState({
    submissionType: '',
    priority: 'NORMAL',
    submitterId: '', // KKKS ID - In real app, get from auth context
    receiverId: '', // SKK Migas ID
    contractorWorkArea: '',
    reportingPeriod: '',
    complianceStandard: 'SKK_MIGAS_STANDARD',
    requiredValidations: '2',
    submissionDescription: '',
    documentFormat: 'PDF',
    dataFormat: 'JSON',
    metadata: '{}'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.submissionType || !formData.submitterId || !formData.receiverId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const submissionData = {
        description: formData.submissionDescription,
        documentFormat: formData.documentFormat,
        dataFormat: formData.dataFormat,
        metadata: JSON.parse(formData.metadata || '{}')
      };

      const payload = {
        submissionType: formData.submissionType,
        priority: formData.priority,
        submitterId: formData.submitterId,
        receiverId: formData.receiverId,
        contractorWorkArea: formData.contractorWorkArea,
        reportingPeriod: formData.reportingPeriod,
        complianceStandard: formData.complianceStandard,
        requiredValidations: parseInt(formData.requiredValidations),
        dueDate: dueDate?.toISOString(),
        reportingPeriodStart: reportingPeriodStart?.toISOString(),
        reportingPeriodEnd: reportingPeriodEnd?.toISOString(),
        submissionData,
        metadata: JSON.parse(formData.metadata || '{}')
      };

      const response = await fetch('/api/regulatory-data/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: "Submission Created",
          description: "Regulatory data submission has been initiated successfully",
        });

        // Reset form
        setFormData({
          submissionType: '',
          priority: 'NORMAL',
          submitterId: '',
          receiverId: '',
          contractorWorkArea: '',
          reportingPeriod: '',
          complianceStandard: 'SKK_MIGAS_STANDARD',
          requiredValidations: '2',
          submissionDescription: '',
          documentFormat: 'PDF',
          dataFormat: 'JSON',
          metadata: '{}'
        });
        setDueDate(undefined);
        setReportingPeriodStart(undefined);
        setReportingPeriodEnd(undefined);

        onOpenChange(false);
        onSubmissionCreated?.();
      } else {
        throw new Error('Failed to create transaction');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create regulatory data submission",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Regulatory Data Submission</DialogTitle>
          <DialogDescription>
            Submit regulatory data from KKKS to SKK Migas for compliance validation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Submission Basics */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Submission Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submissionType">Data Type *</Label>
                <Select
                  value={formData.submissionType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, submissionType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    {submissionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Submission Description</Label>
              <Textarea
                id="description"
                value={formData.submissionDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, submissionDescription: e.target.value }))}
                placeholder="Describe the regulatory data being submitted..."
                rows={3}
              />
            </div>
          </div>

          {/* Parties */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Submission Parties</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submitterId">KKKS Submitter ID *</Label>
                <Input
                  id="submitterId"
                  value={formData.submitterId}
                  onChange={(e) => setFormData(prev => ({ ...prev, submitterId: e.target.value }))}
                  placeholder="UUID of KKKS contractor"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiverId">SKK Migas Receiver ID *</Label>
                <Input
                  id="receiverId"
                  value={formData.receiverId}
                  onChange={(e) => setFormData(prev => ({ ...prev, receiverId: e.target.value }))}
                  placeholder="UUID of SKK Migas regulator"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractorWorkArea">Contractor Work Area</Label>
                <Input
                  id="contractorWorkArea"
                  value={formData.contractorWorkArea}
                  onChange={(e) => setFormData(prev => ({ ...prev, contractorWorkArea: e.target.value }))}
                  placeholder="Work area/field name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportingPeriod">Reporting Period</Label>
                <Select
                  value={formData.reportingPeriod}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, reportingPeriod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reporting period" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportingPeriods.map(period => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Data Format & Standards */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Data Format & Standards</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentFormat">Document Format</Label>
                <Select
                  value={formData.documentFormat}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, documentFormat: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="DOCX">DOCX</SelectItem>
                    <SelectItem value="XLS">XLS</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFormat">Data Format</Label>
                <Select
                  value={formData.dataFormat}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, dataFormat: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JSON">JSON</SelectItem>
                    <SelectItem value="XML">XML</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                    <SelectItem value="BINARY">Binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complianceStandard">Compliance Standard</Label>
                <Select
                  value={formData.complianceStandard}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, complianceStandard: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {complianceStandards.map(standard => (
                      <SelectItem key={standard.value} value={standard.value}>
                        {standard.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Validation Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Validation Requirements</h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requiredValidations">Required Validations</Label>
                <Input
                  id="requiredValidations"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.requiredValidations}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiredValidations: e.target.value }))}
                  placeholder="Number of required validation approvals"
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Timeline</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Pick due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Reporting Period Start</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !reportingPeriodStart && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {reportingPeriodStart ? format(reportingPeriodStart, "PPP") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={reportingPeriodStart}
                      onSelect={setReportingPeriodStart}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Reporting Period End</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !reportingPeriodEnd && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {reportingPeriodEnd ? format(reportingPeriodEnd, "PPP") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={reportingPeriodEnd}
                      onSelect={setReportingPeriodEnd}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
              {loading ? 'Creating...' : 'Create Submission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
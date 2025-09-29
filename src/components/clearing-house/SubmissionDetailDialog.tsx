'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Users,
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface SubmissionDetailDialogProps {
  submission: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmissionUpdated?: () => void;
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  SUBMITTED: 'outline',
  UNDER_REVIEW: 'secondary',
  PENDING_VALIDATION: 'secondary',
  VALIDATING: 'default',
  APPROVED: 'default',
  REJECTED: 'destructive',
  REVISION_REQUIRED: 'destructive',
  ACKNOWLEDGED: 'default',
  ARCHIVED: 'secondary',
  OVERDUE: 'destructive',
  CANCELLED: 'destructive'
};

export default function SubmissionDetailDialog({
  submission,
  open,
  onOpenChange,
  onSubmissionUpdated
}: SubmissionDetailDialogProps) {
  if (!submission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submission Details
            <Badge variant={statusVariants[submission.status]}>
              {submission.status.replace(/_/g, ' ')}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Submission ID: {submission.id}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="parties">Parties</TabsTrigger>
            <TabsTrigger value="validations">Compliance</TabsTrigger>
            <TabsTrigger value="obligations">Obligations</TabsTrigger>
            <TabsTrigger value="acknowledgements">Acknowledgements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Submission Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Data Type:</span>
                    <span className="text-sm font-medium">
                      {submission.submissionType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Priority:</span>
                    <Badge variant="outline">{submission.priority}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Submitted:</span>
                    <span className="text-sm">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </span>
                  </div>
                  {submission.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Due Date:</span>
                      <span className="text-sm">
                        {new Date(submission.dueDate).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {submission.contractorWorkArea && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Work Area:</span>
                      <span className="text-sm">{submission.contractorWorkArea}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Reporting Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {submission.reportingPeriod && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Reporting Period:</span>
                      <span className="text-sm">{submission.reportingPeriod}</span>
                    </div>
                  )}
                  {submission.reportingPeriodStart && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Period Start:</span>
                      <span className="text-sm">
                        {new Date(submission.reportingPeriodStart).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {submission.reportingPeriodEnd && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Period End:</span>
                      <span className="text-sm">
                        {new Date(submission.reportingPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {!submission.reportingPeriod && !submission.reportingPeriodStart && (
                    <p className="text-sm text-muted-foreground">No reporting period specified</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Validation Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Validations</span>
                        <span>{submission.currentValidations}/{submission.requiredValidations}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(submission.currentValidations / submission.requiredValidations) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    {submission.currentValidations >= submission.requiredValidations ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Compliance Standard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {submission.complianceStandard && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Standard:</span>
                      <Badge variant="outline">{submission.complianceStandard.replace(/_/g, ' ')}</Badge>
                    </div>
                  )}
                  {submission.documentFormat && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Document Format:</span>
                      <span className="text-sm">{submission.documentFormat}</span>
                    </div>
                  )}
                  {submission.dataFormat && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Data Format:</span>
                      <span className="text-sm">{submission.dataFormat}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {submission.submissionData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Submission Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(submission.submissionData, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="parties" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    KKKS Submitter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{submission.submitter.name}</p>
                    <p className="text-sm text-muted-foreground">{submission.submitter.email}</p>
                    <Badge variant="outline">KKKS Contractor</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    SKK Migas Receiver
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{submission.receiver.name}</p>
                    <p className="text-sm text-muted-foreground">{submission.receiver.email}</p>
                    <Badge variant="outline">SKK Migas Regulator</Badge>
                  </div>
                </CardContent>
              </Card>

              {submission.reviewer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Assigned Reviewer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{submission.reviewer.name}</p>
                      <p className="text-sm text-muted-foreground">{submission.reviewer.email}</p>
                      <Badge variant="outline">Reviewer</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="validations" className="space-y-4">
            {submission.validations && submission.validations.length > 0 ? (
              <div className="space-y-3">
                {submission.validations.map((validation: any) => (
                  <Card key={validation.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {validation.validationType.replace(/_/g, ' ')}
                            </Badge>
                            <Badge variant="outline">
                              {validation.validatorRole}
                            </Badge>
                            <Badge variant={
                              validation.status === 'APPROVED' ? 'default' :
                              validation.status === 'REJECTED' ? 'destructive' : 'secondary'
                            }>
                              {validation.status}
                            </Badge>
                          </div>
                          <p className="text-sm">
                            Validator: {validation.validator.name}
                          </p>
                          {validation.reasoning && (
                            <p className="text-sm text-muted-foreground">
                              {validation.reasoning}
                            </p>
                          )}
                          {validation.complianceChecks && (
                            <div className="text-xs">
                              <p className="font-medium">Compliance Checks:</p>
                              <ul className="list-disc list-inside text-muted-foreground">
                                {validation.complianceChecks.map((check: string, index: number) => (
                                  <li key={index}>{check}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(validation.requestedAt).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Shield className="h-8 w-8 mx-auto mb-2" />
                    <p>No compliance validations yet</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="obligations" className="space-y-4">
            {submission.obligationTracking && submission.obligationTracking.length > 0 ? (
              <div className="space-y-3">
                {submission.obligationTracking.map((obligation: any) => (
                  <Card key={obligation.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {obligation.obligationType.replace(/_/g, ' ')}
                            </Badge>
                            <Badge variant="outline">
                              {obligation.priority}
                            </Badge>
                            <Badge variant={
                              obligation.status === 'COMPLETED' ? 'default' :
                              obligation.status === 'OVERDUE' ? 'destructive' : 'secondary'
                            }>
                              {obligation.status}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">
                            {obligation.description}
                          </p>
                          <p className="text-sm">
                            Assigned to: {obligation.assignedTo.name}
                          </p>
                          {obligation.dueDate && (
                            <p className="text-xs text-muted-foreground">
                              Due: {new Date(obligation.dueDate).toLocaleDateString()}
                            </p>
                          )}
                          {obligation.notes && (
                            <p className="text-sm text-muted-foreground">
                              Notes: {obligation.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(obligation.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2" />
                    <p>No regulatory obligations tracked yet</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="acknowledgements" className="space-y-4">
            {submission.acknowledgements && submission.acknowledgements.length > 0 ? (
              <div className="space-y-3">
                {submission.acknowledgements.map((acknowledgement: any) => (
                  <Card key={acknowledgement.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {acknowledgement.acknowledgementType.replace(/_/g, ' ')}
                            </Badge>
                            <Badge variant={
                              acknowledgement.status === 'ISSUED' ? 'default' :
                              acknowledgement.status === 'PENDING' ? 'secondary' : 'destructive'
                            }>
                              {acknowledgement.status}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">
                            {acknowledgement.title}
                          </p>
                          <p className="text-sm">
                            Issued by: {acknowledgement.issuedBy.name}
                          </p>
                          <p className="text-sm">
                            To: {acknowledgement.issuedTo.name}
                          </p>
                          {acknowledgement.referenceNumber && (
                            <p className="text-xs text-muted-foreground">
                              Ref: {acknowledgement.referenceNumber}
                            </p>
                          )}
                          {acknowledgement.notes && (
                            <p className="text-sm text-muted-foreground">
                              {acknowledgement.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(acknowledgement.issuedAt).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No acknowledgements issued yet</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MoreHorizontal,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  FileText,
  Users,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DataSubmissionRecord {
  id: string;
  submissionType: string;
  status: string;
  priority: string;
  contractorWorkArea?: string;
  reportingPeriod?: string;
  submittedAt: string;
  dueDate?: string;
  submitter: { id: string; name: string; email: string };
  receiver: { id: string; name: string; email: string };
  reviewer?: { id: string; name: string; email: string };
  currentValidations: number;
  requiredValidations: number;
  validations?: any[];
  acknowledgements?: any[];
  obligationTracking?: any[];
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

const priorityVariants: Record<string, 'default' | 'secondary' | 'destructive'> = {
  LOW: 'secondary',
  NORMAL: 'default',
  HIGH: 'default',
  URGENT: 'destructive',
  CRITICAL: 'destructive'
};

export default function RegulatoryDataClearingHouse() {
  const [submissions, setSubmissions] = useState<DataSubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<DataSubmissionRecord | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showObligationDialog, setShowObligationDialog] = useState(false);
  const [showAcknowledgementDialog, setShowAcknowledgementDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewing' | 'completed'>('all');

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'pending' ? 'SUBMITTED,PENDING_VALIDATION' :
                          filter === 'reviewing' ? 'UNDER_REVIEW,VALIDATING,REVISION_REQUIRED' :
                          filter === 'completed' ? 'APPROVED,ACKNOWLEDGED,ARCHIVED' : '';

      const url = `/api/regulatory-data/submissions${statusFilter ? `?status=${statusFilter}` : ''}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = (submission: DataSubmissionRecord) => {
    setSelectedSubmission(submission);
    setShowDetailDialog(true);
  };

  const handleValidateSubmission = (submission: DataSubmissionRecord) => {
    setSelectedSubmission(submission);
    setShowValidationDialog(true);
  };

  const handleTrackObligation = (submission: DataSubmissionRecord) => {
    setSelectedSubmission(submission);
    setShowObligationDialog(true);
  };

  const handleIssueAcknowledgement = (submission: DataSubmissionRecord) => {
    setSelectedSubmission(submission);
    setShowAcknowledgementDialog(true);
  };

  const getSubmissionIcon = (type: string) => {
    switch (type) {
      case 'SEISMIC_DATA': return <FileText className="h-4 w-4" />;
      case 'WELL_LOG_DATA': return <FileText className="h-4 w-4" />;
      case 'PRODUCTION_DATA': return <Users className="h-4 w-4" />;
      case 'FINANCIAL_REPORT': return <CreditCard className="h-4 w-4" />;
      case 'ENVIRONMENTAL_REPORT': return <AlertTriangle className="h-4 w-4" />;
      case 'SAFETY_REPORT': return <AlertTriangle className="h-4 w-4" />;
      case 'DRILLING_REPORT': return <FileText className="h-4 w-4" />;
      case 'COMPLETION_REPORT': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredSubmissions = submissions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Regulatory Data Clearing House</h1>
          <p className="text-muted-foreground">
            Audit trail data submission, compliance validation, dan acknowledgement untuk KKKS-SKK Migas
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Data Submission
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
        <TabsList>
          <TabsTrigger value="all">All Submissions</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="reviewing">Under Review</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data Submission Records
              </CardTitle>
              <CardDescription>
                Audit trail untuk submission data KKKS ke SKK Migas dengan compliance validation dan acknowledgement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submission ID</TableHead>
                    <TableHead>Data Type</TableHead>
                    <TableHead>KKKS / SKK Migas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Validations</TableHead>
                    <TableHead>Work Area</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No submissions found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSubmissionIcon(submission.submissionType)}
                            <span className="font-mono text-xs">
                              {submission.id.slice(0, 8)}...
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {submission.submissionType.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div>📤 {submission.submitter.name}</div>
                            <div>📥 {submission.receiver.name}</div>
                            {submission.reviewer && (
                              <div>👤 {submission.reviewer.name}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[submission.status]}>
                            {submission.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={priorityVariants[submission.priority]}>
                            {submission.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-sm">
                              {submission.currentValidations}/{submission.requiredValidations}
                            </span>
                            {submission.currentValidations >= submission.requiredValidations ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {submission.contractorWorkArea || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewSubmission(submission)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {['PENDING_VALIDATION', 'VALIDATING'].includes(submission.status) && (
                                <DropdownMenuItem onClick={() => handleValidateSubmission(submission)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Validate Compliance
                                </DropdownMenuItem>
                              )}
                              {['UNDER_REVIEW'].includes(submission.status) && (
                                <DropdownMenuItem onClick={() => handleTrackObligation(submission)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Track Obligation
                                </DropdownMenuItem>
                              )}
                              {['APPROVED'].includes(submission.status) && (
                                <DropdownMenuItem onClick={() => handleIssueAcknowledgement(submission)}>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Issue Acknowledgement
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {showCreateDialog && (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Data Submission</DialogTitle>
              <DialogDescription>
                Submit regulatory data for compliance validation
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 text-center text-muted-foreground">
              Create Submission Dialog - Under Development
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showDetailDialog && selectedSubmission && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Submission Details
                <Badge variant={statusVariants[selectedSubmission.status]}>
                  {selectedSubmission.status.replace(/_/g, ' ')}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Submission ID: {selectedSubmission.id}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="parties">Parties</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
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
                          {selectedSubmission.submissionType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Priority:</span>
                        <Badge variant="outline">{selectedSubmission.priority}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Work Area:</span>
                        <span className="text-sm">{selectedSubmission.contractorWorkArea || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Reporting Period:</span>
                        <span className="text-sm">{selectedSubmission.reportingPeriod || '-'}</span>
                      </div>
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
                            <span>{selectedSubmission.currentValidations}/{selectedSubmission.requiredValidations}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${(selectedSubmission.currentValidations / selectedSubmission.requiredValidations) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                        {selectedSubmission.currentValidations >= selectedSubmission.requiredValidations ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                        <p className="font-medium">{selectedSubmission.submitter.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedSubmission.submitter.email}</p>
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
                        <p className="font-medium">{selectedSubmission.receiver.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedSubmission.receiver.email}</p>
                        <Badge variant="outline">SKK Migas Regulator</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedSubmission.reviewer && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Assigned Reviewer
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="font-medium">{selectedSubmission.reviewer.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedSubmission.reviewer.email}</p>
                          <Badge variant="outline">Reviewer</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="compliance" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      <Shield className="h-8 w-8 mx-auto mb-2" />
                      <p>Compliance validation details will be shown here</p>
                      <p className="text-xs">Including format validation, data integrity checks, and regulatory compliance verification</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Submitted:</span>
                        <span className="text-sm">
                          {new Date(selectedSubmission.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      {selectedSubmission.dueDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Due Date:</span>
                          <span className="text-sm">
                            {new Date(selectedSubmission.dueDate).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {showValidationDialog && selectedSubmission && (
        <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Compliance Validation</DialogTitle>
              <DialogDescription>
                Validate compliance for submission {selectedSubmission.id.slice(0, 8)}...
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 text-center text-muted-foreground">
              Dialog component under development
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showObligationDialog && selectedSubmission && (
        <Dialog open={showObligationDialog} onOpenChange={setShowObligationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Track Regulatory Obligation</DialogTitle>
              <DialogDescription>
                Track obligations for submission {selectedSubmission.id.slice(0, 8)}...
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 text-center text-muted-foreground">
              Dialog component under development
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showAcknowledgementDialog && selectedSubmission && (
        <Dialog open={showAcknowledgementDialog} onOpenChange={setShowAcknowledgementDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Acknowledgement</DialogTitle>
              <DialogDescription>
                Issue acknowledgement for submission {selectedSubmission.id.slice(0, 8)}...
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 text-center text-muted-foreground">
              Dialog component under development
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
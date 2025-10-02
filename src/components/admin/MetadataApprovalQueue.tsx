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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Eye,
  MessageSquare,
  AlertTriangle,
  User,
  Calendar,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface PendingApproval {
  id: string;
  datasetName: string;
  submittedBy: string;
  submittedByEmail: string;
  organization: string;
  submissionDate: string;
  dataType: string;
  description: string;
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  reviewNotes?: string;
  metadata: {
    format: string;
    size: string;
    location: string;
    quality: string;
  };
}

export default function MetadataApprovalQueue() {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockApprovals: PendingApproval[] = [
        {
          id: '1',
          datasetName: 'Seismic Survey Lapangan Natuna 2024',
          submittedBy: 'Dr. Ahmad Rahman',
          submittedByEmail: 'ahmad.rahman@cnooc.com',
          organization: 'CNOOC SES Ltd',
          submissionDate: '2024-09-28T10:30:00Z',
          dataType: 'SEISMIC',
          description: 'High-resolution 3D seismic survey covering 450 km² in Natuna Block. Processed data with advanced imaging techniques.',
          status: 'PENDING',
          priority: 'HIGH',
          metadata: {
            format: 'SEG-Y',
            size: '2.5 TB',
            location: 'https://storage.cnooc.com/seismic/natuna-2024',
            quality: 'EXCELLENT',
          },
        },
        {
          id: '2',
          datasetName: 'Well Log Data Sumur Mahakam-15',
          submittedBy: 'Ir. Siti Nurhaliza',
          submittedByEmail: 'siti.nurhaliza@total.com',
          organization: 'TotalEnergies EP Indonesia',
          submissionDate: '2024-09-27T14:15:00Z',
          dataType: 'WELL',
          description: 'Complete wireline log suite including gamma ray, resistivity, neutron, and density logs from 1200m to 3500m depth.',
          status: 'REVIEWING',
          priority: 'MEDIUM',
          reviewNotes: 'Initial review completed. Checking data quality and completeness.',
          metadata: {
            format: 'LAS 3.0',
            size: '125 MB',
            location: '/secure/storage/well-logs/mahakam-15.las',
            quality: 'GOOD',
          },
        },
        {
          id: '3',
          datasetName: 'Production Data Lapangan Duri Q3 2024',
          submittedBy: 'John Hartono',
          submittedByEmail: 'john.hartono@chevron.com',
          organization: 'Chevron Pacific Indonesia',
          submissionDate: '2024-09-26T09:45:00Z',
          dataType: 'PRODUCTION',
          description: 'Quarterly production data including oil, gas, and water rates with associated reservoir parameters.',
          status: 'PENDING',
          priority: 'URGENT',
          metadata: {
            format: 'CSV',
            size: '45 MB',
            location: 'https://api.chevron.com/production/duri-q3-2024',
            quality: 'EXCELLENT',
          },
        },
      ];

      setApprovals(mockApprovals);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (id: string, action: 'APPROVED' | 'REJECTED', notes: string) => {
    setProcessingId(id);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setApprovals(prev => prev.map(approval =>
        approval.id === id
          ? { ...approval, status: action, reviewNotes: notes }
          : approval
      ));

      toast({
        title: action === 'APPROVED' ? 'Dataset Approved' : 'Dataset Rejected',
        description: `Dataset has been ${action.toLowerCase()} successfully.`,
      });

      setSelectedApproval(null);
      setReviewNotes('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process approval. Please try again.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: PendingApproval['status']) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'REVIEWING':
        return 'text-blue-600 bg-blue-100';
      case 'APPROVED':
        return 'text-green-600 bg-green-100';
      case 'REJECTED':
        return 'text-red-600 bg-red-100';
    }
  };

  const getPriorityColor = (priority: PendingApproval['priority']) => {
    switch (priority) {
      case 'LOW':
        return 'text-gray-600 bg-gray-100';
      case 'MEDIUM':
        return 'text-blue-600 bg-blue-100';
      case 'HIGH':
        return 'text-orange-600 bg-orange-100';
      case 'URGENT':
        return 'text-red-600 bg-red-100';
    }
  };

  const getStatusIcon = (status: PendingApproval['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'REVIEWING':
        return <Eye className="h-4 w-4" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6" />
            Metadata Approval Queue
          </CardTitle>
          <CardDescription>
            Review and approve dataset metadata submissions from KKKS providers.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {approvals.filter(a => a.status === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting initial review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {approvals.filter(a => a.status === 'REVIEWING').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently being reviewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {approvals.filter(a => a.priority === 'URGENT').length}
            </div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvals.filter(a => a.status === 'APPROVED' || a.status === 'REJECTED').length}
            </div>
            <p className="text-xs text-muted-foreground">Approved or rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Approval Queue Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dataset</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                  </TableRow>
                ))
              ) : (
                approvals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{approval.datasetName}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {approval.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span className="font-medium">{approval.submittedBy}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{approval.organization}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{approval.dataType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(approval.priority)}>
                        {approval.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(approval.status)}
                        <Badge variant="outline" className={getStatusColor(approval.status)}>
                          {approval.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(approval.submissionDate).toLocaleDateString('id-ID')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={processingId === approval.id}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedApproval(approval)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Review Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleApprovalAction(approval.id, 'APPROVED', 'Quick approval')}
                            disabled={processingId === approval.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Quick Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleApprovalAction(approval.id, 'REJECTED', 'Quick rejection')}
                            disabled={processingId === approval.id}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Quick Reject
                          </DropdownMenuItem>
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

      {/* Review Dialog */}
      <Dialog
        open={selectedApproval !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedApproval(null);
            setReviewNotes('');
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Dataset Submission</DialogTitle>
            <DialogDescription>
              Review the dataset metadata and provide approval decision.
            </DialogDescription>
          </DialogHeader>

          {selectedApproval && (
            <div className="space-y-4">
              {/* Dataset Info */}
              <div className="space-y-2">
                <h4 className="font-medium">Dataset Information</h4>
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <div><strong>Name:</strong> {selectedApproval.datasetName}</div>
                  <div><strong>Type:</strong> {selectedApproval.dataType}</div>
                  <div><strong>Description:</strong> {selectedApproval.description}</div>
                  <div><strong>Format:</strong> {selectedApproval.metadata.format}</div>
                  <div><strong>Size:</strong> {selectedApproval.metadata.size}</div>
                  <div><strong>Quality:</strong> {selectedApproval.metadata.quality}</div>
                </div>
              </div>

              {/* Submitter Info */}
              <div className="space-y-2">
                <h4 className="font-medium">Submitter Information</h4>
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <div><strong>Name:</strong> {selectedApproval.submittedBy}</div>
                  <div><strong>Email:</strong> {selectedApproval.submittedByEmail}</div>
                  <div><strong>Organization:</strong> {selectedApproval.organization}</div>
                  <div><strong>Submitted:</strong> {new Date(selectedApproval.submissionDate).toLocaleString('id-ID')}</div>
                </div>
              </div>

              {/* Review Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea
                  placeholder="Enter your review comments..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedApproval(null);
                    setReviewNotes('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleApprovalAction(selectedApproval.id, 'REJECTED', reviewNotes)}
                  disabled={processingId === selectedApproval.id}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprovalAction(selectedApproval.id, 'APPROVED', reviewNotes)}
                  disabled={processingId === selectedApproval.id}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
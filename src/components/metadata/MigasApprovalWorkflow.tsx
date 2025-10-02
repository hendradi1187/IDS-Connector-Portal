'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  AlertCircle,
  User,
  Building2,
  Calendar
} from 'lucide-react';
import {
  listMigasMetadata,
  getMigasMetadataById,
  approveMetadata,
  rejectMetadata,
  submitForApproval,
  type MigasMetadata
} from '@/lib/actions/metadataMigas';
import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MigasApprovalWorkflow() {
  const [submissions, setSubmissions] = useState<MigasMetadata[]>([]);
  const [selectedMetadata, setSelectedMetadata] = useState<MigasMetadata | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await listMigasMetadata({ status: 'submitted' });
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (metadata: MigasMetadata, action: 'approve' | 'reject') => {
    setSelectedMetadata(metadata);
    setActionType(action);
    setReviewNotes('');
    setShowDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedMetadata || !actionType) return;

    setProcessing(true);
    try {
      const reviewerId = 'reviewer@skkmigas.go.id'; // TODO: Get from auth context

      if (actionType === 'approve') {
        await approveMetadata(selectedMetadata.id, reviewerId, reviewNotes || 'Approved - metadata valid');
      } else {
        if (!reviewNotes.trim()) {
          alert('Catatan penolakan wajib diisi');
          return;
        }
        await rejectMetadata(selectedMetadata.id, reviewerId, reviewNotes);
      }

      // Refresh list
      await loadSubmissions();

      // Close dialog
      setShowDialog(false);
      setSelectedMetadata(null);
      setReviewNotes('');
      setActionType(null);
    } catch (error: any) {
      alert(error.message || 'Failed to submit review');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: MigasMetadata['status']) => {
    const variants: Record<MigasMetadata['status'], { variant: string; className: string; icon: any }> = {
      draft: { variant: 'secondary', className: 'bg-gray-100 text-gray-800', icon: FileText },
      submitted: { variant: 'default', className: 'bg-blue-100 text-blue-800', icon: Clock },
      under_review: { variant: 'default', className: 'bg-yellow-100 text-yellow-800', icon: Eye },
      approved: { variant: 'default', className: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      rejected: { variant: 'destructive', className: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.toUpperCase().replace('_', ' ')}
      </Badge>
    );
  };

  const getValidationBadge = (validationStatus: MigasMetadata['validationStatus']) => {
    if (validationStatus === 'valid') {
      return <Badge className="bg-green-100 text-green-800">✓ VALID</Badge>;
    } else if (validationStatus === 'invalid') {
      return <Badge className="bg-red-100 text-red-800">✗ INVALID</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">⊙ PENDING</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading submissions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <CardTitle>Workflow Approval - SKK Migas</CardTitle>
              </div>
              <CardDescription className="mt-1">
                Review dan setujui metadata yang disubmit oleh KKKS sebelum data fisik ditransfer
              </CardDescription>
            </div>
            <Button variant="outline" onClick={loadSubmissions}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tidak ada metadata yang menunggu approval saat ini.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dataset</TableHead>
                      <TableHead>Jenis Data</TableHead>
                      <TableHead>KKKS</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Validasi</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((metadata) => (
                      <TableRow key={metadata.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{metadata.datasetName}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {metadata.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{metadata.datasetType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Building2 className="h-3 w-3" />
                            {metadata.kkksOwner}
                          </div>
                          <div className="text-xs text-muted-foreground">{metadata.kkksId}</div>
                        </TableCell>
                        <TableCell>
                          {metadata.submittedAt && (
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              <span className="text-xs">
                                {formatDistanceToNow(metadata.submittedAt, { addSuffix: true })}
                              </span>
                            </div>
                          )}
                          {metadata.submittedBy && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              {metadata.submittedBy}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getValidationBadge(metadata.validationStatus)}</TableCell>
                        <TableCell>{getStatusBadge(metadata.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedMetadata(metadata);
                                // Could open a view dialog here
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleReview(metadata, 'approve')}
                              disabled={metadata.validationStatus !== 'valid'}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReview(metadata, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-blue-600">{submissions.length}</div>
                    <div className="text-sm text-muted-foreground">Pending Review</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {submissions.filter(s => s.validationStatus === 'valid').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Valid</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {submissions.filter(s => s.validationStatus === 'invalid').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Invalid</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Metadata' : 'Reject Metadata'}
            </DialogTitle>
            <DialogDescription>
              {selectedMetadata?.datasetName}
            </DialogDescription>
          </DialogHeader>

          {selectedMetadata && (
            <div className="space-y-4 py-4">
              {/* Metadata Summary */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Jenis Data</Label>
                  <p className="font-medium">{selectedMetadata.datasetType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Format File</Label>
                  <p className="font-medium">{selectedMetadata.fileFormat}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">KKKS Owner</Label>
                  <p className="font-medium">{selectedMetadata.kkksOwner}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Working Area</Label>
                  <p className="font-medium">{selectedMetadata.workingArea}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Validation Status</Label>
                  <div className="mt-1">{getValidationBadge(selectedMetadata.validationStatus)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Version</Label>
                  <p className="font-medium">v{selectedMetadata.version}</p>
                </div>
              </div>

              {/* Validation Errors (if any) */}
              {selectedMetadata.validationErrors && selectedMetadata.validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-2">Validation Errors:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {selectedMetadata.validationErrors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Review Notes */}
              <div className="space-y-2">
                <Label htmlFor="reviewNotes">
                  Review Notes {actionType === 'reject' && <span className="text-red-600">*</span>}
                </Label>
                <Textarea
                  id="reviewNotes"
                  placeholder={
                    actionType === 'approve'
                      ? 'Catatan approval (opsional)...'
                      : 'Jelaskan alasan penolakan (wajib)...'
                  }
                  rows={4}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={processing || (actionType === 'reject' && !reviewNotes.trim())}
              className={
                actionType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {processing ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

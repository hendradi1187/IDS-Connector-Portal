'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GitPullRequest, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import type { WorkflowRequest } from '@/lib/types';

interface WorkflowApprovalProps {
  canManage: boolean;
  canApprove: boolean;
}

export default function WorkflowApproval({ canManage, canApprove }: WorkflowApprovalProps) {
  const [workflows, setWorkflows] = useState<WorkflowRequest[]>([]);

  useEffect(() => {
    setWorkflows([
      {
        id: '1',
        requestType: 'create',
        entityType: 'vocabulary',
        entityName: 'Geological Terminology v3.0',
        requestedChanges: { name: 'Geological Terminology', version: '3.0' },
        status: 'Submitted',
        priority: 'Medium',
        reason: 'New comprehensive geological vocabulary for upstream operations',
        submittedBy: 'user-2',
        submittedByName: 'KKKS Provider',
        submittedAt: '2025-01-20T09:00:00Z',
        reviewers: [
          {
            userId: 'admin-1',
            userName: 'Admin User',
            role: 'Admin',
            status: 'Pending',
          },
        ],
        comments: [],
      },
      {
        id: '2',
        requestType: 'update',
        entityType: 'concept',
        entityId: 'concept-5',
        entityName: 'PRODUCTION Status',
        requestedChanges: { definition: 'Updated production definition...' },
        currentVersion: { definition: 'Old definition...' },
        status: 'UnderReview',
        priority: 'High',
        reason: 'Align with new SKK Migas guidelines',
        impactAnalysis: 'Affects 15 working areas and 230 wells',
        submittedBy: 'user-2',
        submittedByName: 'KKKS Provider',
        submittedAt: '2025-01-19T14:30:00Z',
        reviewers: [
          {
            userId: 'admin-1',
            userName: 'Admin User',
            role: 'Admin',
            status: 'Approved',
            reviewedAt: '2025-01-19T15:00:00Z',
            comments: 'Looks good, approved',
          },
        ],
        comments: [
          {
            id: 'c1',
            userId: 'admin-1',
            userName: 'Admin User',
            comment: 'Please add more examples',
            timestamp: '2025-01-19T14:45:00Z',
            type: 'suggestion',
          },
        ],
      },
    ]);
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      Draft: 'outline',
      Submitted: 'secondary',
      UnderReview: 'default',
      Approved: 'default',
      Rejected: 'destructive',
      Cancelled: 'outline',
    };
    const icons: Record<string, any> = {
      Submitted: Clock,
      UnderReview: Clock,
      Approved: CheckCircle,
      Rejected: XCircle,
    };
    const Icon = icons[status];
    return (
      <Badge variant={variants[status] || 'outline'}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      Low: 'bg-gray-600',
      Medium: 'bg-blue-600',
      High: 'bg-orange-600',
      Critical: 'bg-red-600',
    };
    return <Badge className={colors[priority]}>{priority}</Badge>;
  };

  const handleApprove = (id: string) => {
    alert(`Approving workflow ${id}`);
  };

  const handleReject = (id: string) => {
    alert(`Rejecting workflow ${id}`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitPullRequest className="h-5 w-5" />
            Workflow Approval System
          </CardTitle>
          <CardDescription>
            Request → Review → Approve workflow for metadata changes
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{workflow.entityName}</p>
                      <p className="text-xs text-muted-foreground">{workflow.reason}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{workflow.requestType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge>{workflow.entityType}</Badge>
                  </TableCell>
                  <TableCell>{getPriorityBadge(workflow.priority)}</TableCell>
                  <TableCell>{getStatusBadge(workflow.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{workflow.submittedByName}</p>
                      <p className="text-xs text-muted-foreground">{workflow.submittedBy}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(workflow.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {canApprove && workflow.status === 'Submitted' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(workflow.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(workflow.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {workflow.comments.length > 0 && (
                      <Badge variant="outline" className="ml-2">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {workflow.comments.length}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Submit New Request</CardTitle>
            <CardDescription>Create a new change request for approval</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              <GitPullRequest className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

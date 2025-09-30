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
import { History, Eye, Download, GitCompare } from 'lucide-react';
import type { VersionHistory as VersionHistoryType } from '@/lib/types';

interface VersionHistoryProps {
  canManage: boolean;
}

export default function VersionHistory({ canManage }: VersionHistoryProps) {
  const [versions, setVersions] = useState<VersionHistoryType[]>([]);

  useEffect(() => {
    // TODO: Fetch from Firebase
    setVersions([
      {
        id: '1',
        entityType: 'vocabulary',
        entityId: 'vocab-1',
        version: '2.0.1',
        versionNumber: 3,
        changes: [
          {
            field: 'description',
            oldValue: 'Standard vocabulary untuk data hulu migas',
            newValue: 'Standard vocabulary untuk data hulu migas Indonesia',
            changeType: 'modify',
            timestamp: '2025-01-20T10:00:00Z',
          },
          {
            field: 'concepts',
            oldValue: 45,
            newValue: 48,
            changeType: 'modify',
            timestamp: '2025-01-20T10:00:00Z',
          },
        ],
        changeType: 'patch',
        changeSummary: 'Updated description and added 3 new concepts',
        previousVersionId: '2',
        snapshot: {},
        createdAt: '2025-01-20T10:00:00Z',
        createdBy: 'user-1',
        createdByName: 'Admin User',
        status: 'Published',
        approvalStatus: 'Approved',
        approvedBy: 'admin-1',
        approvedAt: '2025-01-20T10:05:00Z',
      },
      {
        id: '2',
        entityType: 'vocabulary',
        entityId: 'vocab-1',
        version: '2.0.0',
        versionNumber: 2,
        changes: [
          {
            field: 'version',
            oldValue: '1.5',
            newValue: '2.0',
            changeType: 'modify',
            timestamp: '2025-01-15T14:00:00Z',
          },
          {
            field: 'standardCompliance',
            oldValue: [],
            newValue: [{ name: 'ISO 19115', version: '2014' }],
            changeType: 'add',
            timestamp: '2025-01-15T14:00:00Z',
          },
        ],
        changeType: 'major',
        changeSummary: 'Major version update with ISO 19115 compliance',
        previousVersionId: '1',
        snapshot: {},
        createdAt: '2025-01-15T14:00:00Z',
        createdBy: 'user-1',
        createdByName: 'Admin User',
        status: 'Published',
        approvalStatus: 'Approved',
        approvedBy: 'admin-1',
        approvedAt: '2025-01-15T14:30:00Z',
      },
      {
        id: '3',
        entityType: 'concept',
        entityId: 'concept-1',
        version: '1.1.0',
        versionNumber: 2,
        changes: [
          {
            field: 'definition',
            oldValue: 'Status aktif',
            newValue: 'Status wilayah kerja yang sedang aktif beroperasi',
            changeType: 'modify',
            timestamp: '2025-01-18T09:00:00Z',
          },
        ],
        changeType: 'minor',
        changeSummary: 'Enhanced definition for clarity',
        previousVersionId: '1',
        snapshot: {},
        createdAt: '2025-01-18T09:00:00Z',
        createdBy: 'user-2',
        createdByName: 'KKKS Provider',
        status: 'Published',
        approvalStatus: 'Approved',
        approvedBy: 'admin-1',
        approvedAt: '2025-01-18T09:15:00Z',
      },
    ]);
  }, []);

  const getChangeTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      major: 'destructive',
      minor: 'default',
      patch: 'secondary',
    };
    return <Badge variant={variants[type] || 'outline'}>{type.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      Draft: 'outline',
      Published: 'default',
      Deprecated: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History & Change Tracking
          </CardTitle>
          <CardDescription>
            Semantic versioning with full change history and rollback capability
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Version Table */}
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>All versions with detailed change logs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell>
                    <div>
                      <Badge variant="outline" className="mb-1">
                        {version.entityType}
                      </Badge>
                      <p className="text-xs text-muted-foreground font-mono">
                        {version.entityId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    v{version.version}
                  </TableCell>
                  <TableCell>{getChangeTypeBadge(version.changeType)}</TableCell>
                  <TableCell className="max-w-xs">{version.changeSummary}</TableCell>
                  <TableCell>
                    <Badge>{version.changes.length} changes</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{version.createdByName}</p>
                      <p className="text-xs text-muted-foreground">{version.createdBy}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(version.status)}
                    {version.approvalStatus && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {version.approvalStatus}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(version.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Compare">
                        <GitCompare className="h-4 w-4" />
                      </Button>
                      {canManage && (
                        <Button variant="ghost" size="sm" title="Export">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Change Details */}
      <Card>
        <CardHeader>
          <CardTitle>Change Details - Latest Version</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {versions[0]?.changes.map((change, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge>{change.changeType}</Badge>
                    <span className="font-medium">{change.field}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(change.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Old Value:</p>
                    <pre className="text-sm bg-muted p-2 rounded">
                      {JSON.stringify(change.oldValue, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">New Value:</p>
                    <pre className="text-sm bg-muted p-2 rounded">
                      {JSON.stringify(change.newValue, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

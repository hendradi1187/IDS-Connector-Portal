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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GitBranch, Download, Eye, ArrowRight } from 'lucide-react';
import type { DataLineage } from '@/lib/types';

export default function LineageViewer() {
  const [lineages, setLineages] = useState<DataLineage[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string>('all');

  useEffect(() => {
    // TODO: Fetch from Firebase
    setLineages([
      {
        id: '1',
        entityType: 'vocabulary',
        entityId: 'vocab-1',
        entityName: 'SKK Migas Status Terms',
        operation: 'create',
        timestamp: '2025-01-15T10:00:00Z',
        userId: 'user-1',
        userName: 'Admin User',
        source: {
          type: 'manual',
          reference: 'Created via UI',
        },
        target: {
          type: 'firestore',
          reference: 'vocabularies/vocab-1',
        },
        metadata: {
          browser: 'Chrome',
          ipAddress: '192.168.1.1',
        },
      },
      {
        id: '2',
        entityType: 'concept',
        entityId: 'concept-1',
        entityName: 'AKTIF',
        operation: 'update',
        timestamp: '2025-01-16T14:30:00Z',
        userId: 'user-2',
        userName: 'KKKS Provider',
        source: {
          type: 'manual',
          reference: 'Updated definition',
        },
        target: {
          type: 'firestore',
          reference: 'concepts/concept-1',
        },
        transformations: [
          {
            step: 1,
            action: 'Update definition field',
            input: 'Status wilayah kerja aktif',
            output: 'Wilayah kerja yang sedang aktif beroperasi',
            timestamp: '2025-01-16T14:30:00Z',
          },
        ],
        previousVersion: 'v1.0',
        metadata: {
          changeReason: 'Clarification of definition',
        },
      },
      {
        id: '3',
        entityType: 'mapping',
        entityId: 'mapping-1',
        entityName: 'AKTIF → statusWk',
        operation: 'create',
        timestamp: '2025-01-18T09:15:00Z',
        userId: 'user-1',
        userName: 'Admin User',
        source: {
          type: 'manual',
          reference: 'Concept mapping',
        },
        target: {
          type: 'firestore',
          reference: 'conceptMappings/mapping-1',
        },
        metadata: {
          vocabularyId: 'vocab-1',
          conceptId: 'concept-1',
          mdmDomain: 'working-area',
          mdmField: 'statusWk',
        },
      },
      {
        id: '4',
        entityType: 'vocabulary',
        entityId: 'vocab-1',
        operation: 'export',
        timestamp: '2025-01-20T11:00:00Z',
        userId: 'user-3',
        userName: 'Data Consumer',
        source: {
          type: 'api',
          reference: '/api/vocabularies/vocab-1/export',
        },
        target: {
          type: 'export',
          reference: 'vocab-skk-migas-status-v1.0.json',
        },
        entityName: 'SKK Migas Status Terms',
        metadata: {
          format: 'JSON',
          size: '15KB',
        },
      },
    ]);
  }, []);

  const getOperationBadge = (operation: string) => {
    const variants: Record<string, any> = {
      create: 'default',
      update: 'secondary',
      delete: 'destructive',
      import: 'outline',
      export: 'outline',
      transform: 'outline',
      validate: 'outline',
    };
    return <Badge variant={variants[operation] || 'outline'}>{operation}</Badge>;
  };

  const getEntityTypeBadge = (type: string) => {
    return <Badge variant="outline">{type}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Data Lineage
              </CardTitle>
              <CardDescription>
                Track data origin, transformations, and movement across the system
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="vocabulary">Vocabularies</SelectItem>
                  <SelectItem value="concept">Concepts</SelectItem>
                  <SelectItem value="mapping">Mappings</SelectItem>
                  <SelectItem value="relation">Relations</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lineage Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Lineage Timeline</CardTitle>
          <CardDescription>Chronological view of data operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lineages.map((lineage, index) => (
              <div key={lineage.id} className="relative">
                {index < lineages.length - 1 && (
                  <div className="absolute left-6 top-12 h-full w-0.5 bg-border" />
                )}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-background">
                      <GitBranch className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 pb-8">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getEntityTypeBadge(lineage.entityType)}
                          {getOperationBadge(lineage.operation)}
                          <span className="font-medium">{lineage.entityName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ID: {lineage.entityId}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="rounded-lg border bg-muted/50 p-3 text-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">By:</span>
                        <span>{lineage.userName}</span>
                        <Badge variant="outline" className="text-xs">{lineage.userId}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Time:</span>
                        <span>{new Date(lineage.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Source:</span>
                        <Badge variant="outline">{lineage.source?.type}</Badge>
                        {lineage.source?.reference && (
                          <span className="text-xs text-muted-foreground">
                            {lineage.source.reference}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Target:</span>
                        <Badge variant="outline">{lineage.target?.type}</Badge>
                        {lineage.target?.reference && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {lineage.target.reference}
                          </span>
                        )}
                      </div>
                      {lineage.transformations && lineage.transformations.length > 0 && (
                        <div className="pt-2 border-t">
                          <span className="font-medium block mb-2">Transformations:</span>
                          {lineage.transformations.map((transform, idx) => (
                            <div key={idx} className="ml-4 text-xs space-y-1 mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  Step {transform.step}
                                </Badge>
                                <span>{transform.action}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span>{transform.input}</span>
                                <ArrowRight className="h-3 w-3" />
                                <span>{transform.output}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {lineage.previousVersion && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium">Previous Version:</span>
                          <Badge variant="outline">{lineage.previousVersion}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lineage Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lineages.length}</div>
            <p className="text-xs text-muted-foreground">All tracked operations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Create Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lineages.filter((l) => l.operation === 'create').length}
            </div>
            <p className="text-xs text-muted-foreground">New entities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lineages.filter((l) => l.operation === 'update').length}
            </div>
            <p className="text-xs text-muted-foreground">Modified entities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Transformations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lineages.filter((l) => l.transformations && l.transformations.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">With transformations</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

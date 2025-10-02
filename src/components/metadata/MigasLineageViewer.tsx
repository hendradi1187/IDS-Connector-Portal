'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GitBranch,
  Clock,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Database,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { getMigasMetadataById, getVersionHistory, type DataLineage } from '@/lib/actions/metadataMigas';
import { formatDistanceToNow } from 'date-fns';

interface MigasLineageViewerProps {
  metadataId: string;
}

export default function MigasLineageViewer({ metadataId }: MigasLineageViewerProps) {
  const [lineage, setLineage] = useState<DataLineage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadLineage();
  }, [metadataId]);

  const loadLineage = async () => {
    setLoading(true);
    try {
      const history = await getVersionHistory(metadataId);
      setLineage(history);
    } catch (error) {
      console.error('Failed to load lineage:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getActionIcon = (action: DataLineage['action']) => {
    switch (action) {
      case 'created':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'updated':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'validated':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'versioned':
        return <GitBranch className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: DataLineage['action']) => {
    switch (action) {
      case 'created':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'updated':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'validated':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'versioned':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading lineage...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          <CardTitle>Data Lineage & Version History</CardTitle>
        </div>
        <CardDescription>
          Tracking asal-usul data dan riwayat perubahan untuk transparansi dan audit trail
        </CardDescription>
      </CardHeader>
      <CardContent>
        {lineage.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Belum ada riwayat lineage untuk dataset ini
          </p>
        ) : (
          <div className="relative space-y-4">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            {lineage.map((entry, index) => (
              <div key={index} className="relative pl-14">
                {/* Timeline dot */}
                <div className="absolute left-4 -translate-x-1/2 mt-1.5">
                  <div className="rounded-full p-1.5 bg-background border-2 border-border">
                    {getActionIcon(entry.action)}
                  </div>
                </div>

                {/* Content */}
                <div className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getActionColor(entry.action)} capitalize`}>
                          {entry.action}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                        </span>
                      </div>

                      <p className="text-sm font-medium mb-1">{entry.description}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.performedBy}
                        </span>
                        {entry.sourceSystem && (
                          <span className="flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            {entry.sourceSystem}
                          </span>
                        )}
                      </div>

                      {/* Expandable changes */}
                      {entry.changes && (
                        <div className="mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => toggleExpand(index)}
                          >
                            {expandedItems.has(index) ? (
                              <ChevronDown className="h-3 w-3 mr-1" />
                            ) : (
                              <ChevronRight className="h-3 w-3 mr-1" />
                            )}
                            View Changes
                          </Button>

                          {expandedItems.has(index) && (
                            <div className="mt-2 p-3 bg-muted rounded text-xs font-mono">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(entry.changes, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {entry.timestamp.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{lineage.length}</div>
              <div className="text-xs text-muted-foreground">Total Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {lineage.filter(e => e.action === 'versioned').length}
              </div>
              <div className="text-xs text-muted-foreground">Versions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {lineage.filter(e => e.action === 'approved').length}
              </div>
              <div className="text-xs text-muted-foreground">Approvals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {lineage.filter(e => e.action === 'updated').length}
              </div>
              <div className="text-xs text-muted-foreground">Updates</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

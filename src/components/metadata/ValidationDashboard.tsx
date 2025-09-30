'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, XCircle, AlertTriangle, Play, FileCheck } from 'lucide-react';
import type { ValidationRule, SchemaDefinition } from '@/lib/types';

interface ValidationDashboardProps {
  canManage: boolean;
}

export default function ValidationDashboard({ canManage }: ValidationDashboardProps) {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [schemas, setSchemas] = useState<SchemaDefinition[]>([]);
  const [rules, setRules] = useState<ValidationRule[]>([]);

  useEffect(() => {
    // TODO: Fetch from Firebase
    setSchemas([
      {
        id: '1',
        name: 'Working Area Schema',
        description: 'Schema untuk data wilayah kerja KKKS',
        domain: 'mdm',
        version: '2.0',
        fields: [
          {
            name: 'wkId',
            label: 'Working Area ID',
            type: 'string',
            format: 'REGEX',
            required: true,
            unique: true,
            description: 'Unique identifier for working area',
            validationRules: ['rule1'],
            examples: ['WK-001', 'WK-ABC'],
          },
          {
            name: 'effectiveDate',
            label: 'Effective Date',
            type: 'date',
            format: 'ISO_8601',
            required: true,
            description: 'Contract effective date',
            validationRules: ['rule2'],
          },
          {
            name: 'shape',
            label: 'Geometry',
            type: 'geometry',
            format: 'GeoJSON',
            required: true,
            description: 'Working area boundary in WGS 84',
            validationRules: ['rule3'],
          },
        ],
        validationRules: ['rule1', 'rule2', 'rule3'],
        status: 'Active',
        standardCompliance: [
          {
            name: 'SKK Migas Data Specification',
            version: 'v2.0',
            compliance: 'full',
          },
          {
            name: 'ISO 19115',
            version: '2014',
            url: 'https://www.iso.org/standard/53798.html',
            compliance: 'partial',
          },
        ],
        createdAt: '2025-01-15T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z',
        createdBy: 'admin',
      },
    ]);

    setValidationResults([
      {
        id: '1',
        entityType: 'Working Area',
        entityId: 'WA-001',
        entityName: 'Wilayah Kerja Rokan',
        validationStatus: 'passed',
        issuesCount: 0,
        warningsCount: 2,
        lastValidated: '2025-01-20T10:00:00Z',
      },
      {
        id: '2',
        entityType: 'Well',
        entityId: 'WELL-123',
        entityName: 'Sumur Eksplorasi A',
        validationStatus: 'failed',
        issuesCount: 3,
        warningsCount: 1,
        lastValidated: '2025-01-20T09:30:00Z',
      },
      {
        id: '3',
        entityType: 'Field',
        entityId: 'FLD-045',
        entityName: 'Lapangan Minas',
        validationStatus: 'warning',
        issuesCount: 0,
        warningsCount: 5,
        lastValidated: '2025-01-20T08:15:00Z',
      },
    ]);
  }, []);

  const runValidation = () => {
    alert('Running validation for all metadata...');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'warning':
        return <Badge className="bg-orange-600"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Schema Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Schema & Validation Rules</CardTitle>
              <CardDescription>
                Enforce data quality and compliance with configurable schemas
              </CardDescription>
            </div>
            {canManage && (
              <div className="flex gap-2">
                <Button onClick={runValidation}>
                  <Play className="h-4 w-4 mr-2" />
                  Run Validation
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {schemas.map((schema) => (
              <Card key={schema.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{schema.name}</CardTitle>
                    <Badge variant={schema.status === 'Active' ? 'default' : 'outline'}>
                      {schema.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">{schema.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span className="font-medium">{schema.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fields:</span>
                      <span className="font-medium">{schema.fields.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rules:</span>
                      <span className="font-medium">{schema.validationRules.length}</span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium">Standards Compliance:</p>
                    {schema.standardCompliance.map((std, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{std.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {std.compliance}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Validation Results</CardTitle>
              <CardDescription>Real-time metadata quality monitoring</CardDescription>
            </div>
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                <SelectItem value="working-area">Working Area</SelectItem>
                <SelectItem value="well">Well</SelectItem>
                <SelectItem value="field">Field</SelectItem>
                <SelectItem value="facility">Facility</SelectItem>
                <SelectItem value="seismic">Seismic Survey</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity Type</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Entity Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead>Warnings</TableHead>
                <TableHead>Last Validated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validationResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.entityType}</TableCell>
                  <TableCell className="font-mono text-xs">{result.entityId}</TableCell>
                  <TableCell>{result.entityName}</TableCell>
                  <TableCell>{getStatusBadge(result.validationStatus)}</TableCell>
                  <TableCell>
                    {result.issuesCount > 0 ? (
                      <Badge variant="destructive">{result.issuesCount}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {result.warningsCount > 0 ? (
                      <Badge className="bg-orange-600">{result.warningsCount}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(result.lastValidated).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <FileCheck className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Validation Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Rules Configuration</CardTitle>
          <CardDescription>
            Configure format enforcement and data quality rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Format Validation</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• ISO 8601 date/time format</li>
                  <li>• WGS 84 coordinate validation</li>
                  <li>• GeoJSON geometry structure</li>
                  <li>• UUID format enforcement</li>
                  <li>• Email & URL validation</li>
                  <li>• Custom regex patterns</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Business Rules</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Mandatory field enforcement</li>
                  <li>• Value range validation</li>
                  <li>• Enumerated value checks</li>
                  <li>• Foreign key references</li>
                  <li>• Uniqueness constraints</li>
                  <li>• Cross-field dependencies</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

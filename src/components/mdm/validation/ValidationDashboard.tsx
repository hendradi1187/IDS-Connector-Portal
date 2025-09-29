'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Database,
  FileCheck,
  Settings,
  Play,
  Download,
  RefreshCw
} from 'lucide-react';

interface ValidationResult {
  valid: boolean;
  summary: {
    domain: string;
    operation: string;
    timestamp: string;
    status: string;
    errorCount: number;
    warningCount: number;
  };
  results: {
    mandatory: { isValid: boolean; errors: string[]; warnings?: string[] };
    businessRules: { isValid: boolean; errors: string[] };
    dataIntegrity: { isValid: boolean; errors: string[] };
  };
  errors: string[];
  warnings: string[];
}

interface ValidationRules {
  domains: string[];
  validationTypes: string[];
  rules: Record<string, any>;
}

export default function ValidationDashboard() {
  const [activeTab, setActiveTab] = useState('validator');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validationRules, setValidationRules] = useState<ValidationRules | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Validator form state
  const [domain, setDomain] = useState('');
  const [operation, setOperation] = useState('create');
  const [jsonData, setJsonData] = useState('');
  const [skipBusinessRules, setSkipBusinessRules] = useState(false);
  const [skipDataIntegrity, setSkipDataIntegrity] = useState(false);

  useEffect(() => {
    fetchValidationRules();
  }, []);

  const fetchValidationRules = async () => {
    try {
      const response = await fetch('/api/mdm/validate?action=rules');
      const data = await response.json();
      setValidationRules(data);
    } catch (error) {
      console.error('Error fetching validation rules:', error);
    }
  };

  const validateData = async () => {
    if (!domain || !jsonData.trim()) {
      alert('Please select domain and provide JSON data');
      return;
    }

    try {
      const parsedData = JSON.parse(jsonData);
      setIsValidating(true);

      const response = await fetch('/api/mdm/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          data: parsedData,
          operation,
          options: {
            skipBusinessRules,
            skipDataIntegrity
          }
        })
      });

      const result = await response.json();
      setValidationResult(result);

    } catch (error) {
      console.error('Validation error:', error);
      alert('Error during validation: ' + (error as Error).message);
    } finally {
      setIsValidating(false);
    }
  };

  const loadSampleData = (selectedDomain: string) => {
    const samples = {
      workingArea: {
        wkId: 'WK-001',
        wkName: 'Working Area 1',
        kkksName: 'PT. Sample KKKS',
        wkType: 'PSC',
        basin: 'North Sumatra Basin',
        province: 'Sumatra Utara',
        contractorName: 'PT. Sample Contractor',
        area: 1500.5,
        shape: '{"type":"Polygon","coordinates":[[[107.0,−6.0],[107.1,−6.0],[107.1,−5.9],[107.0,−5.9],[107.0,−6.0]]]}'
      },
      well: {
        uwi: '12345-67890-AB',
        wellName: 'Sample Well 1',
        wkId: 'WK-001',
        fieldId: 'FIELD-001',
        currentClass: 'PRODUCTION',
        statusType: 'PRODUCING',
        environmentType: 'ONSHORE',
        surfaceLongitude: 107.123456,
        surfaceLatitude: -6.123456,
        operator: 'PT. Sample Operator',
        totalDepth: 3500.0,
        spudDate: '2023-01-15',
        shape: '{"type":"Point","coordinates":[107.123456,-6.123456]}'
      },
      field: {
        fieldId: 'FIELD-001',
        fieldName: 'Sample Field',
        wkId: 'WK-001',
        fieldType: 'OIL_GAS',
        basin: 'North Sumatra Basin',
        operator: 'PT. Sample Operator',
        status: 'PRODUCTION',
        discoveryDate: '2020-05-20',
        oilReserves: 50000000,
        gasReserves: 25000000,
        shape: '{"type":"Polygon","coordinates":[[[107.1,−6.1],[107.2,−6.1],[107.2,−6.0],[107.1,−6.0],[107.1,−6.1]]]}'
      },
      facility: {
        facilityId: 'FAC-001',
        facilityName: 'Main Production Platform',
        facilityType: 'PLATFORM',
        wkId: 'WK-001',
        fieldId: 'FIELD-001',
        operator: 'PT. Sample Operator',
        status: 'OPERATIONAL',
        capacityProd: 10000,
        waterDepth: 150.5,
        noOfWell: 12,
        installationDate: '2022-03-15',
        commissioningDate: '2022-06-20',
        longitude: 107.15,
        latitude: -6.05,
        shape: '{"type":"Point","coordinates":[107.15,-6.05]}'
      },
      seismicSurvey: {
        seisAcqtnSurveyId: 'SEIS-001',
        acqtnSurveyName: 'Sample 3D Survey',
        wkId: 'WK-001',
        seisDimension: '3D',
        environment: 'ONSHORE',
        shotBy: 'PT. Sample Seismic',
        startDate: '2023-01-01',
        completedDate: '2023-03-31',
        surveyArea: 250.5,
        shape: '{"type":"Polygon","coordinates":[[[107.0,−6.2],[107.3,−6.2],[107.3,−5.8],[107.0,−5.8],[107.0,−6.2]]]}'
      }
    };

    setJsonData(JSON.stringify(samples[selectedDomain as keyof typeof samples], null, 2));
  };

  const exportValidationResult = () => {
    if (!validationResult) return;

    const dataStr = JSON.stringify(validationResult, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `validation-result-${validationResult.summary.domain}-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderValidationResults = () => {
    if (!validationResult) return null;

    const { summary, results, errors, warnings } = validationResult;

    return (
      <div className="space-y-4">
        {/* Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {summary.status === 'VALID' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Validation Result
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant={summary.status === 'VALID' ? 'default' : 'destructive'}>
                  {summary.status}
                </Badge>
                <Button size="sm" variant="outline" onClick={exportValidationResult}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium">Domain</p>
                <p className="text-muted-foreground">{summary.domain}</p>
              </div>
              <div>
                <p className="font-medium">Operation</p>
                <p className="text-muted-foreground">{summary.operation}</p>
              </div>
              <div>
                <p className="font-medium">Errors</p>
                <p className="text-red-600 font-medium">{summary.errorCount}</p>
              </div>
              <div>
                <p className="font-medium">Warnings</p>
                <p className="text-yellow-600 font-medium">{summary.warningCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Mandatory Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Database className="h-4 w-4" />
                Mandatory Fields
                {results.mandatory.isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.mandatory.errors.length > 0 && (
                <div className="space-y-2">
                  {results.mandatory.errors.map((error, index) => (
                    <Alert key={index} className="py-2">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
              {results.mandatory.isValid && (
                <p className="text-green-600 text-sm">All mandatory fields are valid</p>
              )}
            </CardContent>
          </Card>

          {/* Business Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4" />
                Business Rules
                {results.businessRules.isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.businessRules.errors.length > 0 && (
                <div className="space-y-2">
                  {results.businessRules.errors.map((error, index) => (
                    <Alert key={index} className="py-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
              {results.businessRules.isValid && (
                <p className="text-green-600 text-sm">All business rules are satisfied</p>
              )}
            </CardContent>
          </Card>

          {/* Data Integrity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileCheck className="h-4 w-4" />
                Data Integrity
                {results.dataIntegrity.isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.dataIntegrity.errors.length > 0 && (
                <div className="space-y-2">
                  {results.dataIntegrity.errors.map((error, index) => (
                    <Alert key={index} className="py-2">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
              {results.dataIntegrity.isValid && (
                <p className="text-green-600 text-sm">Data integrity is maintained</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <Alert key={index} className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-sm">{warning}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            MDM Data Validation Dashboard
          </CardTitle>
          <p className="text-muted-foreground">
            Validasi komprehensif untuk data MDM Hulu Migas sesuai SKK Migas Data Specification v2
          </p>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="validator">Data Validator</TabsTrigger>
          <TabsTrigger value="rules">Validation Rules</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Data Validator Tab */}
        <TabsContent value="validator" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validation Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="domain">Domain</Label>
                    <Select value={domain} onValueChange={setDomain}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workingArea">Working Area</SelectItem>
                        <SelectItem value="seismicSurvey">Seismic Survey</SelectItem>
                        <SelectItem value="well">Well</SelectItem>
                        <SelectItem value="field">Field</SelectItem>
                        <SelectItem value="facility">Facility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="operation">Operation</Label>
                    <Select value={operation} onValueChange={setOperation}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="create">Create</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="jsonData">JSON Data</Label>
                    {domain && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadSampleData(domain)}
                      >
                        Load Sample
                      </Button>
                    )}
                  </div>
                  <Textarea
                    id="jsonData"
                    value={jsonData}
                    onChange={(e) => setJsonData(e.target.value)}
                    placeholder='{"field": "value", ...}'
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Validation Options</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={skipBusinessRules}
                        onChange={(e) => setSkipBusinessRules(e.target.checked)}
                      />
                      <span className="text-sm">Skip Business Rules</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={skipDataIntegrity}
                        onChange={(e) => setSkipDataIntegrity(e.target.checked)}
                      />
                      <span className="text-sm">Skip Data Integrity Checks</span>
                    </label>
                  </div>
                </div>

                <Button
                  onClick={validateData}
                  disabled={isValidating || !domain || !jsonData.trim()}
                  className="w-full"
                >
                  {isValidating ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Validate Data
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validation Results</CardTitle>
              </CardHeader>
              <CardContent>
                {validationResult ? (
                  renderValidationResults()
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No validation results yet. Submit data for validation to see results here.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Validation Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          {validationRules && (
            <div className="grid gap-4">
              {validationRules.domains.map(domainName => (
                <Card key={domainName}>
                  <CardHeader>
                    <CardTitle className="capitalize">{domainName.replace(/([A-Z])/g, ' $1')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="mandatory" className="w-full">
                      <TabsList>
                        <TabsTrigger value="mandatory">Mandatory</TabsTrigger>
                        <TabsTrigger value="business">Business Rules</TabsTrigger>
                      </TabsList>
                      <TabsContent value="mandatory" className="mt-4">
                        <ul className="space-y-2 text-sm">
                          {validationRules.rules[domainName]?.mandatory?.map((rule: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              {rule}
                            </li>
                          ))}
                        </ul>
                      </TabsContent>
                      <TabsContent value="business" className="mt-4">
                        <ul className="space-y-2 text-sm">
                          {validationRules.rules[domainName]?.businessRules?.map((rule: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-600" />
                              {rule}
                            </li>
                          ))}
                        </ul>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Validation Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Validation settings dan konfigurasi akan ditambahkan pada pengembangan selanjutnya.
                    Saat ini menggunakan konfigurasi default sesuai SKK Migas Data Specification v2.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
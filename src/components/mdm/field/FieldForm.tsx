'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertCircle,
  CheckCircle,
  Upload,
  X,
  MapPin,
  Calendar,
  Building2,
  Info,
  Mountain,
  Gauge,
  Factory
} from 'lucide-react';

interface Field {
  id: string;
  fieldId: string;
  fieldName: string;
  wkId: string;
  basin?: string;
  formationName?: string;
  discoveryDate?: string;
  fieldType: 'OIL' | 'GAS' | 'OIL_GAS' | 'NON_PRODUCTION' | 'CONDENSATE';
  status: 'ACTIVE' | 'ABANDONED' | 'SUSPENDED' | 'DEVELOPMENT' | 'DISCOVERY';
  operator: string;
  isOffshore: boolean;
  shape: any;
  reservoirType?: string;
  estimatedReserves?: number;
  currentProduction?: number;
}

interface WorkingArea {
  wkId: string;
  wkName: string;
  kkksName: string;
}

interface FieldFormProps {
  field?: Field | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function FieldForm({ field, onSubmit, onCancel }: FieldFormProps) {
  const [formData, setFormData] = useState({
    fieldId: '',
    fieldName: '',
    wkId: '',
    basin: '',
    formationName: '',
    discoveryDate: '',
    fieldType: 'OIL' as 'OIL' | 'GAS' | 'OIL_GAS' | 'NON_PRODUCTION' | 'CONDENSATE',
    status: 'DISCOVERY' as 'ACTIVE' | 'ABANDONED' | 'SUSPENDED' | 'DEVELOPMENT' | 'DISCOVERY',
    operator: '',
    isOffshore: false,
    shape: null as any,
    reservoirType: '',
    estimatedReserves: '',
    currentProduction: ''
  });

  const [workingAreas, setWorkingAreas] = useState<WorkingArea[]>([]);
  const [validation, setValidation] = useState<{
    fieldId?: { valid: boolean; message: string };
  }>({});
  const [loading, setLoading] = useState(false);
  const [geometryFile, setGeometryFile] = useState<File | null>(null);

  // Load working areas
  useEffect(() => {
    const loadWorkingAreas = async () => {
      try {
        const response = await fetch('/api/mdm/working-areas?limit=1000');
        const data = await response.json();
        if (response.ok) {
          setWorkingAreas(data.data);
        }
      } catch (error) {
        console.error('Error loading working areas:', error);
      }
    };
    loadWorkingAreas();
  }, []);

  // Pre-fill form if editing
  useEffect(() => {
    if (field) {
      setFormData({
        fieldId: field.fieldId,
        fieldName: field.fieldName,
        wkId: field.wkId,
        basin: field.basin || '',
        formationName: field.formationName || '',
        discoveryDate: field.discoveryDate ? field.discoveryDate.split('T')[0] : '',
        fieldType: field.fieldType,
        status: field.status,
        operator: field.operator,
        isOffshore: field.isOffshore,
        shape: field.shape,
        reservoirType: field.reservoirType || '',
        estimatedReserves: field.estimatedReserves?.toString() || '',
        currentProduction: field.currentProduction?.toString() || ''
      });
    }
  }, [field]);

  // Validate fieldId
  const validateFieldId = async (fieldId: string) => {
    if (!fieldId) {
      setValidation(prev => ({
        ...prev,
        fieldId: { valid: false, message: 'Field ID is required' }
      }));
      return;
    }

    try {
      const response = await fetch('/api/mdm/fields/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldId,
          excludeId: field?.id
        })
      });

      const result = await response.json();
      setValidation(prev => ({
        ...prev,
        fieldId: {
          valid: result.valid,
          message: result.valid ? 'Field ID is available' : result.error
        }
      }));
    } catch (error) {
      console.error('Error validating field ID:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validate field ID on change
    if (field === 'fieldId') {
      validateFieldId(value as string);
    }
  };

  // Handle geometry file upload
  const handleGeometryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setGeometryFile(file);

    try {
      const text = await file.text();
      const geometry = JSON.parse(text);

      // Validate GeoJSON structure
      if (!geometry.type || !geometry.coordinates) {
        alert('Invalid GeoJSON format');
        return;
      }

      // For fields, we expect Polygon or MultiPolygon geometry
      if (!['Polygon', 'MultiPolygon'].includes(geometry.type)) {
        alert('Field geometry must be a Polygon or MultiPolygon');
        return;
      }

      setFormData(prev => ({ ...prev, shape: geometry }));
    } catch (error) {
      console.error('Error processing geometry file:', error);
      alert('Error processing geometry file');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      'fieldId',
      'fieldName',
      'wkId',
      'fieldType',
      'status',
      'operator'
    ];

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate field ID
    if (!validation.fieldId?.valid) {
      alert('Please provide a valid Field ID');
      return;
    }

    // Validate geometry
    if (!formData.shape) {
      alert('Please provide geometry data for the field boundary');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        estimatedReserves: formData.estimatedReserves ? parseFloat(formData.estimatedReserves) : null,
        currentProduction: formData.currentProduction ? parseFloat(formData.currentProduction) : null,
        discoveryDate: formData.discoveryDate || null
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  // Field types with descriptions
  const fieldTypes = [
    { value: 'OIL', label: 'Oil', description: 'Primarily oil production' },
    { value: 'GAS', label: 'Gas', description: 'Primarily gas production' },
    { value: 'OIL_GAS', label: 'Oil & Gas', description: 'Both oil and gas production' },
    { value: 'CONDENSATE', label: 'Condensate', description: 'Gas condensate production' },
    { value: 'NON_PRODUCTION', label: 'Non-Production', description: 'Exploration or abandoned field' }
  ];

  // Field statuses
  const fieldStatuses = [
    { value: 'DISCOVERY', label: 'Discovery', description: 'Recently discovered' },
    { value: 'DEVELOPMENT', label: 'Development', description: 'Under development' },
    { value: 'ACTIVE', label: 'Active', description: 'Currently producing' },
    { value: 'SUSPENDED', label: 'Suspended', description: 'Temporarily suspended' },
    { value: 'ABANDONED', label: 'Abandoned', description: 'Permanently abandoned' }
  ];

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {field ? 'Edit Field' : 'Add New Field'}
          </DialogTitle>
          <DialogDescription>
            {field
              ? 'Update field information and production details'
              : 'Enter field information and production details'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="geological">Geological</TabsTrigger>
              <TabsTrigger value="production">Production</TabsTrigger>
              <TabsTrigger value="geometry">Geometry</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="w-5 h-5" />
                    <span>Basic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fieldId">
                        Field ID <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fieldId"
                        value={formData.fieldId}
                        onChange={(e) => handleInputChange('fieldId', e.target.value.toUpperCase())}
                        placeholder="e.g., FIELD-2024-001"
                        className={validation.fieldId?.valid === false ? 'border-red-500' : ''}
                      />
                      {validation.fieldId && (
                        <div className={`flex items-center space-x-1 text-xs ${
                          validation.fieldId.valid ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {validation.fieldId.valid ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <span>{validation.fieldId.message}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fieldName">
                        Field Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fieldName"
                        value={formData.fieldName}
                        onChange={(e) => handleInputChange('fieldName', e.target.value)}
                        placeholder="Field name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operator">
                        Operator (KKKS) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="operator"
                        value={formData.operator}
                        onChange={(e) => handleInputChange('operator', e.target.value)}
                        placeholder="Operating company"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wkId">
                        Working Area <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.wkId} onValueChange={(value) => handleInputChange('wkId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select working area" />
                        </SelectTrigger>
                        <SelectContent>
                          {workingAreas.map((wa) => (
                            <SelectItem key={wa.wkId} value={wa.wkId}>
                              {wa.wkName} ({wa.wkId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fieldType">
                        Field Type <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.fieldType} onValueChange={(value) => handleInputChange('fieldType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select field type" />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">
                        Field Status <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              <div>
                                <div className="font-medium">{status.label}</div>
                                <div className="text-xs text-muted-foreground">{status.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discoveryDate">Discovery Date</Label>
                      <Input
                        id="discoveryDate"
                        type="date"
                        value={formData.discoveryDate}
                        onChange={(e) => handleInputChange('discoveryDate', e.target.value)}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isOffshore"
                        checked={formData.isOffshore}
                        onCheckedChange={(checked) => handleInputChange('isOffshore', checked)}
                      />
                      <Label htmlFor="isOffshore">Offshore Field</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="geological" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mountain className="w-5 h-5" />
                    <span>Geological Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="basin">Basin</Label>
                      <Input
                        id="basin"
                        value={formData.basin}
                        onChange={(e) => handleInputChange('basin', e.target.value)}
                        placeholder="Geological basin name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="formationName">Formation Name</Label>
                      <Input
                        id="formationName"
                        value={formData.formationName}
                        onChange={(e) => handleInputChange('formationName', e.target.value)}
                        placeholder="Geological formation"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reservoirType">Reservoir Type</Label>
                      <Input
                        id="reservoirType"
                        value={formData.reservoirType}
                        onChange={(e) => handleInputChange('reservoirType', e.target.value)}
                        placeholder="e.g., Sandstone, Carbonate"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="production" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gauge className="w-5 h-5" />
                    <span>Production Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estimatedReserves">
                        Estimated Reserves
                        <span className="text-xs text-muted-foreground ml-2">(MMSTB for oil, BSCF for gas)</span>
                      </Label>
                      <Input
                        id="estimatedReserves"
                        type="number"
                        step="0.01"
                        value={formData.estimatedReserves}
                        onChange={(e) => handleInputChange('estimatedReserves', e.target.value)}
                        placeholder="e.g., 150.5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentProduction">
                        Current Production
                        <span className="text-xs text-muted-foreground ml-2">(BOPD for oil, MMSCFD for gas)</span>
                      </Label>
                      <Input
                        id="currentProduction"
                        type="number"
                        step="0.01"
                        value={formData.currentProduction}
                        onChange={(e) => handleInputChange('currentProduction', e.target.value)}
                        placeholder="e.g., 5000.0"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Production Units Guide</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div>• <strong>Oil Fields:</strong> Reserves in MMSTB (Million Stock Tank Barrels), Production in BOPD (Barrels of Oil Per Day)</div>
                      <div>• <strong>Gas Fields:</strong> Reserves in BSCF (Billion Standard Cubic Feet), Production in MMSCFD (Million Standard Cubic Feet Per Day)</div>
                      <div>• <strong>Mixed Fields:</strong> Use primary hydrocarbon type units</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="geometry" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Field Boundary Geometry</span>
                  </CardTitle>
                  <CardDescription>
                    Upload GeoJSON file containing field boundary polygon (WGS 84 coordinate system)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="geometryFile">
                        Upload Geometry File (GeoJSON Polygon) <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="geometryFile"
                          type="file"
                          accept=".geojson,.json"
                          onChange={handleGeometryUpload}
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" size="sm">
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                      {geometryFile && (
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Geometry file loaded: {geometryFile.name}</span>
                        </div>
                      )}
                    </div>

                    {formData.shape && (
                      <div className="space-y-2">
                        <Label>Geometry Preview</Label>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-sm font-medium mb-2">
                            Type: {formData.shape.type}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {JSON.stringify(formData.shape, null, 2).slice(0, 200)}...
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-amber-50 rounded-lg">
                      <h4 className="font-medium text-amber-900 mb-2">Geometry Requirements</h4>
                      <div className="text-sm text-amber-800 space-y-1">
                        <div>• Field boundaries must be provided as Polygon or MultiPolygon GeoJSON</div>
                        <div>• Coordinates must be in WGS 84 (EPSG:4326) coordinate system</div>
                        <div>• Polygon should represent the actual field boundary or license area</div>
                        <div>• For offshore fields, include subsea boundaries if available</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (field ? 'Update Field' : 'Create Field')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
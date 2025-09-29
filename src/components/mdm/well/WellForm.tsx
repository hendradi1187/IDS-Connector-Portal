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
  Target,
  Gauge
} from 'lucide-react';

interface Well {
  id: string;
  uwi: string;
  wkId: string;
  fieldId?: string;
  wellName: string;
  operator: string;
  currentClass: 'EXPLORATION' | 'DEVELOPMENT' | 'INJECTION' | 'OBSERVATION' | 'STRATIGRAPHIC';
  statusType: 'PRODUCE' | 'INJECT' | 'SUSPENDED' | 'ABANDONED' | 'DRILLING' | 'PLANNED';
  environmentType: 'LAND' | 'MARINE' | 'TRANSITION';
  profileType: 'VERTICAL' | 'HORIZONTAL' | 'DIRECTIONAL' | 'MULTILATERAL';
  spudDate?: string;
  finalDrillDate?: string;
  surfaceLongitude: number;
  surfaceLatitude: number;
  nsUtm?: number;
  ewUtm?: number;
  utmEpsg?: number;
  shape: any;
  totalDepth?: number;
  waterDepth?: number;
  kellyBushingElevation?: number;
}

interface WorkingArea {
  wkId: string;
  wkName: string;
  kkksName: string;
}

interface Field {
  fieldId: string;
  fieldName: string;
  fieldType: string;
}

interface WellFormProps {
  well?: Well | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function WellForm({ well, onSubmit, onCancel }: WellFormProps) {
  const [formData, setFormData] = useState({
    uwi: '',
    wkId: '',
    fieldId: '',
    wellName: '',
    operator: '',
    currentClass: 'EXPLORATION' as 'EXPLORATION' | 'DEVELOPMENT' | 'INJECTION' | 'OBSERVATION' | 'STRATIGRAPHIC',
    statusType: 'PLANNED' as 'PRODUCE' | 'INJECT' | 'SUSPENDED' | 'ABANDONED' | 'DRILLING' | 'PLANNED',
    environmentType: 'LAND' as 'LAND' | 'MARINE' | 'TRANSITION',
    profileType: 'VERTICAL' as 'VERTICAL' | 'HORIZONTAL' | 'DIRECTIONAL' | 'MULTILATERAL',
    spudDate: '',
    finalDrillDate: '',
    surfaceLongitude: '',
    surfaceLatitude: '',
    nsUtm: '',
    ewUtm: '',
    utmEpsg: 4326,
    shape: null as any,
    totalDepth: '',
    waterDepth: '',
    kellyBushingElevation: ''
  });

  const [workingAreas, setWorkingAreas] = useState<WorkingArea[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [validation, setValidation] = useState<{
    uwi?: { valid: boolean; message: string };
  }>({});
  const [loading, setLoading] = useState(false);
  const [geometryFile, setGeometryFile] = useState<File | null>(null);

  // Load working areas and fields
  useEffect(() => {
    const loadData = async () => {
      try {
        const [waResponse, fieldResponse] = await Promise.all([
          fetch('/api/mdm/working-areas?limit=1000'),
          fetch('/api/mdm/fields?limit=1000')
        ]);

        const [waData, fieldData] = await Promise.all([
          waResponse.json(),
          fieldResponse.json()
        ]);

        if (waResponse.ok) {
          setWorkingAreas(waData.data);
        }
        if (fieldResponse.ok) {
          setFields(fieldData.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Pre-fill form if editing
  useEffect(() => {
    if (well) {
      setFormData({
        uwi: well.uwi,
        wkId: well.wkId,
        fieldId: well.fieldId || '',
        wellName: well.wellName,
        operator: well.operator,
        currentClass: well.currentClass,
        statusType: well.statusType,
        environmentType: well.environmentType,
        profileType: well.profileType,
        spudDate: well.spudDate ? well.spudDate.split('T')[0] : '',
        finalDrillDate: well.finalDrillDate ? well.finalDrillDate.split('T')[0] : '',
        surfaceLongitude: well.surfaceLongitude.toString(),
        surfaceLatitude: well.surfaceLatitude.toString(),
        nsUtm: well.nsUtm?.toString() || '',
        ewUtm: well.ewUtm?.toString() || '',
        utmEpsg: well.utmEpsg || 4326,
        shape: well.shape,
        totalDepth: well.totalDepth?.toString() || '',
        waterDepth: well.waterDepth?.toString() || '',
        kellyBushingElevation: well.kellyBushingElevation?.toString() || ''
      });
    }
  }, [well]);

  // Validate UWI
  const validateUwi = async (uwi: string) => {
    if (!uwi) {
      setValidation(prev => ({
        ...prev,
        uwi: { valid: false, message: 'UWI is required' }
      }));
      return;
    }

    try {
      const response = await fetch('/api/mdm/wells/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uwi,
          excludeId: well?.id
        })
      });

      const result = await response.json();
      setValidation(prev => ({
        ...prev,
        uwi: {
          valid: result.valid,
          message: result.valid ? 'UWI is available' : result.error
        }
      }));
    } catch (error) {
      console.error('Error validating UWI:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validate UWI on change
    if (field === 'uwi') {
      validateUwi(value as string);
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

      // For wells, we expect Point geometry
      if (geometry.type !== 'Point') {
        alert('Well geometry must be a Point');
        return;
      }

      setFormData(prev => ({ ...prev, shape: geometry }));

      // Auto-fill coordinates if they match the geometry
      if (geometry.coordinates && geometry.coordinates.length >= 2) {
        setFormData(prev => ({
          ...prev,
          surfaceLongitude: geometry.coordinates[0].toString(),
          surfaceLatitude: geometry.coordinates[1].toString()
        }));
      }
    } catch (error) {
      console.error('Error processing geometry file:', error);
      alert('Error processing geometry file');
    }
  };

  // Generate point geometry from coordinates
  const generatePointGeometry = () => {
    if (formData.surfaceLongitude && formData.surfaceLatitude) {
      const geometry = {
        type: 'Point',
        coordinates: [
          parseFloat(formData.surfaceLongitude),
          parseFloat(formData.surfaceLatitude)
        ]
      };
      setFormData(prev => ({ ...prev, shape: geometry }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      'uwi',
      'wkId',
      'wellName',
      'operator',
      'currentClass',
      'statusType',
      'environmentType',
      'profileType',
      'surfaceLongitude',
      'surfaceLatitude'
    ];

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate UWI
    if (!validation.uwi?.valid) {
      alert('Please provide a valid UWI');
      return;
    }

    // Validate coordinates
    const longitude = parseFloat(formData.surfaceLongitude);
    const latitude = parseFloat(formData.surfaceLatitude);

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      alert('Please provide a valid longitude (-180 to 180)');
      return;
    }

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      alert('Please provide a valid latitude (-90 to 90)');
      return;
    }

    // Generate geometry if not provided
    let geometry = formData.shape;
    if (!geometry) {
      geometry = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
    }

    // Validate dates
    if (formData.spudDate && formData.finalDrillDate) {
      if (new Date(formData.finalDrillDate) < new Date(formData.spudDate)) {
        alert('Final drill date cannot be earlier than spud date');
        return;
      }
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        surfaceLongitude: longitude,
        surfaceLatitude: latitude,
        nsUtm: formData.nsUtm ? parseFloat(formData.nsUtm) : null,
        ewUtm: formData.ewUtm ? parseFloat(formData.ewUtm) : null,
        totalDepth: formData.totalDepth ? parseFloat(formData.totalDepth) : null,
        waterDepth: formData.waterDepth ? parseFloat(formData.waterDepth) : null,
        kellyBushingElevation: formData.kellyBushingElevation ? parseFloat(formData.kellyBushingElevation) : null,
        shape: geometry,
        spudDate: formData.spudDate || null,
        finalDrillDate: formData.finalDrillDate || null,
        fieldId: formData.fieldId || null
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {well ? 'Edit Well' : 'Add New Well'}
          </DialogTitle>
          <DialogDescription>
            {well
              ? 'Update well information and drilling details'
              : 'Enter well information and drilling details'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="classification">Classification</TabsTrigger>
              <TabsTrigger value="drilling">Drilling</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
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
                      <Label htmlFor="uwi">
                        UWI (Unique Well Identifier) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="uwi"
                        value={formData.uwi}
                        onChange={(e) => handleInputChange('uwi', e.target.value.toUpperCase())}
                        placeholder="e.g., WL-2024-001"
                        className={validation.uwi?.valid === false ? 'border-red-500' : ''}
                      />
                      {validation.uwi && (
                        <div className={`flex items-center space-x-1 text-xs ${
                          validation.uwi.valid ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {validation.uwi.valid ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <span>{validation.uwi.message}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wellName">
                        Well Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="wellName"
                        value={formData.wellName}
                        onChange={(e) => handleInputChange('wellName', e.target.value)}
                        placeholder="Well name"
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
                      <Label htmlFor="fieldId">Field (Optional)</Label>
                      <Select value={formData.fieldId} onValueChange={(value) => handleInputChange('fieldId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Field</SelectItem>
                          {fields.map((field) => (
                            <SelectItem key={field.fieldId} value={field.fieldId}>
                              {field.fieldName} ({field.fieldId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classification" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Well Classification</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentClass">
                        Current Class <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.currentClass} onValueChange={(value) => handleInputChange('currentClass', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EXPLORATION">Exploration</SelectItem>
                          <SelectItem value="DEVELOPMENT">Development</SelectItem>
                          <SelectItem value="INJECTION">Injection</SelectItem>
                          <SelectItem value="OBSERVATION">Observation</SelectItem>
                          <SelectItem value="STRATIGRAPHIC">Stratigraphic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="statusType">
                        Status Type <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.statusType} onValueChange={(value) => handleInputChange('statusType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRODUCE">Produce</SelectItem>
                          <SelectItem value="INJECT">Inject</SelectItem>
                          <SelectItem value="SUSPENDED">Suspended</SelectItem>
                          <SelectItem value="ABANDONED">Abandoned</SelectItem>
                          <SelectItem value="DRILLING">Drilling</SelectItem>
                          <SelectItem value="PLANNED">Planned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="environmentType">
                        Environment Type <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.environmentType} onValueChange={(value) => handleInputChange('environmentType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select environment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LAND">Land</SelectItem>
                          <SelectItem value="MARINE">Marine</SelectItem>
                          <SelectItem value="TRANSITION">Transition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profileType">
                        Profile Type <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.profileType} onValueChange={(value) => handleInputChange('profileType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select profile" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VERTICAL">Vertical</SelectItem>
                          <SelectItem value="HORIZONTAL">Horizontal</SelectItem>
                          <SelectItem value="DIRECTIONAL">Directional</SelectItem>
                          <SelectItem value="MULTILATERAL">Multilateral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="drilling" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Drilling Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="spudDate">Spud Date</Label>
                      <Input
                        id="spudDate"
                        type="date"
                        value={formData.spudDate}
                        onChange={(e) => handleInputChange('spudDate', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="finalDrillDate">Final Drill Date</Label>
                      <Input
                        id="finalDrillDate"
                        type="date"
                        value={formData.finalDrillDate}
                        onChange={(e) => handleInputChange('finalDrillDate', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Location Information</span>
                  </CardTitle>
                  <CardDescription>
                    Well surface location coordinates (WGS 84)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="surfaceLongitude">
                        Surface Longitude <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="surfaceLongitude"
                        type="number"
                        step="any"
                        value={formData.surfaceLongitude}
                        onChange={(e) => handleInputChange('surfaceLongitude', e.target.value)}
                        placeholder="e.g., 106.8456"
                        onBlur={generatePointGeometry}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="surfaceLatitude">
                        Surface Latitude <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="surfaceLatitude"
                        type="number"
                        step="any"
                        value={formData.surfaceLatitude}
                        onChange={(e) => handleInputChange('surfaceLatitude', e.target.value)}
                        placeholder="e.g., -6.2088"
                        onBlur={generatePointGeometry}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nsUtm">NS UTM (Optional)</Label>
                      <Input
                        id="nsUtm"
                        type="number"
                        step="any"
                        value={formData.nsUtm}
                        onChange={(e) => handleInputChange('nsUtm', e.target.value)}
                        placeholder="Northing UTM coordinate"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ewUtm">EW UTM (Optional)</Label>
                      <Input
                        id="ewUtm"
                        type="number"
                        step="any"
                        value={formData.ewUtm}
                        onChange={(e) => handleInputChange('ewUtm', e.target.value)}
                        placeholder="Easting UTM coordinate"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="utmEpsg">UTM EPSG Code</Label>
                      <Input
                        id="utmEpsg"
                        type="number"
                        value={formData.utmEpsg}
                        onChange={(e) => handleInputChange('utmEpsg', parseInt(e.target.value))}
                        placeholder="e.g., 32748"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="geometryFile">Upload Geometry File (GeoJSON Point)</Label>
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
                            Coordinates: [{formData.shape.coordinates?.join(', ')}]
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gauge className="w-5 h-5" />
                    <span>Technical Data</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalDepth">Total Depth (m)</Label>
                      <Input
                        id="totalDepth"
                        type="number"
                        step="0.01"
                        value={formData.totalDepth}
                        onChange={(e) => handleInputChange('totalDepth', e.target.value)}
                        placeholder="e.g., 2500.5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="waterDepth">Water Depth (m)</Label>
                      <Input
                        id="waterDepth"
                        type="number"
                        step="0.01"
                        value={formData.waterDepth}
                        onChange={(e) => handleInputChange('waterDepth', e.target.value)}
                        placeholder="e.g., 50.0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="kellyBushingElevation">Kelly Bushing Elevation (m)</Label>
                      <Input
                        id="kellyBushingElevation"
                        type="number"
                        step="0.01"
                        value={formData.kellyBushingElevation}
                        onChange={(e) => handleInputChange('kellyBushingElevation', e.target.value)}
                        placeholder="e.g., 25.0"
                      />
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
              {loading ? 'Saving...' : (well ? 'Update Well' : 'Create Well')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
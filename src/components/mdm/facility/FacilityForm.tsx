'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MapPin, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FacilityFormProps {
  facility?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
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

const FACILITY_TYPES = [
  'PIPELINE',
  'PLATFORM',
  'FLOATING_FACILITY',
  'PROCESSING_PLANT',
  'INJECTION_FACILITY',
  'COMPRESSION_STATION',
  'PUMPING_STATION',
  'METERING_STATION',
  'TERMINAL',
  'STORAGE_TANK'
];

const FACILITY_STATUS = [
  'PLANNED',
  'UNDER_CONSTRUCTION',
  'OPERATIONAL',
  'SUSPENDED',
  'ABANDONED',
  'DECOMMISSIONED'
];

const FLUID_TYPES = [
  'OIL',
  'GAS',
  'WATER',
  'CONDENSATE',
  'MIXED'
];

export default function FacilityForm({ facility, onSubmit, onCancel, isLoading }: FacilityFormProps) {
  const [formData, setFormData] = useState({
    facilityId: '',
    facilityName: '',
    facilityType: '',
    subType: '',
    wkId: '',
    fieldId: '',
    operator: '',
    status: '',
    installationDate: '',
    commissioningDate: '',
    // Pipeline specific
    diameter: '',
    length: '',
    fluidType: '',
    // Platform specific
    capacityProd: '',
    waterDepth: '',
    noOfWell: '',
    // Floating facility specific
    vesselCapacity: '',
    // Processing plant specific
    storageCapacity: '',
    plantCapacity: '',
    power: '',
    // Coordinates
    longitude: '',
    latitude: '',
    shape: ''
  });

  const [workingAreas, setWorkingAreas] = useState<WorkingArea[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [validationMessage, setValidationMessage] = useState('');
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    fetchWorkingAreas();
    fetchFields();

    if (facility) {
      setFormData({
        facilityId: facility.facilityId || '',
        facilityName: facility.facilityName || '',
        facilityType: facility.facilityType || '',
        subType: facility.subType || '',
        wkId: facility.wkId || '',
        fieldId: facility.fieldId || '',
        operator: facility.operator || '',
        status: facility.status || '',
        installationDate: facility.installationDate ? facility.installationDate.split('T')[0] : '',
        commissioningDate: facility.commissioningDate ? facility.commissioningDate.split('T')[0] : '',
        diameter: facility.diameter?.toString() || '',
        length: facility.length?.toString() || '',
        fluidType: facility.fluidType || '',
        capacityProd: facility.capacityProd?.toString() || '',
        waterDepth: facility.waterDepth?.toString() || '',
        noOfWell: facility.noOfWell?.toString() || '',
        vesselCapacity: facility.vesselCapacity?.toString() || '',
        storageCapacity: facility.storageCapacity?.toString() || '',
        plantCapacity: facility.plantCapacity?.toString() || '',
        power: facility.power?.toString() || '',
        longitude: facility.longitude?.toString() || '',
        latitude: facility.latitude?.toString() || '',
        shape: facility.shape || ''
      });
    }
  }, [facility]);

  const fetchWorkingAreas = async () => {
    try {
      const response = await fetch('/api/mdm/working-areas?limit=1000');
      const data = await response.json();
      setWorkingAreas(data.data || []);
    } catch (error) {
      console.error('Error fetching working areas:', error);
    }
  };

  const fetchFields = async () => {
    try {
      const response = await fetch('/api/mdm/fields?limit=1000');
      const data = await response.json();
      setFields(data.data || []);
    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };

  const validateFacilityId = async (facilityId: string) => {
    if (!facilityId) return;

    setValidating(true);
    try {
      const response = await fetch('/api/mdm/facilities/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId,
          excludeId: facility?.id
        })
      });

      const result = await response.json();

      if (!result.valid) {
        setValidationMessage(result.error);
        setErrors(prev => ({ ...prev, facilityId: result.error }));
      } else {
        setValidationMessage('');
        setErrors(prev => ({ ...prev, facilityId: undefined }));
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setValidating(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'facilityId' && value) {
      const debounceTimer = setTimeout(() => {
        validateFacilityId(value);
      }, 500);

      return () => clearTimeout(debounceTimer);
    }

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Required fields
    if (!formData.facilityId) newErrors.facilityId = 'FACILITY_ID is required';
    if (!formData.facilityName) newErrors.facilityName = 'Facility Name is required';
    if (!formData.facilityType) newErrors.facilityType = 'Facility Type is required';
    if (!formData.wkId) newErrors.wkId = 'Working Area is required';
    if (!formData.operator) newErrors.operator = 'Operator is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.shape) newErrors.shape = 'Geometry Shape is required';

    // Date validation
    if (formData.installationDate && formData.commissioningDate) {
      const installDate = new Date(formData.installationDate);
      const commissionDate = new Date(formData.commissioningDate);
      if (commissionDate < installDate) {
        newErrors.commissioningDate = 'Commissioning date cannot be earlier than installation date';
      }
    }

    // Coordinate validation
    if (formData.longitude && (parseFloat(formData.longitude) < -180 || parseFloat(formData.longitude) > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }
    if (formData.latitude && (parseFloat(formData.latitude) < -90 || parseFloat(formData.latitude) > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submissionData = {
      ...formData,
      // Convert numeric fields
      diameter: formData.diameter ? parseFloat(formData.diameter) : null,
      length: formData.length ? parseFloat(formData.length) : null,
      capacityProd: formData.capacityProd ? parseFloat(formData.capacityProd) : null,
      waterDepth: formData.waterDepth ? parseFloat(formData.waterDepth) : null,
      noOfWell: formData.noOfWell ? parseInt(formData.noOfWell) : null,
      vesselCapacity: formData.vesselCapacity ? parseFloat(formData.vesselCapacity) : null,
      storageCapacity: formData.storageCapacity ? parseFloat(formData.storageCapacity) : null,
      plantCapacity: formData.plantCapacity ? parseFloat(formData.plantCapacity) : null,
      power: formData.power ? parseFloat(formData.power) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      // Convert dates
      installationDate: formData.installationDate || null,
      commissioningDate: formData.commissioningDate || null,
      // Empty strings to null
      subType: formData.subType || null,
      fieldId: formData.fieldId || null,
      fluidType: formData.fluidType || null
    };

    onSubmit(submissionData);
  };

  const renderPipelineFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="diameter">Diameter (inches)</Label>
        <Input
          id="diameter"
          type="number"
          step="0.1"
          value={formData.diameter}
          onChange={(e) => handleChange('diameter', e.target.value)}
          placeholder="e.g., 24.0"
        />
      </div>
      <div>
        <Label htmlFor="length">Length (km)</Label>
        <Input
          id="length"
          type="number"
          step="0.1"
          value={formData.length}
          onChange={(e) => handleChange('length', e.target.value)}
          placeholder="e.g., 150.5"
        />
      </div>
      <div>
        <Label htmlFor="fluidType">Fluid Type</Label>
        <Select value={formData.fluidType} onValueChange={(value) => handleChange('fluidType', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select fluid type" />
          </SelectTrigger>
          <SelectContent>
            {FLUID_TYPES.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderPlatformFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="capacityProd">Production Capacity (BOPD)</Label>
        <Input
          id="capacityProd"
          type="number"
          step="0.1"
          value={formData.capacityProd}
          onChange={(e) => handleChange('capacityProd', e.target.value)}
          placeholder="e.g., 10000"
        />
      </div>
      <div>
        <Label htmlFor="waterDepth">Water Depth (m)</Label>
        <Input
          id="waterDepth"
          type="number"
          step="0.1"
          value={formData.waterDepth}
          onChange={(e) => handleChange('waterDepth', e.target.value)}
          placeholder="e.g., 150.5"
        />
      </div>
      <div>
        <Label htmlFor="noOfWell">Number of Wells</Label>
        <Input
          id="noOfWell"
          type="number"
          value={formData.noOfWell}
          onChange={(e) => handleChange('noOfWell', e.target.value)}
          placeholder="e.g., 12"
        />
      </div>
    </div>
  );

  const renderFloatingFacilityFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="vesselCapacity">Vessel Capacity (m³)</Label>
        <Input
          id="vesselCapacity"
          type="number"
          step="0.1"
          value={formData.vesselCapacity}
          onChange={(e) => handleChange('vesselCapacity', e.target.value)}
          placeholder="e.g., 50000"
        />
      </div>
      <div>
        <Label htmlFor="waterDepth">Water Depth (m)</Label>
        <Input
          id="waterDepth"
          type="number"
          step="0.1"
          value={formData.waterDepth}
          onChange={(e) => handleChange('waterDepth', e.target.value)}
          placeholder="e.g., 200.0"
        />
      </div>
    </div>
  );

  const renderProcessingPlantFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="plantCapacity">Plant Capacity (BOPD)</Label>
        <Input
          id="plantCapacity"
          type="number"
          step="0.1"
          value={formData.plantCapacity}
          onChange={(e) => handleChange('plantCapacity', e.target.value)}
          placeholder="e.g., 50000"
        />
      </div>
      <div>
        <Label htmlFor="storageCapacity">Storage Capacity (BBL)</Label>
        <Input
          id="storageCapacity"
          type="number"
          step="0.1"
          value={formData.storageCapacity}
          onChange={(e) => handleChange('storageCapacity', e.target.value)}
          placeholder="e.g., 100000"
        />
      </div>
      <div>
        <Label htmlFor="power">Power (MW)</Label>
        <Input
          id="power"
          type="number"
          step="0.1"
          value={formData.power}
          onChange={(e) => handleChange('power', e.target.value)}
          placeholder="e.g., 25.5"
        />
      </div>
    </div>
  );

  const renderTechnicalFields = () => {
    switch (formData.facilityType) {
      case 'PIPELINE':
        return renderPipelineFields();
      case 'PLATFORM':
        return renderPlatformFields();
      case 'FLOATING_FACILITY':
        return renderFloatingFacilityFields();
      case 'PROCESSING_PLANT':
      case 'TERMINAL':
        return renderProcessingPlantFields();
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Select a facility type to see technical specifications
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="dates">Dates</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facilityId">
                    FACILITY_ID <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="facilityId"
                      value={formData.facilityId}
                      onChange={(e) => handleChange('facilityId', e.target.value.toUpperCase())}
                      placeholder="e.g., FAC-001"
                      className={errors.facilityId ? 'border-red-500' : ''}
                    />
                    {validating && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                    )}
                  </div>
                  {errors.facilityId && (
                    <p className="text-sm text-red-500 mt-1">{errors.facilityId}</p>
                  )}
                  {validationMessage && !errors.facilityId && (
                    <p className="text-sm text-green-600 mt-1">{validationMessage}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="facilityName">
                    Facility Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="facilityName"
                    value={formData.facilityName}
                    onChange={(e) => handleChange('facilityName', e.target.value)}
                    placeholder="e.g., Main Production Platform"
                    className={errors.facilityName ? 'border-red-500' : ''}
                  />
                  {errors.facilityName && (
                    <p className="text-sm text-red-500 mt-1">{errors.facilityName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facilityType">
                    Facility Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.facilityType}
                    onValueChange={(value) => handleChange('facilityType', value)}
                  >
                    <SelectTrigger className={errors.facilityType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select facility type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FACILITY_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.facilityType && (
                    <p className="text-sm text-red-500 mt-1">{errors.facilityType}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="subType">Sub Type</Label>
                  <Input
                    id="subType"
                    value={formData.subType}
                    onChange={(e) => handleChange('subType', e.target.value)}
                    placeholder="e.g., Fixed Platform, FPSO"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wkId">
                    Working Area <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.wkId}
                    onValueChange={(value) => handleChange('wkId', value)}
                  >
                    <SelectTrigger className={errors.wkId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select working area" />
                    </SelectTrigger>
                    <SelectContent>
                      {workingAreas.map(wa => (
                        <SelectItem key={wa.wkId} value={wa.wkId}>
                          {wa.wkId} - {wa.wkName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.wkId && (
                    <p className="text-sm text-red-500 mt-1">{errors.wkId}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="fieldId">Field (Optional)</Label>
                  <Select
                    value={formData.fieldId}
                    onValueChange={(value) => handleChange('fieldId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Field</SelectItem>
                      {fields.map(field => (
                        <SelectItem key={field.fieldId} value={field.fieldId}>
                          {field.fieldId} - {field.fieldName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="operator">
                    Operator <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="operator"
                    value={formData.operator}
                    onChange={(e) => handleChange('operator', e.target.value)}
                    placeholder="e.g., PT. Pertamina"
                    className={errors.operator ? 'border-red-500' : ''}
                  />
                  {errors.operator && (
                    <p className="text-sm text-red-500 mt-1">{errors.operator}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {FACILITY_STATUS.map(status => (
                        <SelectItem key={status} value={status}>
                          <Badge variant={
                            status === 'OPERATIONAL' ? 'default' :
                            status === 'UNDER_CONSTRUCTION' ? 'secondary' :
                            status === 'PLANNED' ? 'outline' : 'destructive'
                          }>
                            {status.replace(/_/g, ' ')}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500 mt-1">{errors.status}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTechnicalFields()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Geometry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="longitude">Longitude (WGS 84)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleChange('longitude', e.target.value)}
                    placeholder="e.g., 107.123456"
                    className={errors.longitude ? 'border-red-500' : ''}
                  />
                  {errors.longitude && (
                    <p className="text-sm text-red-500 mt-1">{errors.longitude}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="latitude">Latitude (WGS 84)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleChange('latitude', e.target.value)}
                    placeholder="e.g., -6.123456"
                    className={errors.latitude ? 'border-red-500' : ''}
                  />
                  {errors.latitude && (
                    <p className="text-sm text-red-500 mt-1">{errors.latitude}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="shape">
                  Geometry Shape (GeoJSON) <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="shape"
                  value={formData.shape}
                  onChange={(e) => handleChange('shape', e.target.value)}
                  placeholder='{"type":"Point","coordinates":[107.123456,-6.123456]}'
                  rows={4}
                  className={errors.shape ? 'border-red-500' : ''}
                />
                {errors.shape && (
                  <p className="text-sm text-red-500 mt-1">{errors.shape}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Enter GeoJSON geometry (Point, LineString, or Polygon)
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Coordinates should be in WGS 84 (EPSG:4326) coordinate system.
                  For Indonesia: Longitude ~95°-141°E, Latitude ~6°N-11°S
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Installation & Commissioning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="installationDate">Installation Date</Label>
                  <Input
                    id="installationDate"
                    type="date"
                    value={formData.installationDate}
                    onChange={(e) => handleChange('installationDate', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="commissioningDate">Commissioning Date</Label>
                  <Input
                    id="commissioningDate"
                    type="date"
                    value={formData.commissioningDate}
                    onChange={(e) => handleChange('commissioningDate', e.target.value)}
                    className={errors.commissioningDate ? 'border-red-500' : ''}
                  />
                  {errors.commissioningDate && (
                    <p className="text-sm text-red-500 mt-1">{errors.commissioningDate}</p>
                  )}
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Commissioning date should be on or after the installation date
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || Object.keys(errors).length > 0}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {facility ? 'Update Facility' : 'Create Facility'}
        </Button>
      </div>
    </form>
  );
}
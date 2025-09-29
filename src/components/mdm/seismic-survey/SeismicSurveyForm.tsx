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
  Info
} from 'lucide-react';

interface SeismicSurvey {
  id: string;
  seisAcqtnSurveyId: string;
  acqtnSurveyName: string;
  baLongName: string;
  wkId: string;
  projectId?: string;
  projectLevel?: string;
  startDate?: string;
  completedDate?: string;
  shotBy?: string;
  seisDimension: 'TWO_D' | 'THREE_D';
  environment: 'MARINE' | 'LAND' | 'TRANSITION';
  seisLineType: string;
  crsRemark: string;
  shape: any;
  shapeArea?: number;
  shapeLength?: number;
  crsEpsg: number;
  dataQuality?: string;
  processingStatus?: string;
}

interface WorkingArea {
  wkId: string;
  wkName: string;
  kkksName: string;
}

interface SeismicSurveyFormProps {
  survey?: SeismicSurvey | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function SeismicSurveyForm({ survey, onSubmit, onCancel }: SeismicSurveyFormProps) {
  const [formData, setFormData] = useState({
    seisAcqtnSurveyId: '',
    acqtnSurveyName: '',
    baLongName: '',
    wkId: '',
    projectId: '',
    projectLevel: '',
    startDate: '',
    completedDate: '',
    shotBy: '',
    seisDimension: 'TWO_D' as 'TWO_D' | 'THREE_D',
    environment: 'MARINE' as 'MARINE' | 'LAND' | 'TRANSITION',
    seisLineType: '',
    crsRemark: 'WGS 84, EPSG:4326',
    shape: null as any,
    shapeArea: '',
    shapeLength: '',
    crsEpsg: 4326,
    dataQuality: '',
    processingStatus: ''
  });

  const [workingAreas, setWorkingAreas] = useState<WorkingArea[]>([]);
  const [validation, setValidation] = useState<{
    seisAcqtnSurveyId?: { valid: boolean; message: string };
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
    if (survey) {
      setFormData({
        seisAcqtnSurveyId: survey.seisAcqtnSurveyId,
        acqtnSurveyName: survey.acqtnSurveyName,
        baLongName: survey.baLongName,
        wkId: survey.wkId,
        projectId: survey.projectId || '',
        projectLevel: survey.projectLevel || '',
        startDate: survey.startDate ? survey.startDate.split('T')[0] : '',
        completedDate: survey.completedDate ? survey.completedDate.split('T')[0] : '',
        shotBy: survey.shotBy || '',
        seisDimension: survey.seisDimension,
        environment: survey.environment,
        seisLineType: survey.seisLineType,
        crsRemark: survey.crsRemark,
        shape: survey.shape,
        shapeArea: survey.shapeArea?.toString() || '',
        shapeLength: survey.shapeLength?.toString() || '',
        crsEpsg: survey.crsEpsg,
        dataQuality: survey.dataQuality || '',
        processingStatus: survey.processingStatus || ''
      });
    }
  }, [survey]);

  // Validate seisAcqtnSurveyId
  const validateSurveyId = async (id: string) => {
    if (!id) {
      setValidation(prev => ({
        ...prev,
        seisAcqtnSurveyId: { valid: false, message: 'Survey ID is required' }
      }));
      return;
    }

    try {
      const response = await fetch('/api/mdm/seismic-surveys/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seisAcqtnSurveyId: id,
          excludeId: survey?.id
        })
      });

      const result = await response.json();
      setValidation(prev => ({
        ...prev,
        seisAcqtnSurveyId: {
          valid: result.valid,
          message: result.valid ? 'Survey ID is available' : result.error
        }
      }));
    } catch (error) {
      console.error('Error validating survey ID:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validate survey ID on change
    if (field === 'seisAcqtnSurveyId') {
      validateSurveyId(value);
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
      'seisAcqtnSurveyId',
      'acqtnSurveyName',
      'baLongName',
      'wkId',
      'seisDimension',
      'environment',
      'seisLineType'
    ];

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate survey ID
    if (!validation.seisAcqtnSurveyId?.valid) {
      alert('Please provide a valid Survey ID');
      return;
    }

    // Validate geometry
    if (!formData.shape) {
      alert('Please provide geometry data');
      return;
    }

    // Validate dates
    if (formData.startDate && formData.completedDate) {
      if (new Date(formData.completedDate) < new Date(formData.startDate)) {
        alert('Completed date cannot be earlier than start date');
        return;
      }
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        shapeArea: formData.shapeArea ? parseFloat(formData.shapeArea) : null,
        shapeLength: formData.shapeLength ? parseFloat(formData.shapeLength) : null,
        startDate: formData.startDate || null,
        completedDate: formData.completedDate || null
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  // Seismic line types
  const seisLineTypes = [
    'REGULAR',
    'IRREGULAR',
    'PARALLEL',
    'RADIAL',
    'GRID',
    'RANDOM'
  ];

  // Project levels
  const projectLevels = [
    'EXPLORATION',
    'APPRAISAL',
    'DEVELOPMENT',
    'PRODUCTION'
  ];

  // Data quality options
  const dataQualityOptions = [
    'EXCELLENT',
    'GOOD',
    'FAIR',
    'POOR'
  ];

  // Processing status options
  const processingStatusOptions = [
    'RAW',
    'PROCESSED',
    'REPROCESSED',
    'FINAL'
  ];

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {survey ? 'Edit Seismic Survey' : 'Add New Seismic Survey'}
          </DialogTitle>
          <DialogDescription>
            {survey
              ? 'Update seismic survey information and acquisition details'
              : 'Enter seismic survey information and acquisition details'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="project">Project Details</TabsTrigger>
              <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
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
                      <Label htmlFor="seisAcqtnSurveyId">
                        Survey ID <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="seisAcqtnSurveyId"
                        value={formData.seisAcqtnSurveyId}
                        onChange={(e) => handleInputChange('seisAcqtnSurveyId', e.target.value.toUpperCase())}
                        placeholder="e.g., SEIS-2024-001"
                        className={validation.seisAcqtnSurveyId?.valid === false ? 'border-red-500' : ''}
                      />
                      {validation.seisAcqtnSurveyId && (
                        <div className={`flex items-center space-x-1 text-xs ${
                          validation.seisAcqtnSurveyId.valid ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {validation.seisAcqtnSurveyId.valid ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <span>{validation.seisAcqtnSurveyId.message}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="acqtnSurveyName">
                        Survey Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="acqtnSurveyName"
                        value={formData.acqtnSurveyName}
                        onChange={(e) => handleInputChange('acqtnSurveyName', e.target.value)}
                        placeholder="Survey name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="baLongName">
                        KKKS Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="baLongName"
                        value={formData.baLongName}
                        onChange={(e) => handleInputChange('baLongName', e.target.value)}
                        placeholder="KKKS company name"
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="project" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5" />
                    <span>Project Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="projectId">Project ID</Label>
                      <Input
                        id="projectId"
                        value={formData.projectId}
                        onChange={(e) => handleInputChange('projectId', e.target.value)}
                        placeholder="Project identifier"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="projectLevel">Project Level</Label>
                      <Select value={formData.projectLevel} onValueChange={(value) => handleInputChange('projectLevel', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project level" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="completedDate">Completed Date</Label>
                      <Input
                        id="completedDate"
                        type="date"
                        value={formData.completedDate}
                        onChange={(e) => handleInputChange('completedDate', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="acquisition" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Acquisition Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shotBy">Acquisition Company</Label>
                      <Input
                        id="shotBy"
                        value={formData.shotBy}
                        onChange={(e) => handleInputChange('shotBy', e.target.value)}
                        placeholder="Company that shot the survey"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seisDimension">
                        Survey Dimension <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.seisDimension} onValueChange={(value) => handleInputChange('seisDimension', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select dimension" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TWO_D">2D</SelectItem>
                          <SelectItem value="THREE_D">3D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="environment">
                        Environment <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.environment} onValueChange={(value) => handleInputChange('environment', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select environment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MARINE">Marine</SelectItem>
                          <SelectItem value="LAND">Land</SelectItem>
                          <SelectItem value="TRANSITION">Transition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seisLineType">
                        Line Type <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.seisLineType} onValueChange={(value) => handleInputChange('seisLineType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select line type" />
                        </SelectTrigger>
                        <SelectContent>
                          {seisLineTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataQuality">Data Quality</Label>
                      <Select value={formData.dataQuality} onValueChange={(value) => handleInputChange('dataQuality', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select data quality" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataQualityOptions.map((quality) => (
                            <SelectItem key={quality} value={quality}>
                              {quality}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="processingStatus">Processing Status</Label>
                      <Select value={formData.processingStatus} onValueChange={(value) => handleInputChange('processingStatus', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select processing status" />
                        </SelectTrigger>
                        <SelectContent>
                          {processingStatusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <span>Geometry Information</span>
                  </CardTitle>
                  <CardDescription>
                    Upload GeoJSON file or enter geometry data (WGS 84 coordinate system)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="geometryFile">Upload Geometry File (GeoJSON)</Label>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="crsRemark">CRS Remark</Label>
                        <Input
                          id="crsRemark"
                          value={formData.crsRemark}
                          onChange={(e) => handleInputChange('crsRemark', e.target.value)}
                          placeholder="WGS 84, EPSG:4326"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shapeArea">Shape Area (sq km)</Label>
                        <Input
                          id="shapeArea"
                          type="number"
                          step="0.01"
                          value={formData.shapeArea}
                          onChange={(e) => handleInputChange('shapeArea', e.target.value)}
                          placeholder="Area in square kilometers"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shapeLength">Shape Length (km)</Label>
                        <Input
                          id="shapeLength"
                          type="number"
                          step="0.01"
                          value={formData.shapeLength}
                          onChange={(e) => handleInputChange('shapeLength', e.target.value)}
                          placeholder="Length in kilometers"
                        />
                      </div>
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
              {loading ? 'Saving...' : (survey ? 'Update Survey' : 'Create Survey')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
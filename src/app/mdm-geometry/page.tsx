'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import GeometryManager from '@/components/mdm/geometry/GeometryManager';
import GeometryInput from '@/components/ui/geometry-input';
import CoordinatePicker from '@/components/ui/coordinate-picker';
import {
  Globe,
  MapPin,
  Shapes,
  FileText,
  Download,
  Info,
  Compass,
  Ruler,
  Settings
} from 'lucide-react';

export default function MDMGeometryPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [facilityType, setFacilityType] = useState<string>('');
  const [surveyDimension, setSurveyDimension] = useState<string>('');
  const [activeDemo, setActiveDemo] = useState('manager');

  const domains = [
    { value: 'workingArea', label: 'Working Area (Wilayah Kerja)' },
    { value: 'well', label: 'Well (Sumur)' },
    { value: 'field', label: 'Field (Lapangan)' },
    { value: 'facility', label: 'Facility (Fasilitas)' },
    { value: 'seismicSurvey', label: 'Seismic Survey (Survei Seismik)' }
  ];

  const facilityTypes = [
    { value: 'PIPELINE', label: 'Pipeline' },
    { value: 'PLATFORM', label: 'Platform' },
    { value: 'PROCESSING_PLANT', label: 'Processing Plant' },
    { value: 'STORAGE_TANK', label: 'Storage Tank' }
  ];

  const surveyDimensions = [
    { value: '2D', label: '2D Survey' },
    { value: '3D', label: '3D Survey' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6" />
            MDM Geometry Management System
          </CardTitle>
          <p className="text-muted-foreground">
            Comprehensive geometry input and management system untuk MDM Hulu Migas dengan dukungan WGS 84 (EPSG:4326)
          </p>
        </CardHeader>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Domain</Label>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map(domain => (
                    <SelectItem key={domain.value} value={domain.value}>
                      {domain.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDomain === 'facility' && (
              <div>
                <Label>Facility Type</Label>
                <Select value={facilityType} onValueChange={setFacilityType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility type" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilityTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedDomain === 'seismicSurvey' && (
              <div>
                <Label>Survey Dimension</Label>
                <Select value={surveyDimension} onValueChange={setSurveyDimension}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dimension" />
                  </SelectTrigger>
                  <SelectContent>
                    {surveyDimensions.map(dim => (
                      <SelectItem key={dim.value} value={dim.value}>
                        {dim.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="manager">Geometry Manager</TabsTrigger>
          <TabsTrigger value="input">Geometry Input</TabsTrigger>
          <TabsTrigger value="coordinates">Coordinate Picker</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        {/* Geometry Manager Demo */}
        <TabsContent value="manager">
          {selectedDomain ? (
            <GeometryManager
              domain={selectedDomain as any}
              facilityType={facilityType}
              surveyDimension={surveyDimension}
              onGeometryChange={(geometry) => console.log('Geometry changed:', geometry)}
              onCoordinatesChange={(lng, lat) => console.log('Coordinates changed:', lng, lat)}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Shapes className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Domain</h3>
                <p className="text-muted-foreground">
                  Choose a domain from the configuration above to start using the Geometry Manager
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Geometry Input Demo */}
        <TabsContent value="input">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shapes className="h-5 w-5" />
                Geometry Input Component Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GeometryInput
                onChange={(geometry) => console.log('Demo geometry:', geometry)}
                geometryType={selectedDomain === 'well' ? 'Point' : 'any'}
                domain={selectedDomain}
                label="Sample Geometry Input"
                placeholder="Enter geometry in GeoJSON format"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coordinate Picker Demo */}
        <TabsContent value="coordinates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Coordinate Picker Component Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CoordinatePicker
                onCoordinateChange={(lng, lat) => console.log('Demo coordinates:', lng, lat)}
                showDMS={true}
                label="Sample Coordinate Picker"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation */}
        <TabsContent value="documentation" className="space-y-4">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                MDM Geometry Management System menyediakan interface yang komprehensif untuk input, validasi,
                dan manajemen data geometri sesuai dengan SKK Migas Data Specification v2.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Key Features:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• WGS 84 (EPSG:4326) coordinate system support</li>
                    <li>• Multiple input methods (manual, JSON, file upload)</li>
                    <li>• Domain-specific geometry validation</li>
                    <li>• Real-time coordinate validation</li>
                    <li>• Geometry statistics calculation</li>
                    <li>• GeoJSON export functionality</li>
                    <li>• Indonesia-specific coordinate ranges</li>
                    <li>• Interactive coordinate picker</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Supported Geometries:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Point (Wells, single locations)</li>
                    <li>• LineString (Pipelines, 2D seismic lines)</li>
                    <li>• Polygon (Fields, working areas, 3D surveys)</li>
                    <li>• MultiPolygon (Complex boundaries)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domain Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5" />
                Domain Geometry Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {domains.map(domain => (
                  <div key={domain.value} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{domain.label}</Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-medium">Geometry Type</Label>
                        <p className="text-sm text-muted-foreground">
                          {domain.value === 'well' && 'Point - Exact surface location'}
                          {domain.value === 'workingArea' && 'Polygon/MultiPolygon - Administrative boundary'}
                          {domain.value === 'field' && 'Polygon/MultiPolygon - Field boundary based on geology'}
                          {domain.value === 'facility' && 'Point/LineString/Polygon - Depends on facility type'}
                          {domain.value === 'seismicSurvey' && 'LineString (2D) / Polygon (3D) - Survey coverage'}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Validation Rules</Label>
                        <p className="text-sm text-muted-foreground">
                          {domain.value === 'well' && 'Must be within working area boundary'}
                          {domain.value === 'workingArea' && 'Must be closed polygon, reasonable area size'}
                          {domain.value === 'field' && 'Must be within working area, geological boundaries'}
                          {domain.value === 'facility' && 'Pipeline=LineString, others flexible geometry'}
                          {domain.value === 'seismicSurvey' && '2D=LineString, 3D=Polygon, within working area'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Coordinate System</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li><strong>Primary:</strong> WGS 84 (EPSG:4326)</li>
                    <li><strong>Format:</strong> Decimal degrees</li>
                    <li><strong>Longitude:</strong> -180° to 180°</li>
                    <li><strong>Latitude:</strong> -90° to 90°</li>
                    <li><strong>Indonesia Range:</strong> 95°E-141°E, 6°N-11°S</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Data Formats</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li><strong>Input:</strong> GeoJSON, Decimal degrees, DMS</li>
                    <li><strong>Output:</strong> GeoJSON Feature/Geometry</li>
                    <li><strong>File Support:</strong> .json, .geojson</li>
                    <li><strong>Validation:</strong> Real-time geometry validation</li>
                    <li><strong>Export:</strong> GeoJSON with metadata</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> Geometry calculations (area, length, perimeter) are approximations
                  using simplified formulas. For precise surveying and legal purposes, use specialized GIS software.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Integration Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">GeometryInput Component</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<GeometryInput
  value={geometry}
  onChange={handleGeometryChange}
  geometryType="Polygon"
  domain="workingArea"
  label="Working Area Boundary"
  required={true}
/>`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">CoordinatePicker Component</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<CoordinatePicker
  longitude={107.123456}
  latitude={-6.123456}
  onCoordinateChange={handleCoordinateChange}
  showDMS={true}
  required={true}
/>`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">GeometryManager Component</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<GeometryManager
  domain="facility"
  facilityType="PIPELINE"
  onGeometryChange={handleGeometryChange}
  onCoordinatesChange={handleCoordinatesChange}
  initialGeometry={existingGeometry}
/>`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
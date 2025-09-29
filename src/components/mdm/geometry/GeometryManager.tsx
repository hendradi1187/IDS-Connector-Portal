'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import GeometryInput from '@/components/ui/geometry-input';
import CoordinatePicker from '@/components/ui/coordinate-picker';
import {
  MapPin,
  Shapes,
  Globe,
  Calculator,
  FileText,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';

interface GeometryManagerProps {
  domain?: 'workingArea' | 'seismicSurvey' | 'well' | 'field' | 'facility';
  facilityType?: string; // For facility-specific geometry validation
  surveyDimension?: string; // For seismic survey geometry validation
  onGeometryChange?: (geometry: string) => void;
  onCoordinatesChange?: (lng: number, lat: number) => void;
  initialGeometry?: string;
  initialLongitude?: number;
  initialLatitude?: number;
  className?: string;
}

interface GeometryStats {
  area?: number;
  length?: number;
  perimeter?: number;
  centroid?: [number, number];
}

export default function GeometryManager({
  domain,
  facilityType,
  surveyDimension,
  onGeometryChange,
  onCoordinatesChange,
  initialGeometry = '',
  initialLongitude = 107.0,
  initialLatitude = -6.0,
  className = ''
}: GeometryManagerProps) {
  const [activeTab, setActiveTab] = useState('geometry');
  const [currentGeometry, setCurrentGeometry] = useState(initialGeometry);
  const [currentLng, setCurrentLng] = useState(initialLongitude);
  const [currentLat, setCurrentLat] = useState(initialLatitude);
  const [geometryStats, setGeometryStats] = useState<GeometryStats>({});
  const [isCalculating, setIsCalculating] = useState(false);

  // Determine allowed geometry types based on domain and context
  const getAllowedGeometryType = (): 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon' | 'any' => {
    switch (domain) {
      case 'well':
        return 'Point';
      case 'seismicSurvey':
        if (surveyDimension === '2D') return 'LineString';
        if (surveyDimension === '3D') return 'Polygon';
        return 'any';
      case 'field':
      case 'workingArea':
        return 'Polygon';
      case 'facility':
        if (facilityType === 'PIPELINE') return 'LineString';
        return 'any';
      default:
        return 'any';
    }
  };

  const handleGeometryChange = (geometry: string) => {
    setCurrentGeometry(geometry);
    calculateGeometryStats(geometry);

    // Extract coordinates for coordinate picker if it's a Point
    try {
      const geom = JSON.parse(geometry);
      if (geom.type === 'Point') {
        setCurrentLng(geom.coordinates[0]);
        setCurrentLat(geom.coordinates[1]);
      }
    } catch (e) {
      // Invalid JSON, ignore
    }

    if (onGeometryChange) {
      onGeometryChange(geometry);
    }
  };

  const handleCoordinateChange = (lng: number, lat: number) => {
    setCurrentLng(lng);
    setCurrentLat(lat);

    // Create Point geometry from coordinates
    const pointGeometry = {
      type: 'Point',
      coordinates: [lng, lat]
    };

    const geometryString = JSON.stringify(pointGeometry, null, 2);
    setCurrentGeometry(geometryString);

    if (onCoordinatesChange) {
      onCoordinatesChange(lng, lat);
    }

    if (onGeometryChange) {
      onGeometryChange(geometryString);
    }
  };

  const calculateGeometryStats = async (geometryString: string) => {
    if (!geometryString.trim()) return;

    setIsCalculating(true);
    try {
      const geometry = JSON.parse(geometryString);
      const stats: GeometryStats = {};

      // Calculate basic statistics based on geometry type
      switch (geometry.type) {
        case 'Point':
          stats.centroid = [geometry.coordinates[0], geometry.coordinates[1]];
          break;

        case 'LineString':
          stats.length = calculateLineStringLength(geometry.coordinates);
          stats.centroid = calculateLineStringCentroid(geometry.coordinates);
          break;

        case 'Polygon':
          stats.area = calculatePolygonArea(geometry.coordinates[0]);
          stats.perimeter = calculatePolygonPerimeter(geometry.coordinates[0]);
          stats.centroid = calculatePolygonCentroid(geometry.coordinates[0]);
          break;

        case 'MultiPolygon':
          // Sum up all polygons
          let totalArea = 0;
          let totalPerimeter = 0;
          geometry.coordinates.forEach((polygon: number[][][]) => {
            totalArea += calculatePolygonArea(polygon[0]);
            totalPerimeter += calculatePolygonPerimeter(polygon[0]);
          });
          stats.area = totalArea;
          stats.perimeter = totalPerimeter;
          break;
      }

      setGeometryStats(stats);
    } catch (e) {
      console.error('Error calculating geometry stats:', e);
      setGeometryStats({});
    } finally {
      setIsCalculating(false);
    }
  };

  // Simplified geometry calculations (using approximate formulas)
  const calculateLineStringLength = (coordinates: number[][]): number => {
    let length = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const [lng1, lat1] = coordinates[i - 1];
      const [lng2, lat2] = coordinates[i];
      length += haversineDistance(lat1, lng1, lat2, lng2);
    }
    return length; // in kilometers
  };

  const calculatePolygonArea = (coordinates: number[][]): number => {
    // Simple polygon area calculation (not accurate for large areas)
    let area = 0;
    const n = coordinates.length - 1; // Skip last coordinate if it's closing the polygon

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += coordinates[i][0] * coordinates[j][1];
      area -= coordinates[j][0] * coordinates[i][1];
    }

    area = Math.abs(area) / 2;

    // Convert from square degrees to approximate square kilometers
    // This is a rough approximation and not accurate for large areas
    const avgLat = coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length;
    const degToKm = 111.32; // kilometers per degree at equator
    const latFactor = Math.cos(avgLat * Math.PI / 180);

    return area * degToKm * degToKm * latFactor;
  };

  const calculatePolygonPerimeter = (coordinates: number[][]): number => {
    let perimeter = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const [lng1, lat1] = coordinates[i];
      const [lng2, lat2] = coordinates[i + 1];
      perimeter += haversineDistance(lat1, lng1, lat2, lng2);
    }
    return perimeter;
  };

  const calculateLineStringCentroid = (coordinates: number[][]): [number, number] => {
    const totalLength = calculateLineStringLength(coordinates);
    let accumulatedLength = 0;

    for (let i = 1; i < coordinates.length; i++) {
      const segmentLength = haversineDistance(
        coordinates[i - 1][1], coordinates[i - 1][0],
        coordinates[i][1], coordinates[i][0]
      );

      accumulatedLength += segmentLength;

      if (accumulatedLength >= totalLength / 2) {
        // Return midpoint of this segment as approximation
        return [
          (coordinates[i - 1][0] + coordinates[i][0]) / 2,
          (coordinates[i - 1][1] + coordinates[i][1]) / 2
        ];
      }
    }

    return [coordinates[0][0], coordinates[0][1]];
  };

  const calculatePolygonCentroid = (coordinates: number[][]): [number, number] => {
    let centroidLng = 0;
    let centroidLat = 0;
    let signedArea = 0;

    const n = coordinates.length - 1; // Skip last coordinate if it's closing the polygon

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const [lng1, lat1] = coordinates[i];
      const [lng2, lat2] = coordinates[j];

      const a = lng1 * lat2 - lng2 * lat1;
      signedArea += a;
      centroidLng += (lng1 + lng2) * a;
      centroidLat += (lat1 + lat2) * a;
    }

    signedArea *= 0.5;
    centroidLng /= (6.0 * signedArea);
    centroidLat /= (6.0 * signedArea);

    return [centroidLng, centroidLat];
  };

  // Haversine formula for distance calculation
  const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const exportGeometryData = () => {
    try {
      const geometry = JSON.parse(currentGeometry);
      const feature = {
        type: 'Feature',
        properties: {
          domain,
          facilityType,
          surveyDimension,
          stats: geometryStats,
          created: new Date().toISOString()
        },
        geometry
      };

      const dataStr = JSON.stringify(feature, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `${domain || 'geometry'}-${Date.now()}.geojson`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      console.error('Error exporting geometry:', e);
    }
  };

  const getDomainInfo = () => {
    const info: Record<string, { title: string; description: string; geometryType: string }> = {
      workingArea: {
        title: 'Working Area Geometry',
        description: 'Define the boundary of the working area using WGS 84 coordinates.',
        geometryType: 'Polygon or MultiPolygon'
      },
      well: {
        title: 'Well Location',
        description: 'Specify the exact surface coordinates of the well location.',
        geometryType: 'Point'
      },
      field: {
        title: 'Field Boundary',
        description: 'Define the field boundary based on geological and production data.',
        geometryType: 'Polygon or MultiPolygon'
      },
      facility: {
        title: 'Facility Geometry',
        description: facilityType === 'PIPELINE'
          ? 'Define the pipeline route from start to end point.'
          : 'Specify the facility location or boundary.',
        geometryType: facilityType === 'PIPELINE' ? 'LineString' : 'Point or Polygon'
      },
      seismicSurvey: {
        title: 'Seismic Survey Geometry',
        description: surveyDimension === '2D'
          ? 'Define the seismic line path for 2D survey.'
          : 'Define the survey area for 3D seismic acquisition.',
        geometryType: surveyDimension === '2D' ? 'LineString' : 'Polygon'
      }
    };

    return info[domain || ''] || {
      title: 'Geometry Definition',
      description: 'Define the geometry using WGS 84 coordinates.',
      geometryType: 'Any valid GeoJSON geometry'
    };
  };

  const domainInfo = getDomainInfo();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {domainInfo.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {domainInfo.description}
              </p>
            </div>
            {currentGeometry && (
              <Button variant="outline" size="sm" onClick={exportGeometryData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="geometry">Geometry Input</TabsTrigger>
          <TabsTrigger value="coordinates">Coordinate Picker</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        {/* Geometry Input Tab */}
        <TabsContent value="geometry">
          <GeometryInput
            value={currentGeometry}
            onChange={handleGeometryChange}
            geometryType={getAllowedGeometryType()}
            domain={domain}
            label={`${domainInfo.title} (${domainInfo.geometryType})`}
            placeholder={`Enter ${domainInfo.geometryType} geometry in GeoJSON format`}
          />
        </TabsContent>

        {/* Coordinate Picker Tab */}
        <TabsContent value="coordinates">
          <CoordinatePicker
            longitude={currentLng}
            latitude={currentLat}
            onCoordinateChange={handleCoordinateChange}
            showDMS={true}
            label="Point Coordinates"
          />

          {getAllowedGeometryType() !== 'Point' && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                For {domainInfo.geometryType} geometries, use the coordinate picker to set a reference point,
                then define the full geometry in the "Geometry Input" tab.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Geometry Statistics
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => calculateGeometryStats(currentGeometry)}
                  disabled={isCalculating || !currentGeometry}
                >
                  {isCalculating ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Recalculate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentGeometry ? (
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Geometry Type</Label>
                      <p className="font-medium">
                        {(() => {
                          try {
                            return JSON.parse(currentGeometry).type || 'Unknown';
                          } catch {
                            return 'Invalid';
                          }
                        })()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Coordinate System</Label>
                      <p className="font-medium">WGS 84 (EPSG:4326)</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Domain</Label>
                      <p className="font-medium capitalize">{domain || 'Generic'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Status</Label>
                      <Badge variant={currentGeometry ? 'default' : 'destructive'}>
                        {currentGeometry ? 'Valid' : 'Invalid'}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Calculated Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {geometryStats.area !== undefined && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Area</Label>
                        <p className="text-lg font-semibold">
                          {geometryStats.area.toFixed(2)} km²
                        </p>
                      </div>
                    )}

                    {geometryStats.length !== undefined && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Length</Label>
                        <p className="text-lg font-semibold">
                          {geometryStats.length.toFixed(2)} km
                        </p>
                      </div>
                    )}

                    {geometryStats.perimeter !== undefined && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Perimeter</Label>
                        <p className="text-lg font-semibold">
                          {geometryStats.perimeter.toFixed(2)} km
                        </p>
                      </div>
                    )}

                    {geometryStats.centroid && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Centroid</Label>
                        <p className="text-sm font-mono">
                          {geometryStats.centroid[0].toFixed(6)}, {geometryStats.centroid[1].toFixed(6)}
                        </p>
                      </div>
                    )}
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Calculations are approximations using simplified formulas.
                      For precise measurements, use specialized GIS software.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shapes className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No geometry data available.</p>
                  <p className="text-sm">Define geometry in the input tabs to see analysis.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
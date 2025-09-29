'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Upload,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Compass
} from 'lucide-react';

interface GeometryInputProps {
  value?: string;
  onChange: (geometry: string) => void;
  geometryType?: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon' | 'any';
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  domain?: string; // For domain-specific geometry validation
}

interface Coordinate {
  lng: number;
  lat: number;
}

interface GeometryError {
  field: string;
  message: string;
}

export default function GeometryInput({
  value = '',
  onChange,
  geometryType = 'any',
  label = 'Geometry (WGS 84)',
  placeholder,
  required = false,
  className = '',
  domain
}: GeometryInputProps) {
  const [activeTab, setActiveTab] = useState('manual');
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [currentGeometryType, setCurrentGeometryType] = useState<string>('Point');
  const [jsonInput, setJsonInput] = useState('');
  const [errors, setErrors] = useState<GeometryError[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize from existing value
  useEffect(() => {
    if (value) {
      try {
        const geometry = JSON.parse(value);
        setJsonInput(value);
        setCurrentGeometryType(geometry.type || 'Point');

        // Extract coordinates for manual editing
        if (geometry.coordinates) {
          extractCoordinatesForEditing(geometry);
        }

        validateGeometry(value);
      } catch (e) {
        setErrors([{ field: 'geometry', message: 'Invalid JSON format' }]);
        setIsValid(false);
      }
    }
  }, [value]);

  const extractCoordinatesForEditing = (geometry: any) => {
    const coords: Coordinate[] = [];

    switch (geometry.type) {
      case 'Point':
        coords.push({ lng: geometry.coordinates[0], lat: geometry.coordinates[1] });
        break;
      case 'LineString':
        geometry.coordinates.forEach((coord: number[]) => {
          coords.push({ lng: coord[0], lat: coord[1] });
        });
        break;
      case 'Polygon':
        // Take the outer ring
        if (geometry.coordinates[0]) {
          geometry.coordinates[0].forEach((coord: number[]) => {
            coords.push({ lng: coord[0], lat: coord[1] });
          });
        }
        break;
    }

    setCoordinates(coords);
  };

  const validateGeometry = (geometryString: string) => {
    const errors: GeometryError[] = [];

    try {
      const geometry = JSON.parse(geometryString);

      // Check required properties
      if (!geometry.type) {
        errors.push({ field: 'type', message: 'Geometry type is required' });
      }

      if (!geometry.coordinates) {
        errors.push({ field: 'coordinates', message: 'Coordinates are required' });
      }

      // Validate geometry type
      const validTypes = ['Point', 'LineString', 'Polygon', 'MultiPolygon'];
      if (geometry.type && !validTypes.includes(geometry.type)) {
        errors.push({ field: 'type', message: `Invalid geometry type. Must be one of: ${validTypes.join(', ')}` });
      }

      // Check geometry type restriction
      if (geometryType !== 'any' && geometry.type !== geometryType) {
        errors.push({ field: 'type', message: `Geometry type must be ${geometryType}` });
      }

      // Validate coordinates
      if (geometry.coordinates) {
        validateCoordinates(geometry, errors);
      }

      // Domain-specific validation
      if (domain) {
        validateDomainSpecificGeometry(geometry, domain, errors);
      }

    } catch (e) {
      errors.push({ field: 'geometry', message: 'Invalid JSON format' });
    }

    setErrors(errors);
    setIsValid(errors.length === 0);
  };

  const validateCoordinates = (geometry: any, errors: GeometryError[]) => {
    const validateCoord = (coord: number[], path: string) => {
      if (!Array.isArray(coord) || coord.length < 2) {
        errors.push({ field: 'coordinates', message: `Invalid coordinate format at ${path}` });
        return;
      }

      const [lng, lat] = coord;

      // Check if coordinates are numbers
      if (typeof lng !== 'number' || typeof lat !== 'number') {
        errors.push({ field: 'coordinates', message: `Coordinates must be numbers at ${path}` });
        return;
      }

      // Check WGS 84 bounds
      if (lng < -180 || lng > 180) {
        errors.push({ field: 'coordinates', message: `Longitude ${lng} is outside valid range (-180 to 180) at ${path}` });
      }

      if (lat < -90 || lat > 90) {
        errors.push({ field: 'coordinates', message: `Latitude ${lat} is outside valid range (-90 to 90) at ${path}` });
      }

      // Indonesia-specific validation
      if (lng < 95 || lng > 141) {
        errors.push({ field: 'coordinates', message: `Longitude ${lng} is outside Indonesia range (95°E to 141°E) at ${path}` });
      }

      if (lat > 6 || lat < -11) {
        errors.push({ field: 'coordinates', message: `Latitude ${lat} is outside Indonesia range (6°N to 11°S) at ${path}` });
      }
    };

    const validateCoordinateArray = (coords: any, path: string) => {
      if (!Array.isArray(coords)) {
        errors.push({ field: 'coordinates', message: `Coordinates must be an array at ${path}` });
        return;
      }

      coords.forEach((coord, index) => {
        if (Array.isArray(coord[0])) {
          // Nested array (Polygon, MultiPolygon)
          validateCoordinateArray(coord, `${path}[${index}]`);
        } else {
          // Coordinate pair
          validateCoord(coord, `${path}[${index}]`);
        }
      });
    };

    switch (geometry.type) {
      case 'Point':
        validateCoord(geometry.coordinates, 'Point');
        break;
      case 'LineString':
        if (geometry.coordinates.length < 2) {
          errors.push({ field: 'coordinates', message: 'LineString must have at least 2 coordinates' });
        }
        validateCoordinateArray(geometry.coordinates, 'LineString');
        break;
      case 'Polygon':
        if (!Array.isArray(geometry.coordinates[0]) || geometry.coordinates[0].length < 4) {
          errors.push({ field: 'coordinates', message: 'Polygon must have at least 4 coordinates (closed ring)' });
        }
        validateCoordinateArray(geometry.coordinates, 'Polygon');
        break;
      case 'MultiPolygon':
        validateCoordinateArray(geometry.coordinates, 'MultiPolygon');
        break;
    }
  };

  const validateDomainSpecificGeometry = (geometry: any, domain: string, errors: GeometryError[]) => {
    switch (domain) {
      case 'well':
        if (geometry.type !== 'Point') {
          errors.push({ field: 'type', message: 'Well geometry must be a Point' });
        }
        break;
      case 'seismicSurvey':
        // 2D surveys should be LineString, 3D should be Polygon
        // This would require additional context from the form
        break;
      case 'field':
      case 'workingArea':
        if (!['Polygon', 'MultiPolygon'].includes(geometry.type)) {
          errors.push({ field: 'type', message: 'Field/Working Area geometry should be Polygon or MultiPolygon' });
        }
        break;
      case 'facility':
        // Pipelines should be LineString, others can be Point or Polygon
        // This would require facility type context
        break;
    }
  };

  const handleManualCoordinateChange = (index: number, field: 'lng' | 'lat', value: string) => {
    const newCoordinates = [...coordinates];
    const numValue = parseFloat(value);

    if (!isNaN(numValue)) {
      newCoordinates[index] = { ...newCoordinates[index], [field]: numValue };
      setCoordinates(newCoordinates);
      updateGeometryFromCoordinates(newCoordinates);
    }
  };

  const addCoordinate = () => {
    const newCoords = [...coordinates, { lng: 107.0, lat: -6.0 }];
    setCoordinates(newCoords);
    updateGeometryFromCoordinates(newCoords);
  };

  const removeCoordinate = (index: number) => {
    const newCoords = coordinates.filter((_, i) => i !== index);
    setCoordinates(newCoords);
    updateGeometryFromCoordinates(newCoords);
  };

  const updateGeometryFromCoordinates = (coords: Coordinate[]) => {
    if (coords.length === 0) return;

    let geometry: any;

    switch (currentGeometryType) {
      case 'Point':
        geometry = {
          type: 'Point',
          coordinates: [coords[0].lng, coords[0].lat]
        };
        break;
      case 'LineString':
        geometry = {
          type: 'LineString',
          coordinates: coords.map(c => [c.lng, c.lat])
        };
        break;
      case 'Polygon':
        // Ensure the polygon is closed
        const polygonCoords = coords.map(c => [c.lng, c.lat]);
        if (coords.length >= 3) {
          // Close the polygon if not already closed
          const first = polygonCoords[0];
          const last = polygonCoords[polygonCoords.length - 1];
          if (first[0] !== last[0] || first[1] !== last[1]) {
            polygonCoords.push([first[0], first[1]]);
          }
        }
        geometry = {
          type: 'Polygon',
          coordinates: [polygonCoords]
        };
        break;
    }

    const geometryString = JSON.stringify(geometry, null, 2);
    setJsonInput(geometryString);
    onChange(geometryString);
    validateGeometry(geometryString);
  };

  const handleJsonInputChange = (value: string) => {
    setJsonInput(value);
    onChange(value);

    if (value.trim()) {
      validateGeometry(value);

      // Try to extract coordinates for manual editing
      try {
        const geometry = JSON.parse(value);
        extractCoordinatesForEditing(geometry);
        setCurrentGeometryType(geometry.type || 'Point');
      } catch (e) {
        // Invalid JSON, validation will handle this
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        // Try to parse as GeoJSON
        const geoData = JSON.parse(content);

        let geometry;
        if (geoData.type === 'FeatureCollection') {
          // Extract first feature's geometry
          geometry = geoData.features?.[0]?.geometry;
        } else if (geoData.type === 'Feature') {
          geometry = geoData.geometry;
        } else if (['Point', 'LineString', 'Polygon', 'MultiPolygon'].includes(geoData.type)) {
          geometry = geoData;
        }

        if (geometry) {
          const geometryString = JSON.stringify(geometry, null, 2);
          setJsonInput(geometryString);
          onChange(geometryString);
          extractCoordinatesForEditing(geometry);
          setCurrentGeometryType(geometry.type);
          setActiveTab('json');
        } else {
          setErrors([{ field: 'file', message: 'No valid geometry found in file' }]);
        }
      } catch (err) {
        setErrors([{ field: 'file', message: 'Invalid JSON/GeoJSON file' }]);
      }
    };
    reader.readAsText(file);
  };

  const generateSampleGeometry = (type: string) => {
    const samples = {
      Point: {
        type: 'Point',
        coordinates: [107.123456, -6.123456]
      },
      LineString: {
        type: 'LineString',
        coordinates: [
          [107.0, -6.0],
          [107.1, -6.1],
          [107.2, -6.0]
        ]
      },
      Polygon: {
        type: 'Polygon',
        coordinates: [[
          [107.0, -6.0],
          [107.1, -6.0],
          [107.1, -5.9],
          [107.0, -5.9],
          [107.0, -6.0]
        ]]
      }
    };

    const geometry = samples[type as keyof typeof samples];
    const geometryString = JSON.stringify(geometry, null, 2);
    setJsonInput(geometryString);
    onChange(geometryString);
    extractCoordinatesForEditing(geometry);
    setCurrentGeometryType(type);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonInput);
  };

  const downloadGeoJSON = () => {
    try {
      const geometry = JSON.parse(jsonInput);
      const feature = {
        type: 'Feature',
        properties: {},
        geometry
      };

      const dataStr = JSON.stringify(feature, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `geometry-${Date.now()}.geojson`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      // Invalid geometry
    }
  };

  const renderCoordinateInputs = () => {
    if (currentGeometryType === 'Point' && coordinates.length === 0) {
      setCoordinates([{ lng: 107.0, lat: -6.0 }]);
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Coordinates (WGS 84)</Label>
          <div className="flex gap-2">
            {currentGeometryType !== 'Point' && (
              <Button size="sm" variant="outline" onClick={addCoordinate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Point
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {coordinates.map((coord, index) => (
            <div key={index} className="flex items-center gap-2 p-3 border rounded">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={coord.lng}
                    onChange={(e) => handleManualCoordinateChange(index, 'lng', e.target.value)}
                    placeholder="107.123456"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={coord.lat}
                    onChange={(e) => handleManualCoordinateChange(index, 'lat', e.target.value)}
                    placeholder="-6.123456"
                    className="text-sm"
                  />
                </div>
              </div>
              {currentGeometryType !== 'Point' && coordinates.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeCoordinate(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {currentGeometryType === 'Polygon' && coordinates.length >= 3 && (
          <Alert>
            <Compass className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Polygon will be automatically closed by connecting the last point to the first point.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="flex items-center gap-2">
          {isValid ? (
            <Badge variant="default" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Valid
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Invalid
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">WGS 84 (EPSG:4326) Geometry</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              {jsonInput && (
                <>
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadGeoJSON}>
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual">Manual Input</TabsTrigger>
              <TabsTrigger value="json">JSON/GeoJSON</TabsTrigger>
              <TabsTrigger value="upload">File Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <div>
                <Label>Geometry Type</Label>
                <Select value={currentGeometryType} onValueChange={setCurrentGeometryType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {geometryType === 'any' ? (
                      <>
                        <SelectItem value="Point">Point</SelectItem>
                        <SelectItem value="LineString">LineString</SelectItem>
                        <SelectItem value="Polygon">Polygon</SelectItem>
                      </>
                    ) : (
                      <SelectItem value={geometryType}>{geometryType}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {renderCoordinateInputs()}
            </TabsContent>

            <TabsContent value="json" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>GeoJSON Geometry</Label>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateSampleGeometry('Point')}
                    >
                      Point
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateSampleGeometry('LineString')}
                    >
                      Line
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateSampleGeometry('Polygon')}
                    >
                      Polygon
                    </Button>
                  </div>
                </div>

                <Textarea
                  value={jsonInput}
                  onChange={(e) => handleJsonInputChange(e.target.value)}
                  placeholder={placeholder || '{"type":"Point","coordinates":[107.123456,-6.123456]}'}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload GeoJSON file or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.geojson"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select File
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Supported formats: GeoJSON (.json, .geojson). The file should contain valid WGS 84 coordinates.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="mt-4 space-y-2">
              {errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{error.field}:</strong> {error.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Geometry Preview */}
          {showPreview && jsonInput && isValid && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <Label className="text-xs font-medium">Geometry Preview:</Label>
              <pre className="text-xs mt-2 overflow-x-auto">
                {JSON.stringify(JSON.parse(jsonInput), null, 2)}
              </pre>
            </div>
          )}

          {/* Coordinate System Info */}
          <Alert className="mt-4">
            <Compass className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>WGS 84 (EPSG:4326)</strong> - Indonesia range: Longitude 95°E to 141°E, Latitude 6°N to 11°S
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
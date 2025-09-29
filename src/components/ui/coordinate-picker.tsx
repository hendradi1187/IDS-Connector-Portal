'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Crosshair,
  Navigation,
  Search,
  AlertTriangle,
  CheckCircle2,
  Copy,
  RefreshCw
} from 'lucide-react';

interface CoordinatePickerProps {
  longitude?: number;
  latitude?: number;
  onCoordinateChange: (lng: number, lat: number) => void;
  label?: string;
  required?: boolean;
  className?: string;
  showDMS?: boolean; // Degrees, Minutes, Seconds format
}

interface LocationSuggestion {
  name: string;
  coordinates: [number, number];
  type: string;
}

export default function CoordinatePicker({
  longitude = 107.0,
  latitude = -6.0,
  onCoordinateChange,
  label = 'Coordinates (WGS 84)',
  required = false,
  className = '',
  showDMS = false
}: CoordinatePickerProps) {
  const [lng, setLng] = useState<string>(longitude.toString());
  const [lat, setLat] = useState<string>(latitude.toString());
  const [utmZone, setUtmZone] = useState<string>('');
  const [utmEasting, setUtmEasting] = useState<string>('');
  const [utmNorthing, setUtmNorthing] = useState<string>('');
  const [coordinateFormat, setCoordinateFormat] = useState<'decimal' | 'dms' | 'utm'>('decimal');
  const [errors, setErrors] = useState<string[]>([]);
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Indonesia province/city suggestions for quick location picking
  const indonesiaLocations: LocationSuggestion[] = [
    { name: 'Jakarta', coordinates: [106.845599, -6.208763], type: 'city' },
    { name: 'Surabaya', coordinates: [112.768845, -7.289149], type: 'city' },
    { name: 'Bandung', coordinates: [107.609810, -6.917464], type: 'city' },
    { name: 'Medan', coordinates: [98.678513, 3.595196], type: 'city' },
    { name: 'Balikpapan', coordinates: [116.831856, -1.268271], type: 'city' },
    { name: 'Palembang', coordinates: [104.745441, -2.990934], type: 'city' },
    { name: 'Pekanbaru', coordinates: [101.444237, 0.533333], type: 'city' },
    { name: 'Banjarmasin', coordinates: [114.590111, -3.325000], type: 'city' },
    { name: 'Pontianak', coordinates: [109.336342, -0.026611], type: 'city' },
    { name: 'Makassar', coordinates: [119.422447, -5.135399], type: 'city' },
    // Oil & Gas areas
    { name: 'Riau Basin', coordinates: [101.0, 1.0], type: 'basin' },
    { name: 'South Sumatra Basin', coordinates: [104.0, -3.0], type: 'basin' },
    { name: 'East Java Basin', coordinates: [112.0, -7.5], type: 'basin' },
    { name: 'Kutai Basin', coordinates: [117.0, -1.0], type: 'basin' },
    { name: 'North Sumatra Basin', coordinates: [99.0, 3.5], type: 'basin' },
    { name: 'Mahakam Delta', coordinates: [117.5, -0.5], type: 'field' },
    { name: 'Minas Field', coordinates: [101.3, 0.8], type: 'field' }
  ];

  useEffect(() => {
    setLng(longitude.toString());
    setLat(latitude.toString());
    convertToUTM(longitude, latitude);
  }, [longitude, latitude]);

  const validateCoordinates = (lngVal: number, latVal: number): string[] => {
    const errors: string[] = [];

    // Check if coordinates are numbers
    if (isNaN(lngVal) || isNaN(latVal)) {
      errors.push('Coordinates must be valid numbers');
      return errors;
    }

    // Check WGS 84 bounds
    if (lngVal < -180 || lngVal > 180) {
      errors.push(`Longitude ${lngVal} is outside valid range (-180° to 180°)`);
    }

    if (latVal < -90 || latVal > 90) {
      errors.push(`Latitude ${latVal} is outside valid range (-90° to 90°)`);
    }

    // Indonesia-specific bounds warning
    if (lngVal < 95 || lngVal > 141) {
      errors.push(`Warning: Longitude ${lngVal} is outside Indonesia range (95°E to 141°E)`);
    }

    if (latVal > 6 || latVal < -11) {
      errors.push(`Warning: Latitude ${latVal} is outside Indonesia range (6°N to 11°S)`);
    }

    return errors;
  };

  const handleCoordinateUpdate = (newLng: string, newLat: string) => {
    setLng(newLng);
    setLat(newLat);

    const lngNum = parseFloat(newLng);
    const latNum = parseFloat(newLat);

    const validationErrors = validateCoordinates(lngNum, latNum);
    setErrors(validationErrors);

    if (validationErrors.length === 0 || validationErrors.every(e => e.startsWith('Warning'))) {
      onCoordinateChange(lngNum, latNum);
      convertToUTM(lngNum, latNum);
    }
  };

  // Simple UTM conversion (approximation for display purposes)
  const convertToUTM = (longitude: number, latitude: number) => {
    // Determine UTM zone for Indonesia (zones 46-54)
    const zone = Math.floor((longitude + 180) / 6) + 1;
    setUtmZone(zone.toString() + (latitude >= 0 ? 'N' : 'S'));

    // Simplified UTM calculation (for display only)
    const easting = Math.round(500000 + (longitude - (zone * 6 - 183)) * 111000 * Math.cos(latitude * Math.PI / 180));
    const northing = Math.round(latitude >= 0 ? latitude * 111000 : 10000000 + latitude * 111000);

    setUtmEasting(easting.toString());
    setUtmNorthing(northing.toString());
  };

  const convertDMSToDecimal = (degrees: number, minutes: number, seconds: number, direction: string): number => {
    let decimal = degrees + minutes / 60 + seconds / 3600;
    if (direction === 'S' || direction === 'W') {
      decimal = -decimal;
    }
    return decimal;
  };

  const convertDecimalToDMS = (decimal: number): { degrees: number; minutes: number; seconds: number; direction: string } => {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutes = Math.floor((absolute - degrees) * 60);
    const seconds = ((absolute - degrees) * 60 - minutes) * 60;

    let direction: string;
    if (decimal >= 0) {
      direction = lng === decimal.toString() ? 'E' : 'N';
    } else {
      direction = lng === decimal.toString() ? 'W' : 'S';
    }

    return { degrees, minutes, seconds: Math.round(seconds * 1000) / 1000, direction };
  };

  const searchLocation = (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = indonesiaLocations.filter(location =>
      location.name.toLowerCase().includes(query.toLowerCase()) ||
      location.type.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filtered.slice(0, 10));
  };

  const selectLocation = (location: LocationSuggestion) => {
    const [newLng, newLat] = location.coordinates;
    handleCoordinateUpdate(newLng.toString(), newLat.toString());
    setLocationQuery(location.name);
    setSuggestions([]);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          handleCoordinateUpdate(longitude.toString(), latitude.toString());
          setIsSearching(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setErrors(['Unable to get current location']);
          setIsSearching(false);
        }
      );
    } else {
      setErrors(['Geolocation is not supported by this browser']);
    }
  };

  const copyCoordinates = () => {
    const coordText = `${lng}, ${lat}`;
    navigator.clipboard.writeText(coordText);
  };

  const renderDecimalInputs = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="longitude">
          Longitude (°E) {required && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id="longitude"
          type="number"
          step="any"
          value={lng}
          onChange={(e) => handleCoordinateUpdate(e.target.value, lat)}
          placeholder="107.123456"
        />
      </div>
      <div>
        <Label htmlFor="latitude">
          Latitude (°N) {required && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id="latitude"
          type="number"
          step="any"
          value={lat}
          onChange={(e) => handleCoordinateUpdate(lng, e.target.value)}
          placeholder="-6.123456"
        />
      </div>
    </div>
  );

  const renderDMSInputs = () => {
    const lngDMS = convertDecimalToDMS(parseFloat(lng) || 0);
    const latDMS = convertDecimalToDMS(parseFloat(lat) || 0);

    return (
      <div className="space-y-4">
        <div>
          <Label>Longitude (Degrees, Minutes, Seconds)</Label>
          <div className="grid grid-cols-4 gap-2">
            <Input type="number" placeholder="Degrees" />
            <Input type="number" placeholder="Minutes" />
            <Input type="number" placeholder="Seconds" step="any" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="E/W" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="E">E</SelectItem>
                <SelectItem value="W">W</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Latitude (Degrees, Minutes, Seconds)</Label>
          <div className="grid grid-cols-4 gap-2">
            <Input type="number" placeholder="Degrees" />
            <Input type="number" placeholder="Minutes" />
            <Input type="number" placeholder="Seconds" step="any" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="N/S" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N">N</SelectItem>
                <SelectItem value="S">S</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  };

  const renderUTMInputs = () => (
    <div className="space-y-4">
      <div>
        <Label>UTM Zone</Label>
        <Input value={utmZone} readOnly className="bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Easting (m)</Label>
          <Input value={utmEasting} readOnly className="bg-muted" />
        </div>
        <div>
          <Label>Northing (m)</Label>
          <Input value={utmNorthing} readOnly className="bg-muted" />
        </div>
      </div>
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          UTM values are calculated approximations for reference only.
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="flex items-center gap-2">
          {errors.length === 0 ? (
            <Badge variant="default" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Valid
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {errors.some(e => !e.startsWith('Warning')) ? 'Invalid' : 'Warning'}
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              WGS 84 (EPSG:4326) Coordinates
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={getCurrentLocation} disabled={isSearching}>
                {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="outline" onClick={copyCoordinates}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Location Search */}
          <div className="space-y-2">
            <Label>Quick Location Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={locationQuery}
                onChange={(e) => {
                  setLocationQuery(e.target.value);
                  searchLocation(e.target.value);
                }}
                placeholder="Search cities, basins, or fields in Indonesia..."
                className="pl-10"
              />

              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full px-4 py-2 text-left hover:bg-muted flex items-center justify-between"
                      onClick={() => selectLocation(suggestion)}
                    >
                      <span>{suggestion.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Coordinate Format Selector */}
          <div>
            <Label>Coordinate Format</Label>
            <Select value={coordinateFormat} onValueChange={(value: any) => setCoordinateFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="decimal">Decimal Degrees</SelectItem>
                {showDMS && <SelectItem value="dms">Degrees, Minutes, Seconds</SelectItem>}
                <SelectItem value="utm">UTM (Reference Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Coordinate Inputs */}
          {coordinateFormat === 'decimal' && renderDecimalInputs()}
          {coordinateFormat === 'dms' && showDMS && renderDMSInputs()}
          {coordinateFormat === 'utm' && renderUTMInputs()}

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="space-y-2">
              {errors.map((error, index) => (
                <Alert
                  key={index}
                  variant={error.startsWith('Warning') ? 'default' : 'destructive'}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Coordinate Display */}
          <div className="pt-2 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Current Longitude</Label>
                <p className="font-mono">{parseFloat(lng).toFixed(6)}°</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Current Latitude</Label>
                <p className="font-mono">{parseFloat(lat).toFixed(6)}°</p>
              </div>
            </div>
          </div>

          {/* Info */}
          <Alert>
            <Navigation className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Indonesia coordinates:</strong> Longitude 95°E to 141°E, Latitude 6°N to 11°S.
              Click the crosshair button to use your current location.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
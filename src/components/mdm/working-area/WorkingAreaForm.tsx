'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Upload, Check, X, AlertCircle } from 'lucide-react';

interface WorkingAreaFormProps {
  workingArea?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  wkId: string;
  namaWk: string;
  statusWk: string;
  provinsi1: string;
  provinsi2: string;
  lokasi: string;
  jenisKontrak: string;
  effectiveDate: string;
  expireDate: string;
  holding: string;
  faseWk: string;
  luasWkAwal: string;
  luasWk: string;
  namaCekungan: string;
  statusCekungan: string;
  participatingInterest: string;
  kewenangan: string;
  attachment: any;
  shape: string;
  crsEpsg: string;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  details: {
    wkIdUnique: { valid: boolean; message: string };
    wkIdFormat: { valid: boolean; message: string };
    wkIdLength: { valid: boolean; message: string };
  };
}

export default function WorkingAreaForm({
  workingArea,
  open,
  onOpenChange,
  onSuccess
}: WorkingAreaFormProps) {
  const [formData, setFormData] = useState<FormData>({
    wkId: '',
    namaWk: '',
    statusWk: '',
    provinsi1: '',
    provinsi2: '',
    lokasi: '',
    jenisKontrak: '',
    effectiveDate: '',
    expireDate: '',
    holding: '',
    faseWk: '',
    luasWkAwal: '',
    luasWk: '',
    namaCekungan: '',
    statusCekungan: '',
    participatingInterest: '',
    kewenangan: '',
    attachment: null,
    shape: '',
    crsEpsg: '4326',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [validatingWkId, setValidatingWkId] = useState(false);

  useEffect(() => {
    if (workingArea) {
      setFormData({
        wkId: workingArea.wkId || '',
        namaWk: workingArea.namaWk || '',
        statusWk: workingArea.statusWk || '',
        provinsi1: workingArea.provinsi1 || '',
        provinsi2: workingArea.provinsi2 || '',
        lokasi: workingArea.lokasi || '',
        jenisKontrak: workingArea.jenisKontrak || '',
        effectiveDate: workingArea.effectiveDate ? workingArea.effectiveDate.split('T')[0] : '',
        expireDate: workingArea.expireDate ? workingArea.expireDate.split('T')[0] : '',
        holding: workingArea.holding || '',
        faseWk: workingArea.faseWk || '',
        luasWkAwal: workingArea.luasWkAwal?.toString() || '',
        luasWk: workingArea.luasWk?.toString() || '',
        namaCekungan: workingArea.namaCekungan || '',
        statusCekungan: workingArea.statusCekungan || '',
        participatingInterest: workingArea.participatingInterest?.toString() || '',
        kewenangan: workingArea.kewenangan || '',
        attachment: workingArea.attachment,
        shape: workingArea.shape ? JSON.stringify(workingArea.shape) : '',
        crsEpsg: workingArea.crsEpsg?.toString() || '4326',
      });
    } else {
      // Reset form for new working area
      setFormData({
        wkId: '',
        namaWk: '',
        statusWk: '',
        provinsi1: '',
        provinsi2: '',
        lokasi: '',
        jenisKontrak: '',
        effectiveDate: '',
        expireDate: '',
        holding: '',
        faseWk: '',
        luasWkAwal: '',
        luasWk: '',
        namaCekungan: '',
        statusCekungan: '',
        participatingInterest: '',
        kewenangan: '',
        attachment: null,
        shape: '',
        crsEpsg: '4326',
      });
    }
    setErrors({});
    setValidation(null);
  }, [workingArea, open]);

  const validateWkId = async (wkId: string) => {
    if (!wkId) {
      setValidation(null);
      return;
    }

    setValidatingWkId(true);
    try {
      const response = await fetch('/api/mdm/working-areas/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wkId, id: workingArea?.id }),
      });

      const data = await response.json();
      if (data.success) {
        setValidation(data.data);
      }
    } catch (error) {
      console.error('Error validating WK ID:', error);
    } finally {
      setValidatingWkId(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Validate WK ID when it changes
    if (field === 'wkId') {
      const timeoutId = setTimeout(() => validateWkId(value), 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.wkId) newErrors.wkId = 'WK ID is required';
    if (!formData.namaWk) newErrors.namaWk = 'Working Area name is required';
    if (!formData.statusWk) newErrors.statusWk = 'Status is required';
    if (!formData.lokasi) newErrors.lokasi = 'Location is required';
    if (!formData.jenisKontrak) newErrors.jenisKontrak = 'Contract type is required';
    if (!formData.effectiveDate) newErrors.effectiveDate = 'Effective date is required';
    if (!formData.holding) newErrors.holding = 'Holding company is required';
    if (!formData.faseWk) newErrors.faseWk = 'Phase is required';
    if (!formData.kewenangan) newErrors.kewenangan = 'Authority is required';
    if (!formData.shape) newErrors.shape = 'Geometry shape is required';

    // WK ID validation
    if (validation && !validation.isValid) {
      newErrors.wkId = validation.message;
    }

    // Number validations
    if (formData.participatingInterest && (isNaN(Number(formData.participatingInterest)) || Number(formData.participatingInterest) < 0 || Number(formData.participatingInterest) > 100)) {
      newErrors.participatingInterest = 'Participating interest must be between 0 and 100';
    }

    if (formData.luasWkAwal && isNaN(Number(formData.luasWkAwal))) {
      newErrors.luasWkAwal = 'Initial area must be a valid number';
    }

    if (formData.luasWk && isNaN(Number(formData.luasWk))) {
      newErrors.luasWk = 'Current area must be a valid number';
    }

    // Date validation
    if (formData.expireDate && formData.effectiveDate && new Date(formData.expireDate) <= new Date(formData.effectiveDate)) {
      newErrors.expireDate = 'Expire date must be after effective date';
    }

    // Geometry validation
    if (formData.shape) {
      try {
        const parsedShape = JSON.parse(formData.shape);
        if (!parsedShape.type || !parsedShape.coordinates) {
          newErrors.shape = 'Invalid GeoJSON format';
        }
      } catch (error) {
        newErrors.shape = 'Invalid JSON format for geometry';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        luasWkAwal: formData.luasWkAwal ? Number(formData.luasWkAwal) : null,
        luasWk: formData.luasWk ? Number(formData.luasWk) : null,
        participatingInterest: formData.participatingInterest ? Number(formData.participatingInterest) : null,
        crsEpsg: Number(formData.crsEpsg),
        shape: JSON.parse(formData.shape),
        expireDate: formData.expireDate || null,
      };

      const url = workingArea
        ? `/api/mdm/working-areas/${workingArea.id}`
        : '/api/mdm/working-areas';

      const method = workingArea ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        setErrors({ submit: data.message || 'Failed to save working area' });
      }
    } catch (error) {
      console.error('Error saving working area:', error);
      setErrors({ submit: 'Failed to save working area' });
    } finally {
      setLoading(false);
    }
  };

  const handleGeometryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const geometry = JSON.parse(content);
          setFormData(prev => ({ ...prev, shape: JSON.stringify(geometry) }));
        } catch (error) {
          setErrors({ shape: 'Invalid file format. Please upload a valid GeoJSON file.' });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {workingArea ? 'Edit Working Area' : 'Add New Working Area'}
          </DialogTitle>
          <DialogDescription>
            {workingArea ? 'Update working area information' : 'Create a new working area following SKK Migas Data Specification v2'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contract">Contract</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
            <TabsTrigger value="geometry">Geometry</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wkId">
                  WK ID <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="wkId"
                    value={formData.wkId}
                    onChange={(e) => handleInputChange('wkId', e.target.value.toUpperCase())}
                    placeholder="e.g., WK-001"
                    className={errors.wkId ? 'border-red-500' : ''}
                  />
                  {validatingWkId && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                    </div>
                  )}
                  {validation && !validatingWkId && (
                    <div className="absolute right-3 top-3">
                      {validation.isValid ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {errors.wkId && <p className="text-sm text-red-500">{errors.wkId}</p>}
                {validation && !validation.isValid && (
                  <div className="space-y-1">
                    {Object.entries(validation.details).map(([key, detail]) => (
                      !detail.valid && (
                        <p key={key} className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {detail.message}
                        </p>
                      )
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="namaWk">
                  Working Area Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="namaWk"
                  value={formData.namaWk}
                  onChange={(e) => handleInputChange('namaWk', e.target.value)}
                  placeholder="Enter working area name"
                  className={errors.namaWk ? 'border-red-500' : ''}
                />
                {errors.namaWk && <p className="text-sm text-red-500">{errors.namaWk}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusWk">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.statusWk} onValueChange={(value) => handleInputChange('statusWk', value)}>
                  <SelectTrigger className={errors.statusWk ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AKTIF">Aktif</SelectItem>
                    <SelectItem value="TERMINASI">Terminasi</SelectItem>
                    <SelectItem value="SUSPENSI">Suspensi</SelectItem>
                    <SelectItem value="RELINQUISH">Relinquish</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
                {errors.statusWk && <p className="text-sm text-red-500">{errors.statusWk}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lokasi">
                  Location Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.lokasi} onValueChange={(value) => handleInputChange('lokasi', value)}>
                  <SelectTrigger className={errors.lokasi ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONSHORE">Onshore</SelectItem>
                    <SelectItem value="OFFSHORE">Offshore</SelectItem>
                    <SelectItem value="ONSHORE_OFFSHORE">Onshore-Offshore</SelectItem>
                  </SelectContent>
                </Select>
                {errors.lokasi && <p className="text-sm text-red-500">{errors.lokasi}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="faseWk">
                  Phase <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.faseWk} onValueChange={(value) => handleInputChange('faseWk', value)}>
                  <SelectTrigger className={errors.faseWk ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EKSPLORASI">Eksplorasi</SelectItem>
                    <SelectItem value="PRODUKSI">Produksi</SelectItem>
                    <SelectItem value="DEVELOPMENT">Development</SelectItem>
                    <SelectItem value="ABANDONMENT">Abandonment</SelectItem>
                  </SelectContent>
                </Select>
                {errors.faseWk && <p className="text-sm text-red-500">{errors.faseWk}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="kewenangan">
                  Authority <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.kewenangan} onValueChange={(value) => handleInputChange('kewenangan', value)}>
                  <SelectTrigger className={errors.kewenangan ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select authority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SKK_MIGAS">SKK Migas</SelectItem>
                    <SelectItem value="BPMA">BPMA</SelectItem>
                    <SelectItem value="PUSAT">Pusat</SelectItem>
                    <SelectItem value="DAERAH">Daerah</SelectItem>
                  </SelectContent>
                </Select>
                {errors.kewenangan && <p className="text-sm text-red-500">{errors.kewenangan}</p>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contract" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jenisKontrak">
                  Contract Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.jenisKontrak} onValueChange={(value) => handleInputChange('jenisKontrak', value)}>
                  <SelectTrigger className={errors.jenisKontrak ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PSC">PSC (Production Sharing Contract)</SelectItem>
                    <SelectItem value="GROSS_SPLIT">Gross Split</SelectItem>
                    <SelectItem value="TAC">TAC (Technical Assistance Contract)</SelectItem>
                    <SelectItem value="SERVICE_CONTRACT">Service Contract</SelectItem>
                  </SelectContent>
                </Select>
                {errors.jenisKontrak && <p className="text-sm text-red-500">{errors.jenisKontrak}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="holding">
                  Holding Company <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="holding"
                  value={formData.holding}
                  onChange={(e) => handleInputChange('holding', e.target.value)}
                  placeholder="Enter holding company"
                  className={errors.holding ? 'border-red-500' : ''}
                />
                {errors.holding && <p className="text-sm text-red-500">{errors.holding}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveDate">
                  Effective Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                  className={errors.effectiveDate ? 'border-red-500' : ''}
                />
                {errors.effectiveDate && <p className="text-sm text-red-500">{errors.effectiveDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expireDate">Expire Date</Label>
                <Input
                  id="expireDate"
                  type="date"
                  value={formData.expireDate}
                  onChange={(e) => handleInputChange('expireDate', e.target.value)}
                  className={errors.expireDate ? 'border-red-500' : ''}
                />
                {errors.expireDate && <p className="text-sm text-red-500">{errors.expireDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="participatingInterest">Participating Interest (%)</Label>
                <Input
                  id="participatingInterest"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.participatingInterest}
                  onChange={(e) => handleInputChange('participatingInterest', e.target.value)}
                  placeholder="Enter percentage (0-100)"
                  className={errors.participatingInterest ? 'border-red-500' : ''}
                />
                {errors.participatingInterest && <p className="text-sm text-red-500">{errors.participatingInterest}</p>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="geography" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provinsi1">Province 1</Label>
                <Input
                  id="provinsi1"
                  value={formData.provinsi1}
                  onChange={(e) => handleInputChange('provinsi1', e.target.value)}
                  placeholder="Enter primary province"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provinsi2">Province 2</Label>
                <Input
                  id="provinsi2"
                  value={formData.provinsi2}
                  onChange={(e) => handleInputChange('provinsi2', e.target.value)}
                  placeholder="Enter secondary province (if applicable)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="namaCekungan">Basin Name</Label>
                <Input
                  id="namaCekungan"
                  value={formData.namaCekungan}
                  onChange={(e) => handleInputChange('namaCekungan', e.target.value)}
                  placeholder="Enter basin name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusCekungan">Basin Status</Label>
                <Input
                  id="statusCekungan"
                  value={formData.statusCekungan}
                  onChange={(e) => handleInputChange('statusCekungan', e.target.value)}
                  placeholder="Enter basin status"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="luasWkAwal">Initial Area (km²)</Label>
                <Input
                  id="luasWkAwal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.luasWkAwal}
                  onChange={(e) => handleInputChange('luasWkAwal', e.target.value)}
                  placeholder="Enter initial area"
                  className={errors.luasWkAwal ? 'border-red-500' : ''}
                />
                {errors.luasWkAwal && <p className="text-sm text-red-500">{errors.luasWkAwal}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="luasWk">Current Area (km²)</Label>
                <Input
                  id="luasWk"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.luasWk}
                  onChange={(e) => handleInputChange('luasWk', e.target.value)}
                  placeholder="Enter current area"
                  className={errors.luasWk ? 'border-red-500' : ''}
                />
                {errors.luasWk && <p className="text-sm text-red-500">{errors.luasWk}</p>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="geometry" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crsEpsg">CRS EPSG Code</Label>
                <Select value={formData.crsEpsg} onValueChange={(value) => handleInputChange('crsEpsg', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select coordinate system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4326">EPSG:4326 (WGS 84)</SelectItem>
                    <SelectItem value="3857">EPSG:3857 (Web Mercator)</SelectItem>
                    <SelectItem value="32748">EPSG:32748 (UTM Zone 48S)</SelectItem>
                    <SelectItem value="32749">EPSG:32749 (UTM Zone 49S)</SelectItem>
                    <SelectItem value="32750">EPSG:32750 (UTM Zone 50S)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shape">
                  Geometry Shape (GeoJSON) <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept=".json,.geojson"
                      onChange={handleGeometryUpload}
                    />
                    <Button type="button" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload GeoJSON
                    </Button>
                  </div>
                  <Textarea
                    id="shape"
                    value={formData.shape}
                    onChange={(e) => handleInputChange('shape', e.target.value)}
                    placeholder="Enter GeoJSON geometry or upload a file"
                    rows={8}
                    className={errors.shape ? 'border-red-500' : ''}
                  />
                  {errors.shape && <p className="text-sm text-red-500">{errors.shape}</p>}
                </div>
              </div>

              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  Geometry should be in WGS 84 (EPSG:4326) coordinate system as per SKK Migas specification.
                  Upload a valid GeoJSON file or paste the geometry directly.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>

        {errors.submit && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || (validation && !validation.isValid)}
          >
            {loading ? 'Saving...' : workingArea ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
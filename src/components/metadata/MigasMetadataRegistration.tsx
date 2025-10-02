'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, FileText, MapPin, Calendar, Building2, Database } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  createMigasMetadata,
  validateMetadataSchema,
  type MigasMetadata,
  type DatasetType,
  type FileFormat,
  type CoordinateSystem,
  type SchemaValidationResult
} from '@/lib/actions/metadataMigas';

export default function MigasMetadataRegistration() {
  const [formData, setFormData] = useState({
    datasetName: '',
    description: '',
    datasetType: '' as DatasetType | '',
    fileFormat: '' as FileFormat | '',
    workingArea: '',
    fieldId: '',
    blockId: '',
    latitude: '',
    longitude: '',
    coordinateSystem: '' as CoordinateSystem | '',
    acquisitionDate: '',
    periodStart: '',
    periodEnd: '',
    kkksOwner: '',
    kkksId: '',
    sourceSystem: '',
    tags: '',
    category: '',
    confidentialityLevel: 'Confidential' as const
  });

  const [schemaFields, setSchemaFields] = useState<Array<{
    name: string;
    type: string;
    required: boolean;
    unit?: string;
    unique?: boolean;
  }>>([]);

  const [validationResults, setValidationResults] = useState<SchemaValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const datasetTypes: DatasetType[] = [
    'Well Log',
    'Production Data',
    'Facility Data',
    'Seismic 2D',
    'Seismic 3D',
    'Geological Data',
    'Reservoir Data',
    'Drilling Data',
    'Completion Data',
    'HSE Data'
  ];

  const fileFormats: FileFormat[] = [
    'SEG-Y',
    'LAS',
    'CSV',
    'Excel',
    'Shapefile',
    'GeoTIFF',
    'PDF',
    'JSON',
    'XML'
  ];

  const coordinateSystems: CoordinateSystem[] = [
    'WGS84',
    'UTM Zone 47N',
    'UTM Zone 48N',
    'UTM Zone 49N',
    'UTM Zone 50N',
    'UTM Zone 51N'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSchemaField = () => {
    setSchemaFields(prev => [...prev, { name: '', type: 'string', required: false }]);
  };

  const updateSchemaField = (index: number, field: string, value: any) => {
    setSchemaFields(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeSchemaField = (index: number) => {
    setSchemaFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const metadata: Partial<MigasMetadata> = {
        datasetName: formData.datasetName,
        description: formData.description,
        datasetType: formData.datasetType as DatasetType,
        fileFormat: formData.fileFormat as FileFormat,
        workingArea: formData.workingArea,
        fieldId: formData.fieldId || undefined,
        blockId: formData.blockId || undefined,
        coordinates: formData.latitude && formData.longitude ? {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          coordinateSystem: formData.coordinateSystem as CoordinateSystem
        } : undefined,
        acquisitionDate: formData.acquisitionDate ? new Date(formData.acquisitionDate) : new Date(),
        periodStart: formData.periodStart ? new Date(formData.periodStart) : undefined,
        periodEnd: formData.periodEnd ? new Date(formData.periodEnd) : undefined,
        kkksOwner: formData.kkksOwner,
        kkksId: formData.kkksId,
        sourceSystem: formData.sourceSystem,
        schema: { fields: schemaFields },
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        category: formData.category
      };

      const results = await validateMetadataSchema(metadata);
      setValidationResults(results);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await createMigasMetadata({
        datasetName: formData.datasetName,
        description: formData.description,
        datasetType: formData.datasetType as DatasetType,
        fileFormat: formData.fileFormat as FileFormat,
        workingArea: formData.workingArea,
        fieldId: formData.fieldId || undefined,
        blockId: formData.blockId || undefined,
        coordinates: formData.latitude && formData.longitude ? {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          coordinateSystem: formData.coordinateSystem as CoordinateSystem
        } : undefined,
        acquisitionDate: formData.acquisitionDate ? new Date(formData.acquisitionDate) : new Date(),
        periodStart: formData.periodStart ? new Date(formData.periodStart) : undefined,
        periodEnd: formData.periodEnd ? new Date(formData.periodEnd) : undefined,
        kkksOwner: formData.kkksOwner,
        kkksId: formData.kkksId,
        sourceSystem: formData.sourceSystem,
        schema: { fields: schemaFields },
        validationStandards: ['PPDM', 'SNI Migas', 'Satu Data Indonesia'],
        status: 'draft',
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        category: formData.category,
        confidentialityLevel: formData.confidentialityLevel,
        createdBy: 'current-user@kkks.co.id', // TODO: Get from auth context
        updatedBy: 'current-user@kkks.co.id'
      });

      setValidationResults(result.validation);
      setSubmitSuccess(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        // Reset form data if needed
      }, 2000);

    } catch (error: any) {
      console.error('Submit error:', error);
      alert(error.message || 'Failed to submit metadata');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allValidationsPassed = validationResults.length > 0 && validationResults.every(r => r.isValid);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Registrasi Metadata Migas</h2>
        <p className="text-muted-foreground mt-1">
          Daftarkan dataset baru sebelum transfer data fisik ke SKK Migas
        </p>
      </div>

      {/* Success Alert */}
      {submitSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Metadata berhasil didaftarkan!</AlertTitle>
          <AlertDescription className="text-green-700">
            Metadata telah disimpan dan siap untuk disubmit untuk approval.
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Informasi Dasar Dataset</CardTitle>
          </div>
          <CardDescription>Informasi umum tentang dataset yang akan didaftarkan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="datasetName">Nama Dataset *</Label>
              <Input
                id="datasetName"
                placeholder="contoh: Seismic Survey 2D Blok Mahakam 2024"
                value={formData.datasetName}
                onChange={(e) => handleInputChange('datasetName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="datasetType">Jenis Data *</Label>
              <Select value={formData.datasetType} onValueChange={(v) => handleInputChange('datasetType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis data" />
                </SelectTrigger>
                <SelectContent>
                  {datasetTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileFormat">Format File *</Label>
              <Select value={formData.fileFormat} onValueChange={(v) => handleInputChange('fileFormat', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih format" />
                </SelectTrigger>
                <SelectContent>
                  {fileFormats.map(format => (
                    <SelectItem key={format} value={format}>{format}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Input
                id="category"
                placeholder="contoh: Seismic Data"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi *</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi lengkap tentang dataset..."
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
            <Input
              id="tags"
              placeholder="seismic, 2d, mahakam, exploration"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location & Area */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <CardTitle>Lokasi & Wilayah Kerja</CardTitle>
          </div>
          <CardDescription>Informasi geografis dan area operasional</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workingArea">Wilayah Kerja *</Label>
              <Input
                id="workingArea"
                placeholder="contoh: Blok Mahakam"
                value={formData.workingArea}
                onChange={(e) => handleInputChange('workingArea', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldId">Field ID</Label>
              <Input
                id="fieldId"
                placeholder="contoh: MHK-001"
                value={formData.fieldId}
                onChange={(e) => handleInputChange('fieldId', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="blockId">Block ID</Label>
              <Input
                id="blockId"
                placeholder="contoh: BLK-MHKM-2024"
                value={formData.blockId}
                onChange={(e) => handleInputChange('blockId', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                placeholder="-0.5"
                value={formData.latitude}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                placeholder="117.5"
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coordinateSystem">Sistem Koordinat</Label>
              <Select value={formData.coordinateSystem} onValueChange={(v) => handleInputChange('coordinateSystem', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih sistem" />
                </SelectTrigger>
                <SelectContent>
                  {coordinateSystems.map(sys => (
                    <SelectItem key={sys} value={sys}>{sys}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Temporal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Informasi Temporal</CardTitle>
          </div>
          <CardDescription>Tanggal akuisisi dan periode data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="acquisitionDate">Tanggal Akuisisi *</Label>
              <Input
                id="acquisitionDate"
                type="date"
                value={formData.acquisitionDate}
                onChange={(e) => handleInputChange('acquisitionDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodStart">Periode Mulai</Label>
              <Input
                id="periodStart"
                type="date"
                value={formData.periodStart}
                onChange={(e) => handleInputChange('periodStart', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodEnd">Periode Akhir</Label>
              <Input
                id="periodEnd"
                type="date"
                value={formData.periodEnd}
                onChange={(e) => handleInputChange('periodEnd', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ownership & Source */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Kepemilikan & Sumber</CardTitle>
          </div>
          <CardDescription>Informasi KKKS dan sistem sumber data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kkksOwner">KKKS Pemilik *</Label>
              <Input
                id="kkksOwner"
                placeholder="contoh: PT Pertamina Hulu Energi"
                value={formData.kkksOwner}
                onChange={(e) => handleInputChange('kkksOwner', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kkksId">KKKS ID *</Label>
              <Input
                id="kkksId"
                placeholder="contoh: KKKS-001"
                value={formData.kkksId}
                onChange={(e) => handleInputChange('kkksId', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceSystem">Sistem Sumber *</Label>
              <Input
                id="sourceSystem"
                placeholder="contoh: SCADA Production System"
                value={formData.sourceSystem}
                onChange={(e) => handleInputChange('sourceSystem', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schema Definition */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Definisi Schema Data</CardTitle>
          </div>
          <CardDescription>Struktur field/kolom dalam dataset</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {schemaFields.map((field, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1 space-y-2">
                <Label>Nama Field</Label>
                <Input
                  placeholder="WELL_ID"
                  value={field.name}
                  onChange={(e) => updateSchemaField(index, 'name', e.target.value)}
                />
              </div>
              <div className="w-32 space-y-2">
                <Label>Tipe</Label>
                <Select value={field.type} onValueChange={(v) => updateSchemaField(index, 'type', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="integer">Integer</SelectItem>
                    <SelectItem value="float">Float</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32 space-y-2">
                <Label>Unit</Label>
                <Input
                  placeholder="BBLS"
                  value={field.unit || ''}
                  onChange={(e) => updateSchemaField(index, 'unit', e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateSchemaField(index, 'required', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Required</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.unique || false}
                    onChange={(e) => updateSchemaField(index, 'unique', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Unique</span>
                </label>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeSchemaField(index)}
              >
                Hapus
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addSchemaField}>
            + Tambah Field
          </Button>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hasil Validasi</CardTitle>
            <CardDescription>Validasi terhadap standar PPDM, SNI Migas, dan Satu Data Indonesia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationResults.map((result, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {result.isValid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-semibold">{result.standard}</span>
                  </div>
                  <Badge variant={result.isValid ? 'default' : 'destructive'}>
                    {result.isValid ? 'VALID' : 'INVALID'}
                  </Badge>
                </div>

                {result.errors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-600">Errors:</p>
                    {result.errors.map((error, i) => (
                      <Alert key={i} variant="destructive" className="py-2">
                        <AlertDescription className="text-sm">
                          <strong>{error.field}:</strong> {error.message}
                          <span className="text-xs ml-2">({error.rule})</span>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                {result.warnings.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-sm font-medium text-yellow-600">Warnings:</p>
                    {result.warnings.map((warning, i) => (
                      <Alert key={i} className="bg-yellow-50 border-yellow-200 py-2">
                        <AlertDescription className="text-sm text-yellow-800">
                          <strong>{warning.field}:</strong> {warning.message}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleValidate}
          disabled={isValidating}
          variant="outline"
        >
          {isValidating ? 'Memvalidasi...' : 'Validasi Schema'}
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !allValidationsPassed}
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Metadata'}
        </Button>
      </div>
    </div>
  );
}

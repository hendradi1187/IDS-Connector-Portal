'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, MapPin, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddWorkingAreaDialogProps {
  onWorkingAreaAdded?: () => void;
}

export default function AddWorkingAreaDialog({ onWorkingAreaAdded }: AddWorkingAreaDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    // Mandatory fields
    wkId: '',
    namaWk: '',
    statusWk: '',
    lokasi: '',

    // Contract fields
    jenisKontrak: '',
    effectiveDate: '',
    expireDate: '',
    holding: '',

    // Geographic fields
    provinsi1: '',
    provinsi2: '',
    namaCekungan: '',
    luasWk: '',

    // Business fields
    faseWk: '',
    participatingInterest: '',
    kewenangan: '',
    attachment: '',

    // Geometry (simplified)
    latitude: '',
    longitude: '',
    boundaryPoints: '',

    isActive: true
  });

  // Dropdown options based on Indonesian oil & gas industry
  const statusOptions = [
    'Eksplorasi', 'Pengembangan', 'Produksi', 'Rehabilitasi', 'Ditutup'
  ];

  const contractTypes = [
    'PSC', 'JOB', 'KKS', 'Kontrak Bagi Hasil', 'Kontrak Kerjasama'
  ];

  const provinces = [
    'Aceh', 'Sumatra Utara', 'Sumatra Barat', 'Riau', 'Kepulauan Riau', 'Jambi',
    'Sumatra Selatan', 'Bangka Belitung', 'Bengkulu', 'Lampung', 'DKI Jakarta',
    'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Banten',
    'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Kalimantan Barat',
    'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
    'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan', 'Sulawesi Tenggara',
    'Gorontalo', 'Sulawesi Barat', 'Maluku', 'Maluku Utara', 'Papua Barat', 'Papua'
  ];

  const basins = [
    'Sumatra Utara', 'Sumatra Tengah', 'Sumatra Selatan', 'Jawa Barat Utara',
    'Jawa Timur', 'Kutai', 'Barito', 'Tarakan', 'Tomori', 'Bone', 'Salawati',
    'Bintuni', 'Arafura', 'Natuna', 'Penyu', 'Malay'
  ];

  const phases = [
    'Eksplorasi', 'Studi Kelayakan', 'Pengembangan', 'Produksi', 'Enhanced Recovery'
  ];

  const authorities = ['Pusat', 'Daerah'];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Mandatory field validation
    if (!formData.wkId) errors.push('WK ID wajib diisi');
    if (!formData.namaWk) errors.push('Nama WK wajib diisi');
    if (!formData.statusWk) errors.push('Status WK wajib diisi');
    if (!formData.lokasi) errors.push('Lokasi wajib diisi');

    // Contract validation
    if (!formData.jenisKontrak) errors.push('Jenis Kontrak wajib diisi');
    if (!formData.effectiveDate) errors.push('Tanggal Efektif wajib diisi');
    if (!formData.expireDate) errors.push('Tanggal Berakhir wajib diisi');
    if (!formData.holding) errors.push('Holding wajib diisi');

    // Geographic validation
    if (!formData.provinsi1) errors.push('Provinsi 1 wajib diisi');
    if (!formData.namaCekungan) errors.push('Nama Cekungan wajib diisi');
    if (!formData.luasWk) errors.push('Luas WK wajib diisi');

    // Business validation
    if (!formData.faseWk) errors.push('Fase WK wajib diisi');
    if (!formData.participatingInterest) errors.push('Participating Interest wajib diisi');
    if (!formData.kewenangan) errors.push('Kewenangan wajib diisi');

    // Numeric validation
    if (formData.luasWk && isNaN(Number(formData.luasWk))) {
      errors.push('Luas WK harus berupa angka');
    }
    if (formData.participatingInterest && (isNaN(Number(formData.participatingInterest)) ||
        Number(formData.participatingInterest) < 0 || Number(formData.participatingInterest) > 100)) {
      errors.push('Participating Interest harus berupa angka 0-100');
    }

    // Date validation
    if (formData.effectiveDate && formData.expireDate) {
      const effective = new Date(formData.effectiveDate);
      const expire = new Date(formData.expireDate);
      if (effective >= expire) {
        errors.push('Tanggal berakhir harus setelah tanggal efektif');
      }
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('; '));
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Prepare geometry data (simplified polygon from lat/lng)
      const geometry = formData.latitude && formData.longitude ? {
        type: 'Polygon',
        coordinates: [[
          [Number(formData.longitude) - 0.1, Number(formData.latitude) + 0.1],
          [Number(formData.longitude) + 0.1, Number(formData.latitude) + 0.1],
          [Number(formData.longitude) + 0.1, Number(formData.latitude) - 0.1],
          [Number(formData.longitude) - 0.1, Number(formData.latitude) - 0.1],
          [Number(formData.longitude) - 0.1, Number(formData.latitude) + 0.1]
        ]]
      } : null;

      const payload = {
        wkId: formData.wkId,
        namaWk: formData.namaWk,
        statusWk: formData.statusWk,
        lokasi: formData.lokasi,
        jenisKontrak: formData.jenisKontrak,
        effectiveDate: new Date(formData.effectiveDate).toISOString(),
        expireDate: new Date(formData.expireDate).toISOString(),
        holding: formData.holding,
        provinsi1: formData.provinsi1,
        provinsi2: formData.provinsi2 || '',
        namaCekungan: formData.namaCekungan,
        luasWk: Number(formData.luasWk),
        faseWk: formData.faseWk,
        participatingInterest: Number(formData.participatingInterest),
        kewenangan: formData.kewenangan,
        attachment: formData.attachment || '',
        geometry,
        isActive: formData.isActive
      };

      const response = await fetch('/api/mdm/working-areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(true);
        onWorkingAreaAdded?.();
        setTimeout(() => {
          setOpen(false);
          resetForm();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Gagal menyimpan working area');
      }
    } catch (err) {
      setError('Gagal menyimpan working area. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      wkId: '',
      namaWk: '',
      statusWk: '',
      lokasi: '',
      jenisKontrak: '',
      effectiveDate: '',
      expireDate: '',
      holding: '',
      provinsi1: '',
      provinsi2: '',
      namaCekungan: '',
      luasWk: '',
      faseWk: '',
      participatingInterest: '',
      kewenangan: '',
      attachment: '',
      latitude: '',
      longitude: '',
      boundaryPoints: '',
      isActive: true
    });
    setSaving(false);
    setSuccess(false);
    setError('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!saving) {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Working Area
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Tambah Working Area Baru
          </DialogTitle>
          <DialogDescription>
            Isi form sesuai SKK Migas Data Specification v2. Field bertanda (*) wajib diisi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mandatory Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-600">Data Wajib</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wkId">WK ID *</Label>
                <Input
                  id="wkId"
                  value={formData.wkId}
                  onChange={(e) => handleInputChange('wkId', e.target.value)}
                  placeholder="Contoh: WK-001"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="namaWk">Nama WK *</Label>
                <Input
                  id="namaWk"
                  value={formData.namaWk}
                  onChange={(e) => handleInputChange('namaWk', e.target.value)}
                  placeholder="Contoh: Blok Mahakam"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statusWk">Status WK *</Label>
                <Select value={formData.statusWk} onValueChange={(value) => handleInputChange('statusWk', value)} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lokasi">Lokasi *</Label>
                <Input
                  id="lokasi"
                  value={formData.lokasi}
                  onChange={(e) => handleInputChange('lokasi', e.target.value)}
                  placeholder="Contoh: Kalimantan Timur"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Contract Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-600">Data Kontrak</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jenisKontrak">Jenis Kontrak *</Label>
                <Select value={formData.jenisKontrak} onValueChange={(value) => handleInputChange('jenisKontrak', value)} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kontrak..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="holding">Holding *</Label>
                <Input
                  id="holding"
                  value={formData.holding}
                  onChange={(e) => handleInputChange('holding', e.target.value)}
                  placeholder="Contoh: PT Pertamina EP"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Tanggal Efektif *</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expireDate">Tanggal Berakhir *</Label>
                <Input
                  id="expireDate"
                  type="date"
                  value={formData.expireDate}
                  onChange={(e) => handleInputChange('expireDate', e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Geographic Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-600">Data Geografis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provinsi1">Provinsi 1 *</Label>
                <Select value={formData.provinsi1} onValueChange={(value) => handleInputChange('provinsi1', value)} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih provinsi..." />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((prov) => (
                      <SelectItem key={prov} value={prov}>
                        {prov}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="provinsi2">Provinsi 2 (Opsional)</Label>
                <Select value={formData.provinsi2} onValueChange={(value) => handleInputChange('provinsi2', value)} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih provinsi kedua..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tidak Ada</SelectItem>
                    {provinces.map((prov) => (
                      <SelectItem key={prov} value={prov}>
                        {prov}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="namaCekungan">Nama Cekungan *</Label>
                <Select value={formData.namaCekungan} onValueChange={(value) => handleInputChange('namaCekungan', value)} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih cekungan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {basins.map((basin) => (
                      <SelectItem key={basin} value={basin}>
                        {basin}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="luasWk">Luas WK (km²) *</Label>
                <Input
                  id="luasWk"
                  type="number"
                  step="0.01"
                  value={formData.luasWk}
                  onChange={(e) => handleInputChange('luasWk', e.target.value)}
                  placeholder="Contoh: 2500.75"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Business Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-600">Data Bisnis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faseWk">Fase WK *</Label>
                <Select value={formData.faseWk} onValueChange={(value) => handleInputChange('faseWk', value)} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih fase..." />
                  </SelectTrigger>
                  <SelectContent>
                    {phases.map((phase) => (
                      <SelectItem key={phase} value={phase}>
                        {phase}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="participatingInterest">Participating Interest (%) *</Label>
                <Input
                  id="participatingInterest"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.participatingInterest}
                  onChange={(e) => handleInputChange('participatingInterest', e.target.value)}
                  placeholder="Contoh: 60.00"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kewenangan">Kewenangan *</Label>
                <Select value={formData.kewenangan} onValueChange={(value) => handleInputChange('kewenangan', value)} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kewenangan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {authorities.map((auth) => (
                      <SelectItem key={auth} value={auth}>
                        {auth}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="attachment">Attachment (Opsional)</Label>
                <Input
                  id="attachment"
                  value={formData.attachment}
                  onChange={(e) => handleInputChange('attachment', e.target.value)}
                  placeholder="Contoh: contract.pdf"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Geometry Fields (Simplified) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-600">Koordinat (WGS 84 - EPSG:4326)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude (Titik Tengah)</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  placeholder="Contoh: -1.0"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude (Titik Tengah)</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  placeholder="Contoh: 117.5"
                  disabled={saving}
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Koordinat akan digunakan untuk membuat geometry polygon sederhana.
              Untuk boundary yang lebih detail, gunakan fitur import shapefile.
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked as boolean)}
              disabled={saving}
            />
            <Label htmlFor="isActive">Working Area Aktif</Label>
          </div>

          {/* Success Alert */}
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Working Area berhasil ditambahkan! Dialog akan tutup otomatis.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Working Area'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
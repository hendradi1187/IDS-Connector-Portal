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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface AddWorkingAreaButtonProps {
  onSuccess?: () => void;
}

export default function AddWorkingAreaButton({ onSuccess }: AddWorkingAreaButtonProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Form state - hanya field penting untuk MVP
  const [formData, setFormData] = useState({
    wkId: '',
    namaWk: '',
    statusWk: '',
    lokasi: '',
    jenisKontrak: '',
    effectiveDate: '',
    expireDate: '',
    holding: '',
    provinsi1: '',
    namaCekungan: '',
    luasWk: '',
    faseWk: '',
    participatingInterest: '',
    kewenangan: '',
    isActive: true
  });

  const statusOptions = ['Eksplorasi', 'Pengembangan', 'Produksi', 'Rehabilitasi'];
  const contractTypes = ['PSC', 'JOB', 'KKS', 'Kontrak Bagi Hasil'];
  const provinces = ['Kalimantan Timur', 'Kepulauan Riau', 'Riau', 'Jawa Tengah', 'Maluku'];
  const basins = ['Kutai', 'Natuna', 'Sumatra Tengah', 'Jawa Timur', 'Arafura'];
  const phases = ['Eksplorasi', 'Pengembangan', 'Produksi'];
  const authorities = ['Pusat', 'Daerah'];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.wkId || !formData.namaWk || !formData.statusWk || !formData.lokasi) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Field wajib tidak boleh kosong'
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        effectiveDate: formData.effectiveDate ? new Date(formData.effectiveDate).toISOString() : null,
        expireDate: formData.expireDate ? new Date(formData.expireDate).toISOString() : null,
        luasWk: formData.luasWk ? Number(formData.luasWk) : null,
        participatingInterest: formData.participatingInterest ? Number(formData.participatingInterest) : null,
        // Simple geometry placeholder
        geometry: {
          type: 'Point',
          coordinates: [117.0, -1.0]
        }
      };

      const response = await fetch('/api/mdm/working-areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Working Area berhasil ditambahkan'
        });
        setOpen(false);
        resetForm();
        onSuccess?.();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      wkId: '', namaWk: '', statusWk: '', lokasi: '', jenisKontrak: '',
      effectiveDate: '', expireDate: '', holding: '', provinsi1: '',
      namaCekungan: '', luasWk: '', faseWk: '', participatingInterest: '',
      kewenangan: '', isActive: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Working Area
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Tambah Working Area Baru
          </DialogTitle>
          <DialogDescription>
            Isi data Working Area sesuai SKK Migas Data Specification v2
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Row 1 */}
          <div className="space-y-2">
            <Label htmlFor="wkId">WK ID *</Label>
            <Input
              id="wkId"
              value={formData.wkId}
              onChange={(e) => handleInputChange('wkId', e.target.value)}
              placeholder="WK-001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="namaWk">Nama WK *</Label>
            <Input
              id="namaWk"
              value={formData.namaWk}
              onChange={(e) => handleInputChange('namaWk', e.target.value)}
              placeholder="Blok Mahakam"
            />
          </div>

          {/* Row 2 */}
          <div className="space-y-2">
            <Label>Status WK *</Label>
            <Select value={formData.statusWk} onValueChange={(value) => handleInputChange('statusWk', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status..." />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
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
              placeholder="Kalimantan Timur"
            />
          </div>

          {/* Row 3 */}
          <div className="space-y-2">
            <Label>Jenis Kontrak</Label>
            <Select value={formData.jenisKontrak} onValueChange={(value) => handleInputChange('jenisKontrak', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kontrak..." />
              </SelectTrigger>
              <SelectContent>
                {contractTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="holding">Holding</Label>
            <Input
              id="holding"
              value={formData.holding}
              onChange={(e) => handleInputChange('holding', e.target.value)}
              placeholder="PT Pertamina EP"
            />
          </div>

          {/* Row 4 */}
          <div className="space-y-2">
            <Label htmlFor="effectiveDate">Tanggal Efektif</Label>
            <Input
              id="effectiveDate"
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expireDate">Tanggal Berakhir</Label>
            <Input
              id="expireDate"
              type="date"
              value={formData.expireDate}
              onChange={(e) => handleInputChange('expireDate', e.target.value)}
            />
          </div>

          {/* Row 5 */}
          <div className="space-y-2">
            <Label>Provinsi</Label>
            <Select value={formData.provinsi1} onValueChange={(value) => handleInputChange('provinsi1', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih provinsi..." />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((prov) => (
                  <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cekungan</Label>
            <Select value={formData.namaCekungan} onValueChange={(value) => handleInputChange('namaCekungan', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih cekungan..." />
              </SelectTrigger>
              <SelectContent>
                {basins.map((basin) => (
                  <SelectItem key={basin} value={basin}>{basin}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Row 6 */}
          <div className="space-y-2">
            <Label htmlFor="luasWk">Luas WK (km²)</Label>
            <Input
              id="luasWk"
              type="number"
              step="0.01"
              value={formData.luasWk}
              onChange={(e) => handleInputChange('luasWk', e.target.value)}
              placeholder="2500.75"
            />
          </div>
          <div className="space-y-2">
            <Label>Fase WK</Label>
            <Select value={formData.faseWk} onValueChange={(value) => handleInputChange('faseWk', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih fase..." />
              </SelectTrigger>
              <SelectContent>
                {phases.map((phase) => (
                  <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Row 7 */}
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
              placeholder="60.00"
            />
          </div>
          <div className="space-y-2">
            <Label>Kewenangan</Label>
            <Select value={formData.kewenangan} onValueChange={(value) => handleInputChange('kewenangan', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kewenangan..." />
              </SelectTrigger>
              <SelectContent>
                {authorities.map((auth) => (
                  <SelectItem key={auth} value={auth}>{auth}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Checkbox */}
          <div className="col-span-2 flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked as boolean)}
            />
            <Label htmlFor="isActive">Working Area Aktif</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
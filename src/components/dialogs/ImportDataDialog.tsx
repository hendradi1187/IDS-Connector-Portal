'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface ImportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ImportDataDialog({ open, onOpenChange }: ImportDataDialogProps) {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const domains = [
    { value: 'working-areas', label: 'Working Areas (Wilayah Kerja)' },
    { value: 'seismic-surveys', label: 'Seismic Surveys (Survei Seismik)' },
    { value: 'wells', label: 'Wells (Sumur)' },
    { value: 'fields', label: 'Fields (Lapangan)' },
    { value: 'facilities', label: 'Facilities (Fasilitas)' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' ||
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please select a valid CSV or Excel file.');
        setSelectedFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedDomain) {
      setError('Please select both domain and file.');
      return;
    }

    setImporting(true);
    setProgress(0);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('domain', selectedDomain);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      const response = await fetch('/api/mdm/import', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        setTimeout(() => {
          onOpenChange(false);
          resetForm();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Import failed. Please check your file format.');
      }
    } catch (err) {
      setError('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const resetForm = () => {
    setSelectedDomain('');
    setSelectedFile(null);
    setImporting(false);
    setProgress(0);
    setSuccess(false);
    setError('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!importing) {
      onOpenChange(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data MDM
          </DialogTitle>
          <DialogDescription>
            Import data dari file CSV atau Excel ke domain MDM yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Domain Selection */}
          <div className="space-y-2">
            <Label htmlFor="domain">Select Domain</Label>
            <Select value={selectedDomain} onValueChange={setSelectedDomain} disabled={importing}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih domain data..." />
              </SelectTrigger>
              <SelectContent>
                {domains.map((domain) => (
                  <SelectItem key={domain.value} value={domain.value}>
                    {domain.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Selection */}
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={importing}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing data...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Data imported successfully! Dialog will close automatically.
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

          {/* Import Guidelines */}
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium mb-2">Import Guidelines:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• File harus dalam format CSV atau Excel (.xlsx, .xls)</li>
              <li>• Header kolom harus sesuai dengan SKK Migas Data Spec v2</li>
              <li>• Coordinate system harus WGS 84 (EPSG:4326)</li>
              <li>• Maximum file size: 10MB</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={importing}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!selectedFile || !selectedDomain || importing}>
            {importing ? 'Importing...' : 'Import Data'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface ExportReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExportReportDialog({ open, onOpenChange }: ExportReportDialogProps) {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState('');
  const [exportType, setExportType] = useState('');
  const [exporting, setExporting] = useState(false);
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

  const formats = [
    { value: 'pdf', label: 'PDF Report' },
    { value: 'excel', label: 'Excel Spreadsheet (.xlsx)' },
    { value: 'csv', label: 'CSV Files' },
  ];

  const types = [
    { value: 'summary', label: 'Summary Report - Overview dan statistik' },
    { value: 'detailed', label: 'Detailed Report - Data lengkap dengan validasi' },
    { value: 'compliance', label: 'Compliance Report - Status kepatuhan SKK Migas' },
  ];

  const handleDomainChange = (domain: string, checked: boolean) => {
    if (checked) {
      setSelectedDomains(prev => [...prev, domain]);
    } else {
      setSelectedDomains(prev => prev.filter(d => d !== domain));
    }
  };

  const handleExport = async () => {
    if (selectedDomains.length === 0 || !exportFormat || !exportType) {
      setError('Please select domains, format, and report type.');
      return;
    }

    setExporting(true);
    setProgress(0);
    setError('');

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 15;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      const response = await fetch('/api/mdm/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domains: selectedDomains,
          format: exportFormat,
          type: exportType,
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const extension = exportFormat === 'pdf' ? 'pdf' : exportFormat === 'excel' ? 'xlsx' : 'zip';
        link.download = `MDM_${exportType}_Report_${timestamp}.${extension}`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setSuccess(true);
        setTimeout(() => {
          onOpenChange(false);
          resetForm();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Export failed. Please try again.');
      }
    } catch (err) {
      setError('Export failed. Please check your connection and try again.');
    } finally {
      setExporting(false);
    }
  };

  const resetForm = () => {
    setSelectedDomains([]);
    setExportFormat('');
    setExportType('');
    setExporting(false);
    setProgress(0);
    setSuccess(false);
    setError('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!exporting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Report MDM
          </DialogTitle>
          <DialogDescription>
            Generate dan download laporan data MDM dalam berbagai format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Domain Selection */}
          <div className="space-y-3">
            <Label>Select Domains to Export</Label>
            <div className="grid grid-cols-1 gap-3">
              {domains.map((domain) => (
                <div key={domain.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={domain.value}
                    checked={selectedDomains.includes(domain.value)}
                    onCheckedChange={(checked) =>
                      handleDomainChange(domain.value, checked as boolean)
                    }
                    disabled={exporting}
                  />
                  <Label htmlFor={domain.value} className="text-sm">
                    {domain.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Report Type</Label>
            <Select value={exportType} onValueChange={setExportType} disabled={exporting}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis laporan..." />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export Format */}
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={exportFormat} onValueChange={setExportFormat} disabled={exporting}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih format export..." />
              </SelectTrigger>
              <SelectContent>
                {formats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Progress Bar */}
          {exporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating report...</span>
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
                Report generated successfully! Download should start automatically.
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

          {/* Export Info */}
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium mb-2">Export Information:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• PDF: Laporan lengkap dengan grafik dan visualisasi</li>
              <li>• Excel: Data terstruktur dalam spreadsheet</li>
              <li>• CSV: Data mentah untuk analisis lebih lanjut</li>
              <li>• Include metadata compliance dengan SKK Migas Data Spec v2</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={selectedDomains.length === 0 || !exportFormat || !exportType || exporting}
          >
            {exporting ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
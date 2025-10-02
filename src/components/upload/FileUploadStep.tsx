'use client';

import { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertTriangle,
  FileText,
  Database,
  Image,
  FileArchive,
  FileSpreadsheet,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FileUploadStepProps {
  files: File[];
  updateFiles: (files: File[]) => void;
  expectedFormat?: string;
}

interface FileWithProgress extends File {
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const getFileIcon = (file: File) => {
  const type = file.type;
  const name = file.name.toLowerCase();

  if (type.startsWith('image/')) return Image;
  if (type.includes('spreadsheet') || name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) return FileSpreadsheet;
  if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) return FileArchive;
  if (name.endsWith('.json') || name.endsWith('.xml')) return Database;
  if (type.includes('text') || name.endsWith('.txt') || name.endsWith('.log')) return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileTypeValidation = (file: File, expectedFormat?: string) => {
  if (!expectedFormat) return { valid: true, message: '' };

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  const formatValidations: Record<string, (file: File) => boolean> = {
    'csv': (f) => f.name.toLowerCase().endsWith('.csv') || f.type.includes('csv'),
    'json': (f) => f.name.toLowerCase().endsWith('.json') || f.type.includes('json'),
    'xml': (f) => f.name.toLowerCase().endsWith('.xml') || f.type.includes('xml'),
    'excel': (f) => f.name.toLowerCase().match(/\.(xlsx|xls)$/) !== null,
    'segy': (f) => f.name.toLowerCase().match(/\.(segy|sgy)$/) !== null,
    'las': (f) => f.name.toLowerCase().endsWith('.las'),
    'parquet': (f) => f.name.toLowerCase().endsWith('.parquet'),
    'hdf5': (f) => f.name.toLowerCase().match(/\.(hdf5|h5)$/) !== null,
    'netcdf': (f) => f.name.toLowerCase().match(/\.(nc|netcdf)$/) !== null,
  };

  const isValid = formatValidations[expectedFormat]?.(file) ?? true;

  return {
    valid: isValid,
    message: isValid ? '' : `Expected ${expectedFormat.toUpperCase()} format, but received ${fileName.split('.').pop()?.toUpperCase()}`
  };
};

export default function FileUploadStep({ files, updateFiles, expectedFormat }: FileUploadStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<FileWithProgress[]>([]);
  const { toast } = useToast();

  const simulateUpload = useCallback(async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const fileId = Math.random().toString(36).substr(2, 9);
      const fileWithProgress: FileWithProgress = {
        ...file,
        id: fileId,
        progress: 0,
        status: 'uploading'
      };

      setUploadingFiles(prev => [...prev, fileWithProgress]);

      const interval = setInterval(() => {
        setUploadingFiles(prev =>
          prev.map(f => {
            if (f.id === fileId) {
              const newProgress = Math.min(f.progress + Math.random() * 30, 100);
              if (newProgress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                  setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
                  resolve();
                }, 500);
                return { ...f, progress: 100, status: 'completed' as const };
              }
              return { ...f, progress: newProgress };
            }
            return f;
          })
        );
      }, 200);

      // Simulate potential error (5% chance)
      if (Math.random() < 0.05) {
        setTimeout(() => {
          clearInterval(interval);
          setUploadingFiles(prev =>
            prev.map(f =>
              f.id === fileId
                ? { ...f, status: 'error' as const, error: 'Upload failed. Please try again.' }
                : f
            )
          );
          reject(new Error('Upload failed'));
        }, 1000 + Math.random() * 2000);
      }
    });
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    await handleFiles(droppedFiles);
  }, [expectedFormat, files]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      await handleFiles(selectedFiles);
    }
  }, [expectedFormat, files]);

  const handleFiles = async (newFiles: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    newFiles.forEach(file => {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        errors.push(`${file.name}: File size exceeds 100MB limit`);
        return;
      }

      // Check if file already exists
      if (files.some(existingFile => existingFile.name === file.name && existingFile.size === file.size)) {
        errors.push(`${file.name}: File already added`);
        return;
      }

      // Validate file format
      const validation = getFileTypeValidation(file, expectedFormat);
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.message}`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      toast({
        variant: 'destructive',
        title: 'File Upload Errors',
        description: errors.join('\n'),
      });
    }

    if (validFiles.length > 0) {
      try {
        // Simulate upload process
        await Promise.all(validFiles.map(file => simulateUpload(file)));

        updateFiles([...files, ...validFiles]);

        toast({
          title: 'Files Uploaded Successfully',
          description: `${validFiles.length} file(s) uploaded successfully.`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: 'Some files failed to upload. Please try again.',
        });
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    updateFiles(newFiles);
  };

  const retryUpload = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Dataset Files</CardTitle>
          <CardDescription>
            Upload your dataset files. Supported formats: CSV, JSON, Excel, SEG-Y, LAS, and more.
            {expectedFormat && ` Expected format: ${expectedFormat.toUpperCase()}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Maximum file size: 100MB per file
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Select Files
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploading Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadingFiles.map((file) => {
                const Icon = getFileIcon(file);
                return (
                  <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                      {file.status === 'uploading' && (
                        <Progress value={file.progress} className="mt-2" />
                      )}
                      {file.status === 'error' && (
                        <p className="text-sm text-destructive mt-1">{file.error}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {file.status === 'error' && (
                        <>
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retryUpload(file.id)}
                          >
                            Retry
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({files.length})</CardTitle>
            <CardDescription>
              Files ready for validation and submission.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {files.map((file, index) => {
                const Icon = getFileIcon(file);
                const validation = getFileTypeValidation(file, expectedFormat);

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-3 p-3 border rounded-lg",
                      !validation.valid && "border-destructive bg-destructive/5"
                    )}
                  >
                    <Icon className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • Last modified: {new Date(file.lastModified).toLocaleDateString()}
                      </p>
                      {!validation.valid && (
                        <p className="text-sm text-destructive mt-1">
                          {validation.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {validation.valid ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Guidelines */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h4 className="font-medium text-blue-900">File Upload Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Maximum file size: 100MB per file</li>
              <li>• Supported formats: CSV, JSON, XML, Excel, SEG-Y, LAS, Parquet, HDF5, NetCDF</li>
              <li>• File names should be descriptive and follow naming conventions</li>
              <li>• Ensure data quality and completeness before upload</li>
              <li>• Large datasets can be split into multiple files</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
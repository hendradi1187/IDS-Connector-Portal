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

interface Dataset {
  id: string;
  name: string;
  owner: string;
  ownerType: 'KKKS' | 'SKK_MIGAS' | 'VENDOR';
  location: string;
  locationType: 'URL' | 'STORAGE' | 'API';
  format: string;
  dataType: 'SEISMIC' | 'WELL' | 'PRODUCTION' | 'GEOLOGICAL';
  quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  accessLevel: 'PUBLIC' | 'RESTRICTED' | 'INTERNAL';
  lastValidation: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_REVIEW';
  tags: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface EditDatasetDialogProps {
  dataset: Dataset;
  children: React.ReactNode;
}

export default function EditDatasetDialog({ dataset, children }: EditDatasetDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Dataset</DialogTitle>
          <DialogDescription>
            Update metadata information for "{dataset.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Edit functionality will be implemented here with a form similar to AddDatasetForm
            but pre-populated with current dataset values.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
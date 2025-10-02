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
import { PlusCircle } from 'lucide-react';
import AddDatasetForm from './AddDatasetForm';

interface AddDatasetDialogProps {
  children?: React.ReactNode;
  asChild?: boolean;
}

export default function AddDatasetDialog({ children, asChild }: AddDatasetDialogProps) {
  const [open, setOpen] = useState(false);

  if (asChild && children) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Dataset</DialogTitle>
            <DialogDescription>
              Register a new dataset with complete metadata information for tracking and access control.
            </DialogDescription>
          </DialogHeader>
          <AddDatasetForm setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Add Dataset</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Dataset</DialogTitle>
          <DialogDescription>
            Register a new dataset with complete metadata information for tracking and access control.
          </DialogDescription>
        </DialogHeader>
        <AddDatasetForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
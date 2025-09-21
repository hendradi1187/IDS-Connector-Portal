'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EditServiceApplicationForm } from './EditServiceApplicationForm';
import { useState } from 'react';
import { ServiceApplication } from '@/lib/types';

type EditServiceApplicationDialogProps = {
  serviceApp: ServiceApplication;
  children: React.ReactNode;
};

export default function EditServiceApplicationDialog({ serviceApp, children }: EditServiceApplicationDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Service Application</DialogTitle>
          <DialogDescription>
            Update the details for {serviceApp.name}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <EditServiceApplicationForm serviceApp={serviceApp} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

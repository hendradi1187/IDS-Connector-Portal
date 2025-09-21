'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EditResourceForm } from './EditResourceForm';
import { useState } from 'react';
import { Resource } from '@/lib/types';

type EditResourceDialogProps = {
  resource: Resource;
  children: React.ReactNode;
};

export default function EditResourceDialog({ resource, children }: EditResourceDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Resource</DialogTitle>
          <DialogDescription>
            Update the details for {resource.name}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <EditResourceForm resource={resource} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

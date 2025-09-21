'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EditBrokerForm } from './EditBrokerForm';
import { useState } from 'react';
import { Broker } from '@/lib/types';

type EditBrokerDialogProps = {
  broker: Broker;
  children: React.ReactNode;
};

export default function EditBrokerDialog({ broker, children }: EditBrokerDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Broker</DialogTitle>
          <DialogDescription>
            Update the details for {broker.name}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <EditBrokerForm broker={broker} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

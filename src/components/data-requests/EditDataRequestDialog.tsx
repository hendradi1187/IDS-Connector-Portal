'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EditDataRequestForm } from './EditDataRequestForm';
import { useState } from 'react';
import { DataRequest } from '@/lib/types';

type EditDataRequestDialogProps = {
  dataRequest: DataRequest;
  children: React.ReactNode;
};

export default function EditDataRequestDialog({ dataRequest, children }: EditDataRequestDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Data Request</DialogTitle>
          <DialogDescription>
            Update the status for the request: "{dataRequest.resourceName}".
          </DialogDescription>
        </DialogHeader>
        <EditDataRequestForm dataRequest={dataRequest} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

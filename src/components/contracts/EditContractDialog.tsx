'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EditContractForm } from './EditContractForm';
import { useState } from 'react';
import { Contract } from '@/lib/types';

type EditContractDialogProps = {
  contract: Contract;
  children: React.ReactNode;
};

export default function EditContractDialog({ contract, children }: EditContractDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Contract</DialogTitle>
          <DialogDescription>
            Update the details for {contract.name}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <EditContractForm contract={contract} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

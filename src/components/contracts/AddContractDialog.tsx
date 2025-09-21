'use client';

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
import { AddContractForm } from './AddContractForm';
import { useState } from 'react';

export default function AddContractDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Add Contract</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Contract</DialogTitle>
          <DialogDescription>
            Enter the details for the new contract. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <AddContractForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

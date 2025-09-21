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
import { AddDataRequestForm } from './AddDataRequestForm';
import { useState } from 'react';

export default function AddDataRequestDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span>New Request</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Data Request</DialogTitle>
          <DialogDescription>
            Select a resource, contract, and destination for the data.
          </DialogDescription>
        </DialogHeader>
        <AddDataRequestForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

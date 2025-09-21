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
import { AddConfigForm } from './AddConfigForm';
import { useState } from 'react';

export default function AddConfigDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Add Config</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Config</DialogTitle>
          <DialogDescription>
            Enter the details for the new configuration. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <AddConfigForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

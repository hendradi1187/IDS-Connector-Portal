'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EditConfigForm } from './EditConfigForm';
import { useState } from 'react';
import { Config } from '@/lib/types';

type EditConfigDialogProps = {
  config: Config;
  children: React.ReactNode;
};

export default function EditConfigDialog({ config, children }: EditConfigDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Config</DialogTitle>
          <DialogDescription>
            Update the details for {config.key}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <EditConfigForm config={config} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

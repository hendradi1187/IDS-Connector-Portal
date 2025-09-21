'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EditRouteForm } from './EditRouteForm';
import { useState } from 'react';
import { Route } from '@/lib/types';

type EditRouteDialogProps = {
  route: Route;
  children: React.ReactNode;
};

export default function EditRouteDialog({ route, children }: EditRouteDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Route</DialogTitle>
          <DialogDescription>
            Update the details for {route.name}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <EditRouteForm route={route} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

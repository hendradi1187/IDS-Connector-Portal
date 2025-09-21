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
import { AddResourceForm } from './AddResourceForm';
import { useState } from 'react';

export default function AddResourceDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Tambah Sumber Daya</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Sumber Daya Baru</DialogTitle>
          <DialogDescription>
            Daftarkan metadata untuk sumber daya data baru, seperti peta GeoJSON atau data sumur.
          </DialogDescription>
        </DialogHeader>
        <AddResourceForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

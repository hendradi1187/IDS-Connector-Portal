'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EditUserForm } from './EditUserForm';
import { useState } from 'react';
import { User } from '@/lib/types';

type EditUserDialogProps = {
  user: User;
  children: React.ReactNode;
};

export default function EditUserDialog({ user, children }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the details for {user.name}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <EditUserForm user={user} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
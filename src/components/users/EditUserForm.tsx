'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateUser } from '@/app/users/actions';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/types';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  role: z.enum(['Admin', 'KKKS-Provider', 'SKK-Consumer']),
  organization: z.string().min(2, { message: 'Organization is required.'}),
});

type EditUserFormProps = {
  user: User;
  setOpen: (open: boolean) => void;
};

export function EditUserForm({ user, setOpen }: EditUserFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // RBAC check
  const canEditUser = currentUser?.role === 'Admin';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'SKK-Consumer',
      organization: user.organization || '',
    },
    mode: 'onChange',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!canEditUser) {
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'You do not have permission to edit users.',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Updating user:', { id: user.id, ...values, email: values.email.substring(0, 3) + '***' });

      await updateUser(user.id, values);

      toast({
        title: 'User Updated Successfully! ✅',
        description: `User ${values.name} has been successfully updated.`,
      });

      setOpen(false);
    } catch (error) {
      console.error('❌ Update user error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to update user. Please try again.';

      toast({
        variant: 'destructive',
        title: 'Update Failed ❌',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <FormControl>
                <Input placeholder="e.g., SKK Migas or Pertamina" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="KKKS-Provider">KKKS-Provider</SelectItem>
                  <SelectItem value="SKK-Consumer">SKK-Consumer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}

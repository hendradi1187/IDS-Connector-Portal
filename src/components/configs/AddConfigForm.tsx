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
import { Textarea } from '@/components/ui/textarea';
import { addConfig } from '@/app/configs/actions';
import { useToast } from '@/hooks/use-toast';
import { Config } from '@/lib/types';
import { useState } from 'react';

const formSchema = z.object({
  key: z.string().min(2, {
    message: 'Key must be at least 2 characters.',
  }).refine(s => !s.includes(' '), 'Key cannot contain spaces.'),
  value: z.string().min(1, {
    message: 'Value cannot be empty.',
  }),
  description: z.string().optional(),
});

type AddConfigFormProps = {
  setOpen: (open: boolean) => void;
};

export function AddConfigForm({ setOpen }: AddConfigFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key: '',
      value: '',
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const configData = {
        ...values,
        description: values.description || '',
        created: new Date().toISOString(),
      };
      await addConfig(configData as Omit<Config, 'id'>);
      toast({
        title: 'Config Added',
        description: `Configuration "${values.key}" has been successfully added.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add config. Please try again.',
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
          name="key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key</FormLabel>
              <FormControl>
                <Input placeholder="e.g., API_ENDPOINT" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter sensitive value" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe what this configuration is for." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Config'}
        </Button>
      </form>
    </Form>
  );
}

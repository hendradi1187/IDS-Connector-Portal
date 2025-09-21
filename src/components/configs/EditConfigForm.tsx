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
import { updateConfig } from '@/app/configs/actions';
import { useToast } from '@/hooks/use-toast';
import { Config } from '@/lib/types';
import { useState } from 'react';

const formSchema = z.object({
  key: z.string().min(2, {
    message: 'Key must be at least 2 characters.',
  }).refine(s => !s.includes(' '), 'Key cannot contain spaces.'),
  value: z.string().optional(),
  description: z.string().optional(),
});

type EditConfigFormProps = {
  config: Config;
  setOpen: (open: boolean) => void;
};

export function EditConfigForm({ config, setOpen }: EditConfigFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key: config.key,
      value: '',
      description: config.description,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const updateData: Partial<Config> = {
        key: values.key,
        description: values.description || '',
      };
      if (values.value) {
        updateData.value = values.value;
      }

      await updateConfig(config.id, updateData);
      toast({
        title: 'Config Updated',
        description: `Configuration "${values.key}" has been successfully updated.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update config. Please try again.',
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
              <FormLabel>New Value (Optional)</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter new value to change" {...field} />
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
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}

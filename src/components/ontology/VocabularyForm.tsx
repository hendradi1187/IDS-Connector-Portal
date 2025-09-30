'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createVocabulary, updateVocabulary } from '@/app/vocabularies/actions';
import type { Vocabulary } from '@/lib/types';

const vocabularyFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  version: z.string().min(1, 'Version is required'),
  namespace: z.string().url('Must be a valid URL'),
  status: z.enum(['Active', 'Draft', 'Deprecated']),
});

type VocabularyFormValues = z.infer<typeof vocabularyFormSchema>;

interface VocabularyFormProps {
  vocabulary?: Vocabulary | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VocabularyForm({
  vocabulary,
  onSuccess,
  onCancel,
}: VocabularyFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<VocabularyFormValues>({
    resolver: zodResolver(vocabularyFormSchema),
    defaultValues: vocabulary
      ? {
          name: vocabulary.name,
          description: vocabulary.description,
          version: vocabulary.version,
          namespace: vocabulary.namespace,
          status: vocabulary.status,
        }
      : {
          name: '',
          description: '',
          version: '1.0',
          namespace: 'https://ids-connector.example.com/vocab/',
          status: 'Draft',
        },
  });

  const onSubmit = async (data: VocabularyFormValues) => {
    setLoading(true);
    try {
      let result;
      if (vocabulary) {
        result = await updateVocabulary(vocabulary.id, data);
      } else {
        result = await createVocabulary(data);
      }

      if (result.success) {
        toast({
          title: vocabulary ? 'Vocabulary Updated' : 'Vocabulary Created',
          description: result.message,
        });
        onSuccess();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="SKK Migas Data Vocabulary" {...field} />
              </FormControl>
              <FormDescription>The display name of the vocabulary</FormDescription>
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
                <Textarea
                  placeholder="Standard vocabulary untuk data hulu migas Indonesia..."
                  {...field}
                />
              </FormControl>
              <FormDescription>A brief description of the vocabulary purpose</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Version</FormLabel>
                <FormControl>
                  <Input placeholder="1.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="namespace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Namespace</FormLabel>
              <FormControl>
                <Input placeholder="https://ids-connector.example.com/vocab/" {...field} />
              </FormControl>
              <FormDescription>URI namespace for concepts (must be a valid URL)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : vocabulary ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

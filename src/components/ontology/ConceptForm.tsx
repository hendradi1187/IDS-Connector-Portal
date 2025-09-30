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
import { createConcept, updateConcept } from '@/app/vocabularies/actions';
import type { Concept } from '@/lib/types';

const conceptFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  label: z.string().min(2, 'Label must be at least 2 characters'),
  definition: z.string().min(10, 'Definition must be at least 10 characters'),
  notation: z.string().optional(),
  status: z.enum(['Active', 'Draft', 'Deprecated']),
});

type ConceptFormValues = z.infer<typeof conceptFormSchema>;

interface ConceptFormProps {
  vocabularyId: string;
  concept?: Concept | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ConceptForm({
  vocabularyId,
  concept,
  onSuccess,
  onCancel,
}: ConceptFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ConceptFormValues>({
    resolver: zodResolver(conceptFormSchema),
    defaultValues: concept
      ? {
          code: concept.code,
          label: concept.label,
          definition: concept.definition,
          notation: concept.notation || '',
          status: concept.status,
        }
      : {
          code: '',
          label: '',
          definition: '',
          notation: '',
          status: 'Draft',
        },
  });

  const onSubmit = async (data: ConceptFormValues) => {
    setLoading(true);
    try {
      let result;
      if (concept) {
        result = await updateConcept(concept.id, data);
      } else {
        result = await createConcept({
          vocabularyId,
          ...data,
        });
      }

      if (result.success) {
        toast({
          title: concept ? 'Concept Updated' : 'Concept Created',
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input placeholder="AKTIF" {...field} />
                </FormControl>
                <FormDescription>Unique identifier within vocabulary</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notation (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="ACT" {...field} />
                </FormControl>
                <FormDescription>Short notation or abbreviation</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input placeholder="Active Status" {...field} />
              </FormControl>
              <FormDescription>Display label for the concept</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="definition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Definition</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="The working area is currently active and operational..."
                  {...field}
                />
              </FormControl>
              <FormDescription>Detailed definition of the concept</FormDescription>
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

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : concept ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

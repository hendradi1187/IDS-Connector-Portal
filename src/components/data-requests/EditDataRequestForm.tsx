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
import { updateDataRequest } from '@/app/data-requests/actions';
import { useToast } from '@/hooks/use-toast';
import { DataRequest } from '@/lib/types';
import { useState } from 'react';

const formSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Delivered', 'Rejected']),
});

type EditDataRequestFormProps = {
  dataRequest: DataRequest;
  setOpen: (open: boolean) => void;
};

export function EditDataRequestForm({ dataRequest, setOpen }: EditDataRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: dataRequest.status,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await updateDataRequest(dataRequest.id, values);
      toast({
        title: 'Data Request Updated',
        description: `The request for "${dataRequest.resourceName}" has been updated.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update data request. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
            <div>
                <FormLabel>Resource</FormLabel>
                <Input readOnly disabled value={dataRequest.resourceName} />
            </div>
            <div>
                <FormLabel>Contract</FormLabel>
                <Input readOnly disabled value={dataRequest.contractName} />
            </div>
             <div>
                <FormLabel>Destination</FormLabel>
                <Input readOnly disabled value={dataRequest.destination} />
            </div>
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Update request status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
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

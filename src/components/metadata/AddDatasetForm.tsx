'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useState } from 'react';
import { createDataset } from '@/lib/actions/datasetActions';
import { useAuth } from '@/context/AuthContext';

const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Dataset name must be at least 3 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  owner: z.string().min(2, {
    message: 'Owner name is required.',
  }),
  ownerType: z.enum(['KKKS', 'SKK_MIGAS', 'VENDOR'], {
    required_error: 'Please select an owner type.',
  }),
  location: z.string().url({
    message: 'Please enter a valid URL or file path.',
  }).or(z.string().min(1, { message: 'Location is required.' })),
  locationType: z.enum(['URL', 'STORAGE', 'API'], {
    required_error: 'Please select a location type.',
  }),
  format: z.string().min(1, {
    message: 'Data format is required.',
  }),
  dataType: z.enum(['SEISMIC', 'WELL', 'PRODUCTION', 'GEOLOGICAL'], {
    required_error: 'Please select a data type.',
  }),
  quality: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR'], {
    required_error: 'Please select data quality.',
  }),
  accessLevel: z.enum(['PUBLIC', 'RESTRICTED', 'INTERNAL'], {
    required_error: 'Please select access level.',
  }),
  tags: z.string().optional(),
});

type AddDatasetFormProps = {
  setOpen: (open: boolean) => void;
};

export default function AddDatasetForm({ setOpen }: AddDatasetFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      owner: '',
      ownerType: undefined,
      location: '',
      locationType: undefined,
      format: '',
      dataType: undefined,
      quality: 'GOOD',
      accessLevel: 'RESTRICTED',
      tags: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user?.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a dataset.',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createDataset(values, user.id);

      if (result.success) {
        toast({
          title: 'Dataset Added',
          description: result.message,
        });

        setOpen(false);
        form.reset();

        // Refresh the page to show new dataset
        window.location.reload();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to add dataset. Please try again.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add dataset. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dataset Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Seismic Survey Lapangan Minas 2024" {...field} />
                </FormControl>
                <FormDescription>
                  Descriptive name that clearly identifies the dataset
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed description of the dataset, including methodology, coverage area, and any relevant details..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Owner *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Chevron Pacific Indonesia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ownerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select owner type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="KKKS">KKKS (Kontraktor)</SelectItem>
                      <SelectItem value="SKK_MIGAS">SKK Migas</SelectItem>
                      <SelectItem value="VENDOR">Vendor/Contractor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Location Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Location & Access</h3>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Location *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., https://api.example.com/data or /storage/path/to/data"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  URL, file path, or API endpoint where the data can be accessed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="locationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="URL">URL (Web Resource)</SelectItem>
                      <SelectItem value="STORAGE">Storage (File System)</SelectItem>
                      <SelectItem value="API">API Endpoint</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Level *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select access level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public (Open Access)</SelectItem>
                      <SelectItem value="RESTRICTED">Restricted (Limited Access)</SelectItem>
                      <SelectItem value="INTERNAL">Internal (Organization Only)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Technical Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Technical Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Format *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., SEG-Y, LAS, CSV, JSON" {...field} />
                  </FormControl>
                  <FormDescription>
                    File format or data structure type
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SEISMIC">Seismic Data</SelectItem>
                      <SelectItem value="WELL">Well Data</SelectItem>
                      <SelectItem value="PRODUCTION">Production Data</SelectItem>
                      <SelectItem value="GEOLOGICAL">Geological Data</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="quality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Quality *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data quality" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EXCELLENT">Excellent (Fully validated, complete)</SelectItem>
                    <SelectItem value="GOOD">Good (Mostly complete, minor issues)</SelectItem>
                    <SelectItem value="FAIR">Fair (Some gaps or quality issues)</SelectItem>
                    <SelectItem value="POOR">Poor (Significant quality issues)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Assessment of data completeness and validation status
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 3D, processed, public, high-resolution"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Comma-separated tags for easier categorization and search
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding Dataset...' : 'Add Dataset'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
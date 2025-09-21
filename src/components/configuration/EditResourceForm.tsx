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
import { updateResource } from '@/app/resources/actions';
import { useToast } from '@/hooks/use-toast';
import { Resource } from '@/lib/types';
import { useState } from 'react';
import { Textarea } from '../ui/textarea';


const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama harus diisi, minimal 2 karakter.',
  }),
  description: z.string().optional(),
  type: z.enum(['Peta GeoJSON', 'Data Sumur (Well Log)', 'Data Produksi', 'Lainnya']),
  status: z.enum(['Tersedia', 'Tidak Digunakan']),
});


type EditResourceFormProps = {
  resource: Resource;
  setOpen: (open: boolean) => void;
};

export function EditResourceForm({ resource, setOpen }: EditResourceFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: resource.name,
      description: resource.description,
      type: resource.type as any, // Cast to any to allow existing values
      status: resource.status,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await updateResource(resource.id, values);
      toast({
        title: 'Sumber Daya Diperbarui',
        description: `Sumber daya "${values.name}" telah berhasil diperbarui.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memperbarui sumber daya. Silakan coba lagi.',
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
              <FormLabel>Nama Sumber Daya</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Peta Seismik Blok A-1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Data</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis data" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Peta GeoJSON">Peta GeoJSON</SelectItem>
                  <SelectItem value="Data Sumur (Well Log)">Data Sumur (Well Log)</SelectItem>
                  <SelectItem value="Data Produksi">Data Produksi</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea placeholder="Deskripsi singkat mengenai data" {...field} />
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
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Tersedia">Tersedia</SelectItem>
                  <SelectItem value="Tidak Digunakan">Tidak Digunakan</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </form>
    </Form>
  );
}

'use server';

import { prisma } from '@/lib/database/prisma';
import { revalidatePath } from 'next/cache';

export type DatasetFormData = {
  name: string;
  description: string;
  owner: string;
  ownerType: 'KKKS' | 'SKK_MIGAS' | 'VENDOR';
  location: string;
  locationType: 'URL' | 'STORAGE' | 'API';
  format: string;
  dataType: 'SEISMIC' | 'WELL' | 'PRODUCTION' | 'GEOLOGICAL';
  quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  accessLevel: 'PUBLIC' | 'RESTRICTED' | 'INTERNAL';
  tags: string;
};

export async function createDataset(data: DatasetFormData, userId: string) {
  try {
    // Process tags
    const tagsArray = data.tags
      ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];

    // Create metadata schema JSON
    const metadataSchema = {
      owner: data.owner,
      ownerType: data.ownerType,
      location: data.location,
      locationType: data.locationType,
      format: data.format,
      dataType: data.dataType,
      quality: data.quality,
      accessLevel: data.accessLevel,
      lastValidation: new Date().toISOString().split('T')[0],
      status: 'PENDING_REVIEW'
    };

    // Create dataset in database
    const dataset = await prisma.datasetMetadata.create({
      data: {
        title: data.name,
        description: data.description,
        schema: metadataSchema,
        source: data.owner,
        ownerId: userId,
        tags: tagsArray,
        category: data.dataType,
        domain: 'MIGAS',
        status: 'PENDING', // Using enum from schema
        version: 1,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    // Revalidate the metadata page
    revalidatePath('/metadata');

    return {
      success: true,
      data: dataset,
      message: `Dataset "${data.name}" has been successfully registered and is pending review.`
    };
  } catch (error) {
    console.error('Error creating dataset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create dataset',
      message: 'Failed to add dataset. Please try again.'
    };
  }
}

export async function getDatasets(filters?: {
  searchTerm?: string;
  dataType?: string;
  ownerType?: string;
  accessLevel?: string;
}) {
  try {
    const where: any = {
      domain: 'MIGAS'
    };

    // Add filters if provided
    if (filters?.searchTerm) {
      where.OR = [
        { title: { contains: filters.searchTerm, mode: 'insensitive' } },
        { description: { contains: filters.searchTerm, mode: 'insensitive' } },
        { source: { contains: filters.searchTerm, mode: 'insensitive' } },
      ];
    }

    if (filters?.dataType && filters.dataType !== 'ALL') {
      where.category = filters.dataType;
    }

    const datasets = await prisma.datasetMetadata.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        schema: true,
        source: true,
        tags: true,
        category: true,
        status: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // Transform to match UI format
    const transformedDatasets = datasets.map(dataset => {
      const schema = dataset.schema as any;
      return {
        id: dataset.id,
        name: dataset.title,
        description: dataset.description || '',
        owner: dataset.source || 'Unknown',
        ownerType: schema.ownerType || 'KKKS',
        location: schema.location || '',
        locationType: schema.locationType || 'URL',
        format: schema.format || '',
        dataType: dataset.category || 'SEISMIC',
        quality: schema.quality || 'GOOD',
        accessLevel: schema.accessLevel || 'RESTRICTED',
        lastValidation: schema.lastValidation || new Date().toISOString().split('T')[0],
        status: schema.status || 'PENDING_REVIEW',
        tags: dataset.tags || [],
        createdAt: dataset.createdAt.toISOString(),
        updatedAt: dataset.updatedAt.toISOString(),
      };
    });

    return {
      success: true,
      data: transformedDatasets
    };
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch datasets',
      data: []
    };
  }
}

export async function updateDataset(id: string, data: Partial<DatasetFormData>, userId: string) {
  try {
    const existing = await prisma.datasetMetadata.findUnique({
      where: { id }
    });

    if (!existing) {
      return {
        success: false,
        error: 'Dataset not found'
      };
    }

    const currentSchema = existing.schema as any;

    // Update metadata schema JSON
    const updatedSchema = {
      ...currentSchema,
      ...(data.owner && { owner: data.owner }),
      ...(data.ownerType && { ownerType: data.ownerType }),
      ...(data.location && { location: data.location }),
      ...(data.locationType && { locationType: data.locationType }),
      ...(data.format && { format: data.format }),
      ...(data.dataType && { dataType: data.dataType }),
      ...(data.quality && { quality: data.quality }),
      ...(data.accessLevel && { accessLevel: data.accessLevel }),
    };

    const updateData: any = {
      updatedBy: userId,
      schema: updatedSchema,
    };

    if (data.name) updateData.title = data.name;
    if (data.description) updateData.description = data.description;
    if (data.owner) updateData.source = data.owner;
    if (data.dataType) updateData.category = data.dataType;
    if (data.tags) {
      updateData.tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    const dataset = await prisma.datasetMetadata.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/metadata');

    return {
      success: true,
      data: dataset,
      message: 'Dataset updated successfully'
    };
  } catch (error) {
    console.error('Error updating dataset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update dataset'
    };
  }
}

export async function deleteDataset(id: string) {
  try {
    await prisma.datasetMetadata.delete({
      where: { id }
    });

    revalidatePath('/metadata');

    return {
      success: true,
      message: 'Dataset deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting dataset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete dataset'
    };
  }
}

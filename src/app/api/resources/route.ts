import { NextRequest, NextResponse } from 'next/server';
import { ResourceRepository } from '@/lib/database/repositories';
import { ResourceType, AccessPolicy } from '@prisma/client';

const resourceRepo = new ResourceRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const type = searchParams.get('type') as ResourceType;
    const accessPolicy = searchParams.get('accessPolicy') as AccessPolicy;

    let resources;

    if (providerId) {
      resources = await resourceRepo.findByProviderId(providerId);
    } else if (type) {
      resources = await resourceRepo.findByType(type);
    } else if (accessPolicy) {
      resources = await resourceRepo.findByAccessPolicy(accessPolicy);
    } else {
      resources = await resourceRepo.findAll();
    }

    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const resource = await resourceRepo.create({
      name: body.name,
      description: body.description,
      type: body.type,
      providerId: body.providerId,
      storagePath: body.storagePath,
      metadata: body.metadata,
      accessPolicy: body.accessPolicy || 'restricted'
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { ContainerRepository } from '@/lib/database/repositories/containerRepository';
import { ContainerStatus } from '@/generated/prisma';

const containerRepo = new ContainerRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ContainerStatus;

    let containers;

    if (status) {
      containers = await containerRepo.findByStatus(status);
    } else {
      containers = await containerRepo.findAll();
    }

    return NextResponse.json(containers);
  } catch (error) {
    console.error('Error fetching containers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch containers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const container = await containerRepo.create({
      serviceName: body.serviceName,
      providerId: body.providerId,
      status: body.status || 'stopped',
      image: body.image,
      ports: body.ports,
      volumes: body.volumes,
      environment: body.environment,
      cpuUsage: body.cpuUsage,
      memoryUsage: body.memoryUsage,
      logs: body.logs
    });

    return NextResponse.json(container, { status: 201 });
  } catch (error) {
    console.error('Error creating container:', error);
    return NextResponse.json(
      { error: 'Failed to create container' },
      { status: 500 }
    );
  }
}
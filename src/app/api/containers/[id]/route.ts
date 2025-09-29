import { NextRequest, NextResponse } from 'next/server';
import { ContainerRepository } from '@/lib/database/repositories/containerRepository';

const containerRepo = new ContainerRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const container = await containerRepo.findById(params.id);

    if (!container) {
      return NextResponse.json(
        { error: 'Container not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(container);
  } catch (error) {
    console.error('Error fetching container:', error);
    return NextResponse.json(
      { error: 'Failed to fetch container' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const container = await containerRepo.update(params.id, {
      serviceName: body.serviceName,
      status: body.status,
      image: body.image,
      ports: body.ports,
      volumes: body.volumes,
      environment: body.environment,
      cpuUsage: body.cpuUsage,
      memoryUsage: body.memoryUsage,
      logs: body.logs
    });

    return NextResponse.json(container);
  } catch (error) {
    console.error('Error updating container:', error);
    return NextResponse.json(
      { error: 'Failed to update container' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await containerRepo.delete(params.id);

    return NextResponse.json({
      message: 'Container deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting container:', error);
    return NextResponse.json(
      { error: 'Failed to delete container' },
      { status: 500 }
    );
  }
}
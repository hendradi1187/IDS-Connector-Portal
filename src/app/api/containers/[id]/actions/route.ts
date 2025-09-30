import { NextRequest, NextResponse } from 'next/server';
import { ContainerRepository } from '@/lib/database/repositories/containerRepository';
import { ContainerStatus } from '@prisma/client';

const containerRepo = new ContainerRepository();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json();

    if (!['start', 'stop', 'restart'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be start, stop, or restart' },
        { status: 400 }
      );
    }

    // Mock container action - replace with actual Docker commands
    let newStatus: ContainerStatus;
    switch (action) {
      case 'start':
      case 'restart':
        newStatus = 'running';
        break;
      case 'stop':
        newStatus = 'stopped';
        break;
      default:
        newStatus = 'stopped';
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    const container = await containerRepo.updateStatus(params.id, newStatus);

    // Update logs
    const logMessage = `Container ${action}ed at ${new Date().toISOString()}`;
    await containerRepo.update(params.id, {
      logs: container.logs ? `${container.logs}\n${logMessage}` : logMessage
    });

    return NextResponse.json({
      message: `Container ${action}ed successfully`,
      container
    });
  } catch (error) {
    console.error(`Error performing container action:`, error);
    return NextResponse.json(
      { error: 'Failed to perform container action' },
      { status: 500 }
    );
  }
}
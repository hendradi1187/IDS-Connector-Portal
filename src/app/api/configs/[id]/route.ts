import { NextRequest, NextResponse } from 'next/server';
import { ConfigRepository } from '@/lib/database/repositories';

const configRepo = new ConfigRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const config = await configRepo.findById(params.id);

    if (!config) {
      return NextResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    // Mask secret value in response
    const responseConfig = {
      ...config,
      value: config.isSecret ? '***' : config.value
    };

    return NextResponse.json(responseConfig);
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch config' },
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

    const config = await configRepo.update(params.id, {
      key: body.key,
      value: body.value,
      description: body.description,
      category: body.category,
      type: body.type,
      isSecret: body.isSecret
    });

    // Mask secret value in response
    const responseConfig = {
      ...config,
      value: config.isSecret ? '***' : config.value
    };

    return NextResponse.json(responseConfig);
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await configRepo.delete(params.id);

    return NextResponse.json({ message: 'Config deleted successfully' });
  } catch (error) {
    console.error('Error deleting config:', error);
    return NextResponse.json(
      { error: 'Failed to delete config' },
      { status: 500 }
    );
  }
}
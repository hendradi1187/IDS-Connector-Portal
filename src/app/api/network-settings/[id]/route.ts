import { NextRequest, NextResponse } from 'next/server';
import { NetworkSettingRepository } from '@/lib/database/repositories';

const networkSettingRepo = new NetworkSettingRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const networkSetting = await networkSettingRepo.findById(params.id);

    if (!networkSetting) {
      return NextResponse.json(
        { error: 'Network setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(networkSetting);
  } catch (error) {
    console.error('Error fetching network setting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch network setting' },
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

    const networkSetting = await networkSettingRepo.update(params.id, {
      providerId: body.providerId,
      apiEndpoint: body.apiEndpoint,
      protocol: body.protocol,
      status: body.status
    });

    return NextResponse.json(networkSetting);
  } catch (error) {
    console.error('Error updating network setting:', error);
    return NextResponse.json(
      { error: 'Failed to update network setting' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await networkSettingRepo.delete(params.id);

    return NextResponse.json({ message: 'Network setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting network setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete network setting' },
      { status: 500 }
    );
  }
}
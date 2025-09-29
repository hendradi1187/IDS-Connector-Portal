import { NextRequest, NextResponse } from 'next/server';
import { NetworkSettingRepository } from '@/lib/database/repositories';
import { NetworkProtocol, NetworkStatus } from '@/generated/prisma';

const networkSettingRepo = new NetworkSettingRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const protocol = searchParams.get('protocol') as NetworkProtocol;
    const status = searchParams.get('status') as NetworkStatus;

    let networkSettings;

    if (providerId) {
      networkSettings = await networkSettingRepo.findByProviderId(providerId);
    } else if (protocol) {
      networkSettings = await networkSettingRepo.findByProtocol(protocol);
    } else if (status) {
      networkSettings = await networkSettingRepo.findByStatus(status);
    } else {
      networkSettings = await networkSettingRepo.findAll();
    }

    return NextResponse.json(networkSettings);
  } catch (error) {
    console.error('Error fetching network settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch network settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const networkSetting = await networkSettingRepo.create({
      providerId: body.providerId,
      apiEndpoint: body.apiEndpoint,
      protocol: body.protocol,
      status: body.status || 'active'
    });

    return NextResponse.json(networkSetting, { status: 201 });
  } catch (error) {
    console.error('Error creating network setting:', error);
    return NextResponse.json(
      { error: 'Failed to create network setting' },
      { status: 500 }
    );
  }
}
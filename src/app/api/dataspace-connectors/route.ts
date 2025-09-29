import { NextRequest, NextResponse } from 'next/server';
import { DataspaceConnectorRepository } from '@/lib/database/repositories/dataspaceConnectorRepository';
import { DataspaceConnectorStatus } from '@/generated/prisma';

const dataspaceConnectorRepo = new DataspaceConnectorRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as DataspaceConnectorStatus;
    const version = searchParams.get('version');

    let connectors;

    if (status) {
      connectors = await dataspaceConnectorRepo.findByStatus(status);
    } else if (version) {
      connectors = await dataspaceConnectorRepo.findByVersion(version);
    } else {
      connectors = await dataspaceConnectorRepo.findAll();
    }

    return NextResponse.json(connectors);
  } catch (error) {
    console.error('Error fetching dataspace connectors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dataspace connectors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const connector = await dataspaceConnectorRepo.registerConnector({
      name: body.name,
      connectorUrl: body.connectorUrl,
      version: body.version,
      securityProfile: body.securityProfile,
      supportedFormats: body.supportedFormats,
      capabilities: body.capabilities
    });

    return NextResponse.json(connector, { status: 201 });
  } catch (error) {
    console.error('Error registering dataspace connector:', error);
    return NextResponse.json(
      { error: 'Failed to register dataspace connector' },
      { status: 500 }
    );
  }
}
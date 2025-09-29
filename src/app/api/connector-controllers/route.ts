import { NextRequest, NextResponse } from 'next/server';
import { ConnectorControllerRepository } from '@/lib/database/repositories';
import { ConnectorControllerStatus, ConnectorControllerType } from '@/generated/prisma';

const connectorControllerRepo = new ConnectorControllerRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ConnectorControllerStatus;
    const controllerType = searchParams.get('controllerType') as ConnectorControllerType;
    const ipAddress = searchParams.get('ipAddress');

    let controllers;

    if (status) {
      controllers = await connectorControllerRepo.findByStatus(status);
    } else if (controllerType) {
      controllers = await connectorControllerRepo.findByControllerType(controllerType);
    } else if (ipAddress) {
      controllers = await connectorControllerRepo.findByIpAddress(ipAddress);
    } else {
      controllers = await connectorControllerRepo.findAll();
    }

    return NextResponse.json(controllers);
  } catch (error) {
    console.error('Error fetching connector controllers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connector controllers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const controller = await connectorControllerRepo.create({
      name: body.name,
      description: body.description,
      controllerType: body.controllerType,
      status: body.status || 'inactive',
      ipAddress: body.ipAddress,
      port: body.port,
      version: body.version,
      capabilities: body.capabilities,
      configuration: body.configuration
    });

    return NextResponse.json(controller, { status: 201 });
  } catch (error) {
    console.error('Error creating connector controller:', error);
    return NextResponse.json(
      { error: 'Failed to create connector controller' },
      { status: 500 }
    );
  }
}
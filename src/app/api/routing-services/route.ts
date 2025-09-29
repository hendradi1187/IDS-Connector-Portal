import { NextRequest, NextResponse } from 'next/server';
import { RoutingServiceRepository } from '@/lib/database/repositories';
import { RoutingServiceStatus, RoutingType, LoadBalancingType } from '@/generated/prisma';

const routingServiceRepo = new RoutingServiceRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as RoutingServiceStatus;
    const routingType = searchParams.get('routingType') as RoutingType;
    const loadBalancing = searchParams.get('loadBalancing') as LoadBalancingType;

    let services;

    if (status) {
      services = await routingServiceRepo.findByStatus(status);
    } else if (routingType) {
      services = await routingServiceRepo.findByRoutingType(routingType);
    } else if (loadBalancing) {
      services = await routingServiceRepo.findByLoadBalancing(loadBalancing);
    } else {
      services = await routingServiceRepo.findAll();
    }

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching routing services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routing services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const service = await routingServiceRepo.create({
      name: body.name,
      description: body.description,
      routingType: body.routingType,
      priority: body.priority || 0,
      loadBalancing: body.loadBalancing,
      healthCheck: body.healthCheck,
      status: body.status || 'inactive',
      configuration: body.configuration
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating routing service:', error);
    return NextResponse.json(
      { error: 'Failed to create routing service' },
      { status: 500 }
    );
  }
}
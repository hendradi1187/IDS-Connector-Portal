import { NextRequest, NextResponse } from 'next/server';
import { RouteRepository } from '@/lib/database/repositories';
import { RouteStatus } from '@prisma/client';

const routeRepo = new RouteRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const consumerId = searchParams.get('consumerId');
    const status = searchParams.get('status') as RouteStatus;

    let routes;

    if (providerId) {
      routes = await routeRepo.findByProviderId(providerId);
    } else if (consumerId) {
      routes = await routeRepo.findByConsumerId(consumerId);
    } else if (status) {
      routes = await routeRepo.findByStatus(status);
    } else {
      routes = await routeRepo.findAll();
    }

    return NextResponse.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const route = await routeRepo.create({
      providerId: body.providerId,
      consumerId: body.consumerId,
      resourceId: body.resourceId,
      status: body.status || 'active',
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined
    });

    return NextResponse.json(route, { status: 201 });
  } catch (error) {
    console.error('Error creating route:', error);
    return NextResponse.json(
      { error: 'Failed to create route' },
      { status: 500 }
    );
  }
}
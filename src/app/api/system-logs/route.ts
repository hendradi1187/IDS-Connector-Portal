import { NextRequest, NextResponse } from 'next/server';
import { SystemLogRepository } from '@/lib/database/repositories';
import { LogLevel } from '@/generated/prisma';

const systemLogRepo = new SystemLogRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');
    const level = searchParams.get('level') as LogLevel;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '100');

    let logs;

    if (service) {
      logs = await systemLogRepo.findByService(service, limit);
    } else if (level) {
      logs = await systemLogRepo.findByLevel(level, limit);
    } else if (userId) {
      logs = await systemLogRepo.findByUserId(userId, limit);
    } else {
      logs = await systemLogRepo.findAll(limit);
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching system logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const log = await systemLogRepo.create({
      service: body.service,
      level: body.level,
      message: body.message,
      details: body.details,
      userId: body.userId
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Error creating system log:', error);
    return NextResponse.json(
      { error: 'Failed to create system log' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { DataSourceRepository } from '@/lib/database/repositories';

const dataSourceRepo = new DataSourceRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    let dataSources;

    if (type) {
      dataSources = await dataSourceRepo.findByType(type);
    } else if (status) {
      dataSources = await dataSourceRepo.findByStatus(status);
    } else {
      dataSources = await dataSourceRepo.findAll();
    }

    return NextResponse.json(dataSources);
  } catch (error) {
    console.error('Error fetching data sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data sources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const dataSource = await dataSourceRepo.create({
      name: body.name,
      type: body.type,
      host: body.host,
      port: body.port,
      database: body.database,
      username: body.username,
      password: body.password,
      schema: body.schema,
      table: body.table,
      query: body.query,
      connectionString: body.connectionString,
      status: body.status || 'inactive',
      metadata: body.metadata
    });

    return NextResponse.json(dataSource, { status: 201 });
  } catch (error) {
    console.error('Error creating data source:', error);
    return NextResponse.json(
      { error: 'Failed to create data source' },
      { status: 500 }
    );
  }
}
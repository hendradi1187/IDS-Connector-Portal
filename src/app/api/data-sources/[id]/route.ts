import { NextRequest, NextResponse } from 'next/server';
import { DataSourceRepository } from '@/lib/database/repositories';

const dataSourceRepo = new DataSourceRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dataSource = await dataSourceRepo.findById(params.id);

    if (!dataSource) {
      return NextResponse.json(
        { error: 'Data source not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(dataSource);
  } catch (error) {
    console.error('Error fetching data source:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data source' },
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

    const dataSource = await dataSourceRepo.update(params.id, {
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
      status: body.status,
      metadata: body.metadata
    });

    return NextResponse.json(dataSource);
  } catch (error) {
    console.error('Error updating data source:', error);
    return NextResponse.json(
      { error: 'Failed to update data source' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dataSourceRepo.delete(params.id);

    return NextResponse.json({ message: 'Data source deleted successfully' });
  } catch (error) {
    console.error('Error deleting data source:', error);
    return NextResponse.json(
      { error: 'Failed to delete data source' },
      { status: 500 }
    );
  }
}
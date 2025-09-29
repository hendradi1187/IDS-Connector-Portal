import { NextRequest, NextResponse } from 'next/server';
import { DataSourceRepository } from '@/lib/database/repositories';

const dataSourceRepo = new DataSourceRepository();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await dataSourceRepo.testConnection(params.id);

    return NextResponse.json({
      success,
      message: success
        ? 'Connection test successful'
        : 'Connection test failed'
    });
  } catch (error) {
    console.error('Error testing data source connection:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to test connection',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
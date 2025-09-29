import { NextRequest, NextResponse } from 'next/server';
import { ConfigRepository } from '@/lib/database/repositories';

const configRepo = new ConfigRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const secrets = searchParams.get('secrets');

    let configs;

    if (category) {
      configs = await configRepo.findByCategory(category);
    } else if (secrets === 'true') {
      configs = await configRepo.findSecrets();
    } else if (secrets === 'false') {
      configs = await configRepo.findNonSecrets();
    } else {
      configs = await configRepo.findAll();
    }

    // Mask secret values in response
    const maskedConfigs = configs.map(config => ({
      ...config,
      value: config.isSecret ? '***' : config.value
    }));

    return NextResponse.json(maskedConfigs);
  } catch (error) {
    console.error('Error fetching configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const config = await configRepo.create({
      key: body.key,
      value: body.value,
      description: body.description,
      category: body.category,
      type: body.type || 'string',
      isSecret: body.isSecret || false
    });

    // Mask secret value in response
    const responseConfig = {
      ...config,
      value: config.isSecret ? '***' : config.value
    };

    return NextResponse.json(responseConfig, { status: 201 });
  } catch (error) {
    console.error('Error creating config:', error);
    return NextResponse.json(
      { error: 'Failed to create config' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';

// GET /api/mdm/working-areas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const jenisKontrak = searchParams.get('jenisKontrak');
    const lokasi = searchParams.get('lokasi');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { wkId: { contains: search, mode: 'insensitive' } },
        { namaWk: { contains: search, mode: 'insensitive' } },
        { holding: { contains: search, mode: 'insensitive' } },
        { namaCekungan: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.statusWk = status;
    }

    if (jenisKontrak) {
      where.jenisKontrak = jenisKontrak;
    }

    if (lokasi) {
      where.lokasi = lokasi;
    }

    // Get working areas with pagination
    const [workingAreas, total] = await Promise.all([
      prisma.workingArea.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              fields: true,
              wells: true,
              seismicSurveys: true,
              facilities: true,
            }
          }
        }
      }),
      prisma.workingArea.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: workingAreas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching working areas:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch working areas',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/mdm/working-areas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      wkId,
      namaWk,
      statusWk,
      lokasi,
      jenisKontrak,
      effectiveDate,
      holding,
      faseWk,
      kewenangan,
      shape
    } = body;

    if (!wkId || !namaWk || !statusWk || !lokasi || !jenisKontrak || !effectiveDate || !holding || !faseWk || !kewenangan || !shape) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'wkId, namaWk, statusWk, lokasi, jenisKontrak, effectiveDate, holding, faseWk, kewenangan, and shape are required'
        },
        { status: 400 }
      );
    }

    // Check if WK_ID already exists
    const existingWorkingArea = await prisma.workingArea.findUnique({
      where: { wkId }
    });

    if (existingWorkingArea) {
      return NextResponse.json(
        {
          success: false,
          error: 'Working Area ID already exists',
          message: `Working Area with ID ${wkId} already exists`
        },
        { status: 409 }
      );
    }

    // Create working area
    const workingArea = await prisma.workingArea.create({
      data: {
        wkId,
        namaWk,
        statusWk,
        provinsi1: body.provinsi1,
        provinsi2: body.provinsi2,
        lokasi,
        jenisKontrak,
        effectiveDate: new Date(effectiveDate),
        expireDate: body.expireDate ? new Date(body.expireDate) : null,
        holding,
        faseWk,
        luasWkAwal: body.luasWkAwal,
        luasWk: body.luasWk,
        namaCekungan: body.namaCekungan,
        statusCekungan: body.statusCekungan,
        participatingInterest: body.participatingInterest,
        kewenangan,
        attachment: body.attachment,
        shape,
        crsEpsg: body.crsEpsg || 4326,
        createdBy: body.createdBy
      }
    });

    return NextResponse.json({
      success: true,
      data: workingArea,
      message: 'Working Area created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating working area:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create working area',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
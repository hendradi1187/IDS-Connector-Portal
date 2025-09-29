import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';

// GET /api/mdm/working-areas/stats
export async function GET(request: NextRequest) {
  try {
    // Get statistics for working areas
    const [
      total,
      byStatus,
      byJenisKontrak,
      byLokasi,
      byFase,
      byKewenangan,
      recentlyAdded,
      averageArea
    ] = await Promise.all([
      // Total working areas
      prisma.workingArea.count(),

      // Group by status
      prisma.workingArea.groupBy({
        by: ['statusWk'],
        _count: { statusWk: true },
        orderBy: { _count: { statusWk: 'desc' } }
      }),

      // Group by jenis kontrak
      prisma.workingArea.groupBy({
        by: ['jenisKontrak'],
        _count: { jenisKontrak: true },
        orderBy: { _count: { jenisKontrak: 'desc' } }
      }),

      // Group by lokasi
      prisma.workingArea.groupBy({
        by: ['lokasi'],
        _count: { lokasi: true },
        orderBy: { _count: { lokasi: 'desc' } }
      }),

      // Group by fase
      prisma.workingArea.groupBy({
        by: ['faseWk'],
        _count: { faseWk: true },
        orderBy: { _count: { faseWk: 'desc' } }
      }),

      // Group by kewenangan
      prisma.workingArea.groupBy({
        by: ['kewenangan'],
        _count: { kewenangan: true },
        orderBy: { _count: { kewenangan: 'desc' } }
      }),

      // Recently added (last 30 days)
      prisma.workingArea.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          }
        }
      }),

      // Average area
      prisma.workingArea.aggregate({
        _avg: { luasWk: true }
      })
    ]);

    // Get top provinces
    const topProvinces = await prisma.workingArea.groupBy({
      by: ['provinsi1'],
      where: { provinsi1: { not: null } },
      _count: { provinsi1: true },
      orderBy: { _count: { provinsi1: 'desc' } },
      take: 10
    });

    // Get related data counts
    const relatedCounts = await prisma.workingArea.findMany({
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
    });

    const totalFields = relatedCounts.reduce((sum, wa) => sum + wa._count.fields, 0);
    const totalWells = relatedCounts.reduce((sum, wa) => sum + wa._count.wells, 0);
    const totalSeismicSurveys = relatedCounts.reduce((sum, wa) => sum + wa._count.seismicSurveys, 0);
    const totalFacilities = relatedCounts.reduce((sum, wa) => sum + wa._count.facilities, 0);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total,
          recentlyAdded,
          averageArea: averageArea._avg.luasWk || 0,
          totalRelatedData: {
            fields: totalFields,
            wells: totalWells,
            seismicSurveys: totalSeismicSurveys,
            facilities: totalFacilities
          }
        },
        distribution: {
          byStatus: byStatus.map(item => ({
            status: item.statusWk,
            count: item._count.statusWk
          })),
          byJenisKontrak: byJenisKontrak.map(item => ({
            jenisKontrak: item.jenisKontrak,
            count: item._count.jenisKontrak
          })),
          byLokasi: byLokasi.map(item => ({
            lokasi: item.lokasi,
            count: item._count.lokasi
          })),
          byFase: byFase.map(item => ({
            fase: item.faseWk,
            count: item._count.faseWk
          })),
          byKewenangan: byKewenangan.map(item => ({
            kewenangan: item.kewenangan,
            count: item._count.kewenangan
          })),
          topProvinces: topProvinces.map(item => ({
            provinsi: item.provinsi1,
            count: item._count.provinsi1
          }))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching working area statistics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch working area statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';


export async function GET(request: NextRequest) {
  try {
    // Get basic statistics
    const [
      totalFacilities,
      operationalFacilities,
      underConstructionFacilities,
      plannedFacilities,
      typeStats,
      statusStats,
      workingAreaStats,
      operatorStats,
      yearlyStats,
      fieldStats
    ] = await Promise.all([
      // Total facilities
      prisma.facility.count(),

      // Operational facilities
      prisma.facility.count({
        where: {
          status: 'OPERATIONAL'
        }
      }),

      // Under construction facilities
      prisma.facility.count({
        where: {
          status: 'UNDER_CONSTRUCTION'
        }
      }),

      // Planned facilities
      prisma.facility.count({
        where: {
          status: 'PLANNED'
        }
      }),

      // Distribution by type
      prisma.facility.groupBy({
        by: ['facilityType'],
        _count: true,
        orderBy: {
          _count: {
            facilityType: 'desc'
          }
        }
      }),

      // Distribution by status
      prisma.facility.groupBy({
        by: ['status'],
        _count: true,
        orderBy: {
          _count: {
            status: 'desc'
          }
        }
      }),

      // Distribution by working area
      prisma.facility.groupBy({
        by: ['wkId'],
        _count: true,
        orderBy: {
          _count: {
            wkId: 'desc'
          }
        },
        take: 10
      }),

      // Distribution by operator
      prisma.facility.groupBy({
        by: ['operator'],
        _count: true,
        orderBy: {
          _count: {
            operator: 'desc'
          }
        },
        take: 10
      }),

      // Yearly statistics based on installation date
      prisma.$queryRaw`
        SELECT
          EXTRACT(YEAR FROM installation_date) as year,
          COUNT(*) as count
        FROM facilities
        WHERE installation_date IS NOT NULL
        GROUP BY EXTRACT(YEAR FROM installation_date)
        ORDER BY year DESC
        LIMIT 10
      `,

      // Distribution by field (for facilities associated with fields)
      prisma.facility.groupBy({
        by: ['fieldId'],
        _count: true,
        where: {
          fieldId: { not: null }
        },
        orderBy: {
          _count: {
            fieldId: 'desc'
          }
        },
        take: 10
      })
    ]);

    // Get working area names for the working area stats
    const workingAreaDetails = await prisma.workingArea.findMany({
      where: {
        wkId: {
          in: workingAreaStats.map(stat => stat.wkId)
        }
      },
      select: {
        wkId: true,
        namaWk: true,
        holding: true
      }
    });

    // Enrich working area stats with names
    const enrichedWorkingAreaStats = workingAreaStats.map(stat => {
      const detail = workingAreaDetails.find(wa => wa.wkId === stat.wkId);
      return {
        wkId: stat.wkId,
        namaWk: detail?.namaWk || 'Unknown',
        holding: detail?.holding || 'Unknown',
        count: stat._count
      };
    });

    // Get field names for field stats
    const fieldIds = fieldStats.map(stat => stat.fieldId).filter(Boolean);
    const fieldDetails = await prisma.field.findMany({
      where: {
        fieldId: {
          in: fieldIds as string[]
        }
      },
      select: {
        fieldId: true,
        fieldName: true,
        fieldType: true
      }
    });

    // Enrich field stats with names
    const enrichedFieldStats = fieldStats.map(stat => {
      const detail = fieldDetails.find(f => f.fieldId === stat.fieldId);
      return {
        fieldId: stat.fieldId,
        fieldName: detail?.fieldName || 'Unknown',
        fieldType: detail?.fieldType || 'Unknown',
        count: stat._count
      };
    });

    // Calculate monthly statistics for the current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = await prisma.$queryRaw`
      SELECT
        EXTRACT(MONTH FROM installation_date) as month,
        COUNT(*) as count
      FROM facilities
      WHERE EXTRACT(YEAR FROM installation_date) = ${currentYear}
      GROUP BY EXTRACT(MONTH FROM installation_date)
      ORDER BY month
    `;

    // Calculate capacity statistics by facility type
    const pipelineStats = await prisma.$queryRaw`
      SELECT
        AVG(diameter) as avg_diameter,
        AVG(length) as avg_length,
        SUM(length) as total_length
      FROM facilities
      WHERE facility_type = 'PIPELINE'
        AND diameter IS NOT NULL
        AND length IS NOT NULL
    `;

    const platformStats = await prisma.$queryRaw`
      SELECT
        AVG(capacity_prod) as avg_capacity,
        AVG(water_depth) as avg_water_depth,
        AVG(no_of_well) as avg_wells
      FROM facilities
      WHERE facility_type = 'PLATFORM'
        AND capacity_prod IS NOT NULL
    `;

    const processingStats = await prisma.$queryRaw`
      SELECT
        AVG(plant_capacity) as avg_plant_capacity,
        AVG(storage_capacity) as avg_storage_capacity,
        AVG(power) as avg_power
      FROM facilities
      WHERE facility_type = 'PROCESSING_PLANT'
        AND plant_capacity IS NOT NULL
    `;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await prisma.facility.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Count facilities with associated wells/fields
    const facilitiesWithWells = await prisma.facility.count({
      where: {
        wells: {
          some: {}
        }
      }
    });

    const facilitiesWithFields = await prisma.facility.count({
      where: {
        fieldId: { not: null }
      }
    });

    // Get top facilities by connections
    const facilitiesConnections = await prisma.facility.findMany({
      select: {
        id: true,
        facilityName: true,
        facilityType: true,
        _count: {
          select: {
            wells: true,
            fields: true
          }
        }
      },
      orderBy: [
        {
          wells: {
            _count: 'desc'
          }
        }
      ],
      take: 5
    });

    return NextResponse.json({
      overview: {
        totalFacilities,
        operationalFacilities,
        underConstructionFacilities,
        plannedFacilities,
        facilitiesWithWells,
        facilitiesWithFields,
        recentActivity
      },
      distribution: {
        byType: typeStats.map(stat => ({
          type: stat.facilityType,
          count: stat._count
        })),
        byStatus: statusStats.map(stat => ({
          status: stat.status,
          count: stat._count
        })),
        byWorkingArea: enrichedWorkingAreaStats,
        byOperator: operatorStats.map(stat => ({
          operator: stat.operator,
          count: stat._count
        })),
        byField: enrichedFieldStats
      },
      trends: {
        yearly: yearlyStats,
        monthly: monthlyStats
      },
      technical: {
        pipeline: pipelineStats[0] || {
          avg_diameter: 0,
          avg_length: 0,
          total_length: 0
        },
        platform: platformStats[0] || {
          avg_capacity: 0,
          avg_water_depth: 0,
          avg_wells: 0
        },
        processing: processingStats[0] || {
          avg_plant_capacity: 0,
          avg_storage_capacity: 0,
          avg_power: 0
        }
      },
      topFacilities: {
        byConnections: facilitiesConnections
      }
    });
  } catch (error) {
    console.error('Error fetching facility statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
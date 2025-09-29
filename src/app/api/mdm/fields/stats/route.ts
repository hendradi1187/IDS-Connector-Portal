import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';


export async function GET(request: NextRequest) {
  try {
    // Get basic statistics
    const [
      totalFields,
      activeFields,
      onshoreFields,
      offshoreFields,
      oilFields,
      gasFields,
      typeStats,
      statusStats,
      workingAreaStats,
      operatorStats,
      yearlyStats,
      basinStats
    ] = await Promise.all([
      // Total fields
      prisma.field.count(),

      // Active fields
      prisma.field.count({
        where: {
          status: 'ACTIVE'
        }
      }),

      // Onshore fields
      prisma.field.count({
        where: {
          isOffshore: false
        }
      }),

      // Offshore fields
      prisma.field.count({
        where: {
          isOffshore: true
        }
      }),

      // Oil fields
      prisma.field.count({
        where: {
          fieldType: {
            in: ['OIL', 'OIL_GAS']
          }
        }
      }),

      // Gas fields
      prisma.field.count({
        where: {
          fieldType: {
            in: ['GAS', 'OIL_GAS', 'CONDENSATE']
          }
        }
      }),

      // Distribution by type
      prisma.field.groupBy({
        by: ['fieldType'],
        _count: true,
        orderBy: {
          _count: {
            fieldType: 'desc'
          }
        }
      }),

      // Distribution by status
      prisma.field.groupBy({
        by: ['status'],
        _count: true,
        orderBy: {
          _count: {
            status: 'desc'
          }
        }
      }),

      // Distribution by working area
      prisma.field.groupBy({
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
      prisma.field.groupBy({
        by: ['operator'],
        _count: true,
        orderBy: {
          _count: {
            operator: 'desc'
          }
        },
        take: 10
      }),

      // Yearly statistics based on discovery date
      prisma.$queryRaw`
        SELECT
          EXTRACT(YEAR FROM discovery_date) as year,
          COUNT(*) as count
        FROM fields
        WHERE discovery_date IS NOT NULL
        GROUP BY EXTRACT(YEAR FROM discovery_date)
        ORDER BY year DESC
        LIMIT 10
      `,

      // Distribution by basin
      prisma.field.groupBy({
        by: ['basin'],
        _count: true,
        where: {
          basin: { not: null }
        },
        orderBy: {
          _count: {
            basin: 'desc'
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

    // Calculate monthly statistics for the current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = await prisma.$queryRaw`
      SELECT
        EXTRACT(MONTH FROM discovery_date) as month,
        COUNT(*) as count
      FROM fields
      WHERE EXTRACT(YEAR FROM discovery_date) = ${currentYear}
      GROUP BY EXTRACT(MONTH FROM discovery_date)
      ORDER BY month
    `;

    // Calculate production statistics
    const productionStats = await prisma.$queryRaw`
      SELECT
        AVG(current_production) as avg_production,
        MIN(current_production) as min_production,
        MAX(current_production) as max_production,
        SUM(current_production) as total_production
      FROM fields
      WHERE current_production IS NOT NULL
    `;

    // Calculate reserves statistics
    const reservesStats = await prisma.$queryRaw`
      SELECT
        AVG(estimated_reserves) as avg_reserves,
        MIN(estimated_reserves) as min_reserves,
        MAX(estimated_reserves) as max_reserves,
        SUM(estimated_reserves) as total_reserves
      FROM fields
      WHERE estimated_reserves IS NOT NULL
    `;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await prisma.field.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get wells and facilities count by field
    const fieldsWithCounts = await prisma.field.findMany({
      select: {
        id: true,
        fieldName: true,
        _count: {
          select: {
            wells: true,
            facilities: true
          }
        }
      },
      orderBy: {
        wells: {
          _count: 'desc'
        }
      },
      take: 5
    });

    return NextResponse.json({
      overview: {
        totalFields,
        activeFields,
        onshoreFields,
        offshoreFields,
        oilFields,
        gasFields,
        recentActivity
      },
      distribution: {
        byType: typeStats.map(stat => ({
          type: stat.fieldType,
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
        byBasin: basinStats.map(stat => ({
          basin: stat.basin,
          count: stat._count
        }))
      },
      trends: {
        yearly: yearlyStats,
        monthly: monthlyStats
      },
      performance: {
        production: productionStats[0] || {
          avg_production: 0,
          min_production: 0,
          max_production: 0,
          total_production: 0
        },
        reserves: reservesStats[0] || {
          avg_reserves: 0,
          min_reserves: 0,
          max_reserves: 0,
          total_reserves: 0
        }
      },
      topFields: {
        byWells: fieldsWithCounts
      }
    });
  } catch (error) {
    console.error('Error fetching field statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';


export async function GET(request: NextRequest) {
  try {
    // Get basic statistics
    const [
      totalWells,
      activeWells,
      explorationWells,
      developmentWells,
      classStats,
      statusStats,
      environmentStats,
      profileStats,
      workingAreaStats,
      operatorStats,
      yearlyStats,
      fieldStats
    ] = await Promise.all([
      // Total wells
      prisma.well.count(),

      // Active wells (producing or injecting)
      prisma.well.count({
        where: {
          statusType: {
            in: ['PRODUCE', 'INJECT']
          }
        }
      }),

      // Exploration wells
      prisma.well.count({
        where: {
          currentClass: 'EXPLORATION'
        }
      }),

      // Development wells
      prisma.well.count({
        where: {
          currentClass: 'DEVELOPMENT'
        }
      }),

      // Distribution by class
      prisma.well.groupBy({
        by: ['currentClass'],
        _count: true,
        orderBy: {
          _count: {
            currentClass: 'desc'
          }
        }
      }),

      // Distribution by status
      prisma.well.groupBy({
        by: ['statusType'],
        _count: true,
        orderBy: {
          _count: {
            statusType: 'desc'
          }
        }
      }),

      // Distribution by environment
      prisma.well.groupBy({
        by: ['environmentType'],
        _count: true,
        orderBy: {
          _count: {
            environmentType: 'desc'
          }
        }
      }),

      // Distribution by profile type
      prisma.well.groupBy({
        by: ['profileType'],
        _count: true,
        orderBy: {
          _count: {
            profileType: 'desc'
          }
        }
      }),

      // Distribution by working area
      prisma.well.groupBy({
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
      prisma.well.groupBy({
        by: ['operator'],
        _count: true,
        orderBy: {
          _count: {
            operator: 'desc'
          }
        },
        take: 10
      }),

      // Yearly statistics based on spud date
      prisma.$queryRaw`
        SELECT
          EXTRACT(YEAR FROM spud_date) as year,
          COUNT(*) as count
        FROM wells
        WHERE spud_date IS NOT NULL
        GROUP BY EXTRACT(YEAR FROM spud_date)
        ORDER BY year DESC
        LIMIT 10
      `,

      // Distribution by field
      prisma.well.groupBy({
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
        EXTRACT(MONTH FROM spud_date) as month,
        COUNT(*) as count
      FROM wells
      WHERE EXTRACT(YEAR FROM spud_date) = ${currentYear}
      GROUP BY EXTRACT(MONTH FROM spud_date)
      ORDER BY month
    `;

    // Calculate average well depth statistics
    const depthStats = await prisma.$queryRaw`
      SELECT
        AVG(total_depth) as avg_total_depth,
        MIN(total_depth) as min_total_depth,
        MAX(total_depth) as max_total_depth,
        AVG(water_depth) as avg_water_depth,
        MIN(water_depth) as min_water_depth,
        MAX(water_depth) as max_water_depth
      FROM wells
      WHERE total_depth IS NOT NULL
    `;

    // Calculate drilling duration statistics
    const drillingStats = await prisma.$queryRaw`
      SELECT
        AVG(EXTRACT(DAY FROM (final_drill_date - spud_date))) as avg_drilling_days,
        MIN(EXTRACT(DAY FROM (final_drill_date - spud_date))) as min_drilling_days,
        MAX(EXTRACT(DAY FROM (final_drill_date - spud_date))) as max_drilling_days
      FROM wells
      WHERE spud_date IS NOT NULL
        AND final_drill_date IS NOT NULL
        AND final_drill_date > spud_date
    `;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await prisma.well.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Count wells with associated fields
    const wellsWithFields = await prisma.well.count({
      where: {
        fieldId: { not: null }
      }
    });

    return NextResponse.json({
      overview: {
        totalWells,
        activeWells,
        explorationWells,
        developmentWells,
        wellsWithFields,
        recentActivity
      },
      distribution: {
        byClass: classStats.map(stat => ({
          class: stat.currentClass,
          count: stat._count
        })),
        byStatus: statusStats.map(stat => ({
          status: stat.statusType,
          count: stat._count
        })),
        byEnvironment: environmentStats.map(stat => ({
          environment: stat.environmentType,
          count: stat._count
        })),
        byProfile: profileStats.map(stat => ({
          profile: stat.profileType,
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
        depth: depthStats[0] || {
          avg_total_depth: 0,
          min_total_depth: 0,
          max_total_depth: 0,
          avg_water_depth: 0,
          min_water_depth: 0,
          max_water_depth: 0
        },
        drilling: drillingStats[0] || {
          avg_drilling_days: 0,
          min_drilling_days: 0,
          max_drilling_days: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching well statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
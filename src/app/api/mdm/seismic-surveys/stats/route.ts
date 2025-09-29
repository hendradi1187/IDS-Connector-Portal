import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';


export async function GET(request: NextRequest) {
  try {
    // Get basic statistics
    const [
      totalSurveys,
      activeSurveys,
      completedSurveys,
      dimensionStats,
      environmentStats,
      yearlyStats,
      workingAreaStats,
      companyStats
    ] = await Promise.all([
      // Total surveys
      prisma.seismicSurvey.count(),

      // Active surveys (started but not completed)
      prisma.seismicSurvey.count({
        where: {
          startDate: { not: null },
          completedDate: null
        }
      }),

      // Completed surveys
      prisma.seismicSurvey.count({
        where: {
          completedDate: { not: null }
        }
      }),

      // Distribution by dimension (2D/3D)
      prisma.seismicSurvey.groupBy({
        by: ['seisDimension'],
        _count: true,
        orderBy: {
          _count: {
            seisDimension: 'desc'
          }
        }
      }),

      // Distribution by environment (Marine/Land/Transition)
      prisma.seismicSurvey.groupBy({
        by: ['environment'],
        _count: true,
        orderBy: {
          _count: {
            environment: 'desc'
          }
        }
      }),

      // Yearly statistics based on start date
      prisma.$queryRaw`
        SELECT
          EXTRACT(YEAR FROM start_date) as year,
          COUNT(*) as count
        FROM seismic_surveys
        WHERE start_date IS NOT NULL
        GROUP BY EXTRACT(YEAR FROM start_date)
        ORDER BY year DESC
        LIMIT 10
      `,

      // Distribution by working area
      prisma.seismicSurvey.groupBy({
        by: ['wkId'],
        _count: true,
        orderBy: {
          _count: {
            wkId: 'desc'
          }
        },
        take: 10
      }),

      // Distribution by company (shot by)
      prisma.seismicSurvey.groupBy({
        by: ['shotBy'],
        _count: true,
        where: {
          shotBy: { not: null }
        },
        orderBy: {
          _count: {
            shotBy: 'desc'
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
        EXTRACT(MONTH FROM start_date) as month,
        COUNT(*) as count
      FROM seismic_surveys
      WHERE EXTRACT(YEAR FROM start_date) = ${currentYear}
      GROUP BY EXTRACT(MONTH FROM start_date)
      ORDER BY month
    `;

    // Calculate average survey duration for completed surveys
    const durationStats = await prisma.$queryRaw`
      SELECT
        AVG(EXTRACT(DAY FROM (completed_date - start_date))) as avg_duration_days,
        MIN(EXTRACT(DAY FROM (completed_date - start_date))) as min_duration_days,
        MAX(EXTRACT(DAY FROM (completed_date - start_date))) as max_duration_days
      FROM seismic_surveys
      WHERE start_date IS NOT NULL
        AND completed_date IS NOT NULL
        AND completed_date > start_date
    `;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await prisma.seismicSurvey.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    return NextResponse.json({
      overview: {
        totalSurveys,
        activeSurveys,
        completedSurveys,
        pendingSurveys: totalSurveys - completedSurveys,
        recentActivity
      },
      distribution: {
        byDimension: dimensionStats.map(stat => ({
          dimension: stat.seisDimension,
          count: stat._count
        })),
        byEnvironment: environmentStats.map(stat => ({
          environment: stat.environment,
          count: stat._count
        })),
        byWorkingArea: enrichedWorkingAreaStats,
        byCompany: companyStats.map(stat => ({
          company: stat.shotBy,
          count: stat._count
        }))
      },
      trends: {
        yearly: yearlyStats,
        monthly: monthlyStats
      },
      performance: {
        duration: durationStats[0] || {
          avg_duration_days: 0,
          min_duration_days: 0,
          max_duration_days: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching seismic survey statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
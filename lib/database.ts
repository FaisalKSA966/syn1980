// Direct database connection for dashboard
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Database connection functions
export async function getServerStats() {
  try {
    const [
      totalUsers,
      activeUsers,
      currentVoiceUsers,
      totalVoiceTimeResult,
      totalSessions,
      avgSessionResult
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { totalVoiceTime: { gt: 0 } } }),
      prisma.voiceActivity.count({ where: { leaveTime: null } }),
      prisma.user.aggregate({ _sum: { totalVoiceTime: true } }),
      prisma.voiceActivity.count({ where: { duration: { not: null } } }),
      prisma.voiceActivity.aggregate({
        _avg: { duration: true },
        where: { duration: { not: null } }
      })
    ])

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      currentVoiceUsers: currentVoiceUsers || 0,
      totalVoiceTime: totalVoiceTimeResult._sum.totalVoiceTime || 0,
      totalSessions: totalSessions || 0,
      averageSessionTime: Math.round(avgSessionResult._avg.duration || 0)
    }
  } catch (error) {
    console.error('Database error:', error)
    return {
      totalUsers: 0,
      activeUsers: 0,
      currentVoiceUsers: 0,
      totalVoiceTime: 0,
      totalSessions: 0,
      averageSessionTime: 0
    }
  }
}

export async function getLeaderboard(limit: number = 10) {
  try {
    const users = await prisma.user.findMany({
      where: { totalVoiceTime: { gt: 0 } },
      orderBy: { totalVoiceTime: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        totalVoiceTime: true
      }
    })

    return users.map((user, index) => ({
      ...user,
      rank: index + 1,
      activityScore: Math.round(user.totalVoiceTime / 60),
      avatar: null
    }))
  } catch (error) {
    console.error('Leaderboard error:', error)
    return []
  }
}

export async function getAllUsers(page: number = 1, limit: number = 20, search: string = '') {
  try {
    const skip = (page - 1) * limit
    const whereClause = search ? {
      username: { contains: search, mode: 'insensitive' as const }
    } : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        orderBy: { totalVoiceTime: 'desc' },
        skip: skip,
        take: limit,
        select: {
          id: true,
          username: true,
          totalVoiceTime: true,
          lastSeen: true
        }
      }),
      prisma.user.count({ where: whereClause })
    ])

    const usersWithRank = users.map((user, index) => ({
      ...user,
      rank: skip + index + 1,
      activityScore: Math.round(user.totalVoiceTime / 60),
      avatar: null,
      status: 'offline' as const,
      interactions: { voice: 0, messages: 0, reactions: 0 }
    }))

    return {
      users: usersWithRank,
      total: total,
      page: page,
      limit: limit
    }
  } catch (error) {
    console.error('Users error:', error)
    return {
      users: [],
      total: 0,
      page: 1,
      limit: 20
    }
  }
}

export async function getHeatmapData(days: number = 7) {
  try {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))

    const analytics = await prisma.serverAnalytics.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      },
      orderBy: [{ date: 'asc' }, { hour: 'asc' }]
    })

    // Create heatmap matrix (7 days x 24 hours)
    const heatmap = Array.from({ length: 7 }, () => 
      Array.from({ length: 24 }, () => 0)
    )

    // Fill heatmap with real data
    analytics.forEach(record => {
      const dayOfWeek = record.date.getDay()
      const hour = record.hour
      if (dayOfWeek >= 0 && dayOfWeek < 7 && hour >= 0 && hour < 24) {
        heatmap[dayOfWeek][hour] = record.activeUsers || 0
      }
    })

    return heatmap
  } catch (error) {
    console.error('Heatmap error:', error)
    return Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0))
  }
}

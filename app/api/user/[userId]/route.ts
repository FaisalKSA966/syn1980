import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        voiceActivities: {
          where: { leaveTime: { not: null } },
          orderBy: { joinTime: "desc" },
          take: 10,
        },
        gameActivities: {
          where: { endTime: { not: null } },
          orderBy: { startTime: "desc" },
          take: 10,
        },
      },
    })

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const totalSessions = await prisma.voiceActivity.count({
      where: { userId, leaveTime: { not: null } },
    })

    const channelStats = await prisma.voiceActivity.groupBy({
      by: ["channelId", "channelName"],
      where: { userId, leaveTime: { not: null } },
      _count: { channelId: true },
      _sum: { duration: true },
      orderBy: { _count: { channelId: "desc" } },
      take: 5,
    })

    const gameStats = await prisma.gameActivity.groupBy({
      by: ["gameName"],
      where: { userId, endTime: { not: null } },
      _count: { gameName: true },
      _sum: { duration: true },
      orderBy: { _count: { gameName: "desc" } },
      take: 5,
    })

    return NextResponse.json({
      ...userData,
      totalSessions,
      averageSessionTime: totalSessions > 0 ? userData.totalVoiceTime / totalSessions : 0,
      channelStats,
      gameStats,
    })
  } catch (error) {
    console.error("[v0] Error fetching user stats:", error)
    return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getServerStats } from '@/lib/database'

export async function GET() {
  try {
    const stats = await getServerStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching server stats:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch server statistics',
        totalUsers: 0,
        activeUsers: 0,
        currentVoiceUsers: 0,
        totalVoiceTime: 0,
        totalSessions: 0,
        averageSessionTime: 0
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
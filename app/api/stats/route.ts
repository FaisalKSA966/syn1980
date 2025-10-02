import { NextResponse } from 'next/server'

// This would connect to your Discord bot's API
// For now, returning mock data
export async function GET() {
  try {
    // In production, this would fetch from your Discord bot API
    // const response = await fetch(`${process.env.BOT_API_URL}/api/server/stats`)
    // const data = await response.json()
    
    // Mock data for demonstration
    const mockStats = {
      totalUsers: 4827,
      activeUsers: 1243,
      currentVoiceUsers: 89,
      totalVoiceTime: 2847392, // seconds
      totalSessions: 15847,
      averageSessionTime: 1847
    }

    return NextResponse.json(mockStats)
  } catch (error) {
    console.error('Error fetching server stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch server statistics' },
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
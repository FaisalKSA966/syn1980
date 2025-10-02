import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Mock data for demonstration
    const mockLeaderboard = [
      {
        id: '1',
        username: 'Ahmed_1980',
        avatar: '/placeholder-user.jpg',
        totalVoiceTime: 125847,
        totalSessions: 342,
        averageSessionTime: 368,
        lastSeen: '2024-01-15T10:30:00Z',
        activityScore: 95,
        rank: 1
      },
      {
        id: '2',
        username: 'Sarah_Dev',
        avatar: '/placeholder-user.jpg',
        totalVoiceTime: 98234,
        totalSessions: 287,
        averageSessionTime: 342,
        lastSeen: '2024-01-15T08:15:00Z',
        activityScore: 88,
        rank: 2
      },
      {
        id: '3',
        username: 'Mohammed_Gamer',
        avatar: '/placeholder-user.jpg',
        totalVoiceTime: 87456,
        totalSessions: 234,
        averageSessionTime: 374,
        lastSeen: '2024-01-15T12:45:00Z',
        activityScore: 82,
        rank: 3
      },
      {
        id: '4',
        username: 'Fatima_Artist',
        avatar: '/placeholder-user.jpg',
        totalVoiceTime: 76543,
        totalSessions: 198,
        averageSessionTime: 386,
        lastSeen: '2024-01-15T09:20:00Z',
        activityScore: 78,
        rank: 4
      },
      {
        id: '5',
        username: 'Omar_Coder',
        avatar: '/placeholder-user.jpg',
        totalVoiceTime: 65432,
        totalSessions: 176,
        averageSessionTime: 372,
        lastSeen: '2024-01-15T11:15:00Z',
        activityScore: 74,
        rank: 5
      }
    ].slice(0, limit)

    return NextResponse.json(mockLeaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
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
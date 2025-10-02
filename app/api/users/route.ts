import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    
    // In production, this would fetch from your Discord bot API
    // const response = await fetch(`${process.env.BOT_API_URL}/api/users?page=${page}&limit=${limit}&search=${search}`)
    // const data = await response.json()
    
    // Mock comprehensive user data
    const mockUsers = Array.from({ length: 100 }, (_, i) => ({
      id: `user_${i + 1}`,
      username: `User_${i + 1}`,
      avatar: `/placeholder-user.jpg`,
      totalVoiceTime: Math.floor(Math.random() * 200000) + 10000,
      totalSessions: Math.floor(Math.random() * 500) + 50,
      averageSessionTime: Math.floor(Math.random() * 600) + 300,
      lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      favoriteChannels: [
        { name: 'General Voice', time: Math.floor(Math.random() * 50000), sessions: Math.floor(Math.random() * 100) },
        { name: 'Gaming Hub', time: Math.floor(Math.random() * 40000), sessions: Math.floor(Math.random() * 80) },
        { name: 'Study Room', time: Math.floor(Math.random() * 30000), sessions: Math.floor(Math.random() * 60) }
      ],
      topGames: [
        { name: 'Valorant', time: Math.floor(Math.random() * 30000), sessions: Math.floor(Math.random() * 50) },
        { name: 'Minecraft', time: Math.floor(Math.random() * 25000), sessions: Math.floor(Math.random() * 40) },
        { name: 'Among Us', time: Math.floor(Math.random() * 20000), sessions: Math.floor(Math.random() * 30) }
      ],
      activityScore: Math.floor(Math.random() * 40) + 60,
      rank: i + 1,
      status: ['online', 'offline', 'idle', 'dnd'][Math.floor(Math.random() * 4)],
      joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      messageCount: Math.floor(Math.random() * 5000),
      reactionCount: Math.floor(Math.random() * 1000)
    }))
    
    // Filter by search term
    const filteredUsers = search 
      ? mockUsers.filter(user => 
          user.username.toLowerCase().includes(search.toLowerCase())
        )
      : mockUsers
    
    // Sort by activity score (highest first)
    filteredUsers.sort((a, b) => b.activityScore - a.activityScore)
    
    // Paginate
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)
    
    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
        hasNext: endIndex < filteredUsers.length,
        hasPrev: page > 1
      },
      search
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
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


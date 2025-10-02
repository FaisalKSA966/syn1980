import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    
    // In production, this would fetch from your Discord bot API
    // const response = await fetch(`${process.env.BOT_API_URL}/api/server/heatmap?days=${days}`)
    // const data = await response.json()
    
    // Mock heatmap data for demonstration
    const mockHeatmap = {
      heatmap: Array.from({ length: 7 }, (_, day) => 
        Array.from({ length: 24 }, (_, hour) => {
          // Simulate realistic activity patterns
          let baseActivity = 10
          
          // Higher activity during evening hours (18-23)
          if (hour >= 18 && hour <= 23) {
            baseActivity = 30 + Math.random() * 20
          }
          // Moderate activity during day hours (9-17)
          else if (hour >= 9 && hour <= 17) {
            baseActivity = 15 + Math.random() * 15
          }
          // Lower activity during night/early morning (0-8)
          else {
            baseActivity = 2 + Math.random() * 8
          }
          
          // Weekend boost (Friday and Saturday)
          if (day === 5 || day === 6) {
            baseActivity *= 1.3
          }
          
          return Math.floor(baseActivity)
        })
      ),
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      hours: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      totalDays: days,
      maxActivity: 50
    }

    return NextResponse.json(mockHeatmap)
  } catch (error) {
    console.error('Error fetching heatmap:', error)
    return NextResponse.json(
      { error: 'Failed to fetch heatmap data' },
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
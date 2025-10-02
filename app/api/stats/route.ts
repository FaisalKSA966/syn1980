import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Try to fetch from bot API
    const botApiUrl = process.env.BOT_API_URL || 'http://localhost:3001'
    
    try {
      const response = await fetch(`${botApiUrl}/api/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(5000)
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      } else {
        throw new Error(`Bot API returned ${response.status}`)
      }
    } catch (fetchError) {
      console.log('Bot API not available:', fetchError.message)
      
      // Return empty stats with message
      const emptyStats = {
        totalUsers: 0,
        activeUsers: 0,
        currentVoiceUsers: 0,
        totalVoiceTime: 0,
        totalSessions: 0,
        averageSessionTime: 0,
        message: "لا توجد بيانات متاحة - تأكد من أن البوت يعمل ومتصل بقاعدة البيانات"
      }

      return NextResponse.json(emptyStats)
    }
  } catch (error) {
    console.error('Error fetching server stats:', error)
    return NextResponse.json(
      { 
        error: 'فشل في استخراج الإحصائيات من قاعدة البيانات',
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
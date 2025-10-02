import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // In a real implementation, this would connect to your Discord bot's database
    // For now, we return empty/zero stats to indicate no data is available
    const realStats = {
      totalUsers: 0,
      activeUsers: 0,
      currentVoiceUsers: 0,
      totalVoiceTime: 0,
      totalSessions: 0,
      averageSessionTime: 0,
      message: "لا توجد بيانات متاحة - تأكد من أن البوت يعمل ومتصل بقاعدة البيانات"
    }

    return NextResponse.json(realStats)
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
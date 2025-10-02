import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // In a real implementation, this would query your Discord bot's database
    // For now, we return empty array to indicate no data is available
    const realLeaderboard = {
      users: [],
      message: "لا توجد بيانات متصدرين - لم يتم العثور على نشاط صوتي في قاعدة البيانات"
    }

    return NextResponse.json(realLeaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { 
        error: 'فشل في استخراج بيانات المتصدرين من قاعدة البيانات',
        users: []
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
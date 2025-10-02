import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    
    // In a real implementation, this would query your Discord bot's database
    // For now, we return empty array to indicate no data is available
    const realUsers = {
      users: [],
      total: 0,
      page: page,
      limit: limit,
      message: "لا توجد بيانات أعضاء - تأكد من أن البوت يعمل ويراقب السيرفر"
    }

    return NextResponse.json(realUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { 
        error: 'فشل في استخراج بيانات الأعضاء من قاعدة البيانات',
        users: [],
        total: 0
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
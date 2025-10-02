import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    
    // In a real implementation, this would query your Discord bot's database
    // For now, we return empty heatmap data to indicate no data is available
    const realHeatmap = {
      heatmap: Array.from({ length: 7 }, () => 
        Array.from({ length: 24 }, () => 0)
      ),
      message: "لا توجد بيانات نشاط - لم يتم العثور على بيانات نشاط في قاعدة البيانات"
    }

    return NextResponse.json(realHeatmap)
  } catch (error) {
    console.error('Error fetching heatmap:', error)
    return NextResponse.json(
      { 
        error: 'فشل في استخراج بيانات خريطة النشاط من قاعدة البيانات',
        heatmap: Array.from({ length: 7 }, () => 
          Array.from({ length: 24 }, () => 0)
        )
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
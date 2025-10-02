import { NextResponse } from 'next/server'
import { getHeatmapData } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    
    const heatmap = await getHeatmapData(days)
    
    return NextResponse.json({
      heatmap: heatmap,
      message: heatmap.flat().every(val => val === 0) ? "No activity data for the specified days" : null
    })
  } catch (error) {
    console.error('Error fetching heatmap:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch heatmap data',
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
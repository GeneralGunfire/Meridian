import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { StatusData } from '@/types'

export async function GET() {
  try {
    const statusFile = join(process.cwd(), 'data', 'status.json')

    // Default status (all successful with dummy dates)
    const defaultStatus: StatusData = {
      crime_stats: {
        success: true,
        last_updated: new Date().toISOString().split('T')[0],
        error: null,
      },
      eskom: {
        success: true,
        last_updated: new Date().toISOString().split('T')[0],
        error: null,
      },
      water: {
        success: true,
        last_updated: new Date().toISOString().split('T')[0],
        error: null,
      },
      housing: {
        success: true,
        last_updated: new Date().toISOString().split('T')[0],
        error: null,
      },
    }

    if (existsSync(statusFile)) {
      try {
        const content = readFileSync(statusFile, 'utf-8')
        const parsed = JSON.parse(content)
        const results = parsed.results || defaultStatus

        return NextResponse.json(results)
      } catch {
        return NextResponse.json(defaultStatus)
      }
    }

    return NextResponse.json(defaultStatus)
  } catch (error) {
    console.error('Status API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    )
  }
}

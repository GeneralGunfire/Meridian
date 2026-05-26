import { NextResponse } from 'next/server'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { DatasetFiles, FileData } from '@/types'

function parseFileName(filename: string): FileData | null {
  // Match pattern: crime_stats_2026-w21.csv
  const match = filename.match(/^(\w+)_(\d{4}-w\d{2})\.(csv|xlsx)$/)
  if (!match) return null

  const [_, dataset, week, ext] = match
  const [year, weekNum] = week.split('-w')
  const weekNumber = parseInt(weekNum)
  const date = getDateFromWeek(parseInt(year), weekNumber)

  return {
    week: week,
    date: date.toISOString().split('T')[0],
    csv_url: `/api/download/${dataset}_${week}.csv`,
    xlsx_url: `/api/download/${dataset}_${week}.xlsx`,
    rows: 0, // Could parse CSV to count rows
  }
}

function getDateFromWeek(year: number, week: number): Date {
  const simple = new Date(year, 0, 1 + (week - 1) * 7)
  const dow = simple.getDay()
  const ISOweekStart = simple
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1)
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay())
  return ISOweekStart
}

export async function GET() {
  try {
    const dataDir = join(process.cwd(), 'data')
    const datasets: DatasetFiles = {
      crime_stats: [],
      eskom: [],
      water: [],
      housing: [],
    }

    try {
      const files = readdirSync(dataDir)
      files.forEach((file) => {
        if (file === 'status.json') return

        const parsed = parseFileName(file)
        if (!parsed) return

        // Find dataset type
        for (const [key] of Object.entries(datasets)) {
          if (file.startsWith(key)) {
            datasets[key as keyof DatasetFiles].push(parsed)
          }
        }
      })
    } catch {
      // Data directory doesn't exist yet
    }

    // Sort each dataset by date (newest first)
    Object.keys(datasets).forEach((key) => {
      datasets[key as keyof DatasetFiles].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    })

    return NextResponse.json(datasets)
  } catch (error) {
    console.error('Files API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import Papa from 'papaparse'

export function getWeekString(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-w${String(weekNum).padStart(2, '0')}`
}

export function saveAsCSV(data: any[], filename: string): void {
  const dataDir = join(process.cwd(), 'data')
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }

  const csv = Papa.unparse(data)
  const filePath = join(dataDir, filename)
  writeFileSync(filePath, csv, 'utf-8')
  console.log(`✓ Saved: ${filename}`)
}

export function getDataFiles(): Record<string, any[]> {
  const dataDir = join(process.cwd(), 'data')
  const files: Record<string, any[]> = {
    crime_stats: [],
    eskom: [],
    water: [],
    housing: [],
  }

  // Scan data directory for files
  // For now, return empty (will be populated by scrapers)

  return files
}

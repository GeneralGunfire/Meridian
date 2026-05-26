import { readdirSync, statSync, readFileSync } from 'fs'
import { join } from 'path'
import Papa from 'papaparse'

export function getAvailableFiles() {
  const dataDir = join(process.cwd(), 'data')
  const files: Record<string, any> = {
    crime_stats: [],
    eskom: [],
    water: [],
    housing: [],
  }

  try {
    const items = readdirSync(dataDir)

    items.forEach((file) => {
      if (file === 'status.json' || !file.endsWith('.csv')) return

      const dataset = file.split('_')[0]
      if (!files[dataset]) return

      const filePath = join(dataDir, file)
      const stat = statSync(filePath)
      const match = file.match(/^(\w+)_(\d{4}-w\d{2})\.csv$/)

      if (match) {
        files[dataset].push({
          filename: file,
          size: stat.size,
          week: match[2],
        })
      }
    })
  } catch (error) {
    console.error('Error reading data directory:', error)
  }

  return files
}

export function getFileStats(filename: string) {
  const filePath = join(process.cwd(), 'data', filename)
  const content = readFileSync(filePath, 'utf-8')
  const rows = content.split('\n').length - 1 // Subtract header

  return {
    rows,
    size: content.length,
  }
}

export interface FileData {
  week: string
  date: string
  csv_url: string
  xlsx_url: string
  rows: number
}

export interface DatasetFiles {
  crime_stats: FileData[]
  eskom: FileData[]
  water: FileData[]
  housing: FileData[]
}

export interface StatusData {
  [key: string]: {
    success: boolean
    last_updated: string
    error: string | null
  }
}

export type Dataset = 'crime_stats' | 'eskom' | 'water' | 'housing'

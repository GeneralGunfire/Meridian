import axios from 'axios'
import * as cheerio from 'cheerio'
import { getWeekString } from './utils'

export interface CrimeRecord {
  Week: string
  Year: string
  Province: string
  Crime_Type: string
  Count: number
}

export async function scrapeCrimeStats(): Promise<{ data: CrimeRecord[]; error: string | null }> {
  try {
    const url = 'https://www.saps.gov.za/services/crimestats.php'
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })

    const $ = cheerio.load(response.data)
    const week = getWeekString(new Date())
    const year = new Date().getFullYear().toString()

    // For now, return dummy data matching the structure
    // In production, parse the SAPS page for actual tables
    const dummyData: CrimeRecord[] = [
      {
        Week: week,
        Year: year,
        Province: 'Gauteng',
        Crime_Type: 'Homicide',
        Count: 145,
      },
      {
        Week: week,
        Year: year,
        Province: 'Western Cape',
        Crime_Type: 'Homicide',
        Count: 98,
      },
      {
        Week: week,
        Year: year,
        Province: 'KwaZulu-Natal',
        Crime_Type: 'Homicide',
        Count: 112,
      },
      {
        Week: week,
        Year: year,
        Province: 'Gauteng',
        Crime_Type: 'Assault',
        Count: 342,
      },
      {
        Week: week,
        Year: year,
        Province: 'Western Cape',
        Crime_Type: 'Assault',
        Count: 267,
      },
    ]

    return { data: dummyData, error: null }
  } catch (error) {
    console.error('Crime scraper error:', error)
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

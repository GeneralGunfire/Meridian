import axios from 'axios'

export interface EskomRecord {
  Date: string
  Stage: number
  Province: string
}

export async function scrapeEskom(): Promise<{ data: EskomRecord[]; error: string | null }> {
  try {
    const url = 'https://loadshedding.eskom.co.za/'
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })

    // For now, return dummy data matching current date
    // In production, parse the Eskom portal for current stage
    const today = new Date().toISOString().split('T')[0]

    const dummyData: EskomRecord[] = [
      {
        Date: today,
        Stage: 2,
        Province: 'National',
      },
    ]

    return { data: dummyData, error: null }
  } catch (error) {
    console.error('Eskom scraper error:', error)
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

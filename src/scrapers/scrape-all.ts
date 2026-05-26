import { scrapeCrimeStats } from './crime-scraper'
import { scrapeEskom } from './eskom-scraper'
import { scrapeWater } from './water-scraper'
import { scrapeHousing } from './housing-scraper'
import { saveAsCSV, getWeekString } from './utils'

async function runAllScrapers() {
  console.log('🚀 Starting weekly data scrape...\n')

  const week = getWeekString(new Date())
  const date = new Date().toISOString().split('T')[0]
  const results = {
    crime_stats: { success: false, error: null as string | null },
    eskom: { success: false, error: null as string | null },
    water: { success: false, error: null as string | null },
    housing: { success: false, error: null as string | null },
  }

  // Crime Stats
  console.log('📊 Scraping crime statistics...')
  const crimeResult = await scrapeCrimeStats()
  if (crimeResult.error) {
    console.error(`❌ Crime stats failed: ${crimeResult.error}`)
    results.crime_stats.error = crimeResult.error
  } else {
    saveAsCSV(crimeResult.data, `crime_stats_${week}.csv`)
    results.crime_stats.success = true
  }

  // Eskom
  console.log('⚡ Scraping Eskom load shedding...')
  const eskomResult = await scrapeEskom()
  if (eskomResult.error) {
    console.error(`❌ Eskom failed: ${eskomResult.error}`)
    results.eskom.error = eskomResult.error
  } else {
    saveAsCSV(eskomResult.data, `eskom_${week}.csv`)
    results.eskom.success = true
  }

  // Water
  console.log('💧 Scraping water statistics...')
  const waterResult = await scrapeWater()
  if (waterResult.error) {
    console.error(`❌ Water failed: ${waterResult.error}`)
    results.water.error = waterResult.error
  } else {
    saveAsCSV(waterResult.data, `water_${week}.csv`)
    results.water.success = true
  }

  // Housing
  console.log('🏠 Scraping housing statistics...')
  const housingResult = await scrapeHousing()
  if (housingResult.error) {
    console.error(`❌ Housing failed: ${housingResult.error}`)
    results.housing.error = housingResult.error
  } else {
    saveAsCSV(housingResult.data, `housing_${week}.csv`)
    results.housing.success = true
  }

  // Summary
  console.log('\n✅ Scrape complete!\n')
  console.log('Status:', results)

  // Save status for API
  const statusPath = require('path').join(process.cwd(), 'data', 'status.json')
  const fs = require('fs')
  fs.writeFileSync(
    statusPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        results,
      },
      null,
      2
    )
  )
}

runAllScrapers().catch(console.error)

const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, '..', 'data')

// Create data directory
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Generate dummy CSV files for testing
const today = new Date()
const week = getWeekString(today)

function getWeekString(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-w${String(weekNum).padStart(2, '0')}`
}

// Crime Stats
const crimeData = `Week,Year,Province,Crime_Type,Count
${week},2026,Gauteng,Homicide,145
${week},2026,Gauteng,Assault,342
${week},2026,Western Cape,Homicide,98
${week},2026,Western Cape,Assault,267
${week},2026,KwaZulu-Natal,Homicide,112
${week},2026,KwaZulu-Natal,Assault,298
`

fs.writeFileSync(path.join(dataDir, `crime_stats_${week}.csv`), crimeData)
console.log(`✓ Created crime_stats_${week}.csv`)

// Eskom
const eskomData = `Date,Stage,Province
${today.toISOString().split('T')[0]},2,National
`

fs.writeFileSync(path.join(dataDir, `eskom_${week}.csv`), eskomData)
console.log(`✓ Created eskom_${week}.csv`)

// Water
const waterData = `Year,Municipality,Water_Supply_Percent,Sanitation_Percent
2023,Johannesburg,87.2,83.1
2023,Cape Town,91.5,88.7
2023,Durban,84.3,80.2
2023,Pretoria,89.1,85.6
`

fs.writeFileSync(path.join(dataDir, `water_${week}.csv`), waterData)
console.log(`✓ Created water_${week}.csv`)

// Housing
const housingData = `Year,Total_Households_Millions,Formal_Dwellings_Percent,Electricity_Percent,Water_Percent
2023,19.0,58.6,89.8,87.0
2022,18.8,57.2,89.2,86.5
2021,18.5,56.1,88.7,86.0
`

fs.writeFileSync(path.join(dataDir, `housing_${week}.csv`), housingData)
console.log(`✓ Created housing_${week}.csv`)

// Status file
const statusData = {
  timestamp: new Date().toISOString(),
  results: {
    crime_stats: { success: true, error: null },
    eskom: { success: true, error: null },
    water: { success: true, error: null },
    housing: { success: true, error: null },
  },
}

fs.writeFileSync(path.join(dataDir, 'status.json'), JSON.stringify(statusData, null, 2))
console.log('✓ Created status.json')

console.log(`\n✅ Seeded data for week ${week}`)

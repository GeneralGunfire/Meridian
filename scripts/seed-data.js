/**
 * seed-data.js — generates dummy CSV files into the new data/<category>/<dataset>/ layout
 * and writes manifest.json + status.json. Used for local testing before scrapers are built.
 *
 * Usage: node scripts/seed-data.js
 */

const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, '..', 'data')

// ── helpers ───────────────────────────────────────────────────────────────────
function getWeekString(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-w${String(weekNum).padStart(2, '0')}`
}

function writeFile(relPath, content) {
  const fullPath = path.join(dataDir, relPath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content)
  console.log(`  ✓ ${relPath}`)
  return relPath
}

function writeJson(relPath, obj) {
  return writeFile(relPath, JSON.stringify(obj, null, 2) + '\n')
}

function csvRows(header, rows) {
  return [header, ...rows].join('\n') + '\n'
}

// ── seed data ─────────────────────────────────────────────────────────────────
const today = new Date()
const week = getWeekString(today)
const dateStr = today.toISOString().split('T')[0]
const now = today.toISOString()

const seeded = []  // {id, category, period, csv, rows}

// SAFETY ── crime_stats
const crimeRows = [
  `2026,Q1,Gauteng,Johannesburg Central,Homicide,145,3.5`,
  `2026,Q1,Gauteng,Johannesburg Central,Assault,342,1.2`,
  `2026,Q1,Western Cape,Cape Town Central,Homicide,98,-2.1`,
  `2026,Q1,Western Cape,Cape Town Central,Assault,267,0.8`,
  `2026,Q1,KwaZulu-Natal,Durban Central,Homicide,112,4.2`,
  `2026,Q1,KwaZulu-Natal,Durban Central,Assault,298,2.0`,
]
const crimePath = `safety/crime_stats/crime_stats_2026-q1.csv`
writeFile(crimePath, csvRows('Year,Quarter,Province,Station,Crime_Type,Count,Change_Pct', crimeRows))
seeded.push({ id: 'crime_stats', category: 'safety', period: '2026-q1', csv: crimePath, rows: crimeRows.length })

// ENERGY ── eskom_power
const eskomPowerRows = [
  `${dateStr},08,34500,28200,0,0,National`,
  `${dateStr},09,36100,30000,0,0,National`,
  `${dateStr},18,38500,28000,2,2000,National`,
]
const eskomPath = `energy/eskom_power/eskom_power_${week}.csv`
writeFile(eskomPath, csvRows('Date,Hour,MW_Demand,MW_Available,Stage,Outage_MW,Province', eskomPowerRows))
seeded.push({ id: 'eskom_power', category: 'energy', period: week, csv: eskomPath, rows: eskomPowerRows.length })

// SOCIAL ── water
const waterRows = [
  `2024,Gauteng,City of Johannesburg,89.2,85.1,84.3,78.2,45000`,
  `2024,Gauteng,City of Tshwane,91.5,88.7,86.5,80.1,32000`,
  `2024,Western Cape,City of Cape Town,94.1,92.3,91.2,88.5,18000`,
  `2024,KwaZulu-Natal,eThekwini,84.3,80.2,82.1,75.4,62000`,
]
const waterPath = `social/water/water_2024.csv`
writeFile(waterPath, csvRows('Year,Province,Municipality,Water_Access_Pct,Piped_Water_Pct,Sanitation_Access_Pct,Flush_Toilet_Pct,Backlog_Households', waterRows))
seeded.push({ id: 'water', category: 'social', period: '2024', csv: waterPath, rows: waterRows.length })

// SOCIAL ── housing
const housingRows = [
  `2024,Gauteng,5800000,63.2,850000,320000,91.2,89.1,12500`,
  `2024,Western Cape,2300000,74.1,120000,95000,93.5,92.8,4200`,
  `2024,KwaZulu-Natal,3600000,55.8,430000,280000,87.2,84.3,18500`,
  `2023,National,19200000,59.1,6200000,2100000,89.8,87.0,2850`,
  `2022,National,18800000,57.2,5900000,2350000,89.2,86.5,2950`,
]
const housingPath = `social/housing/housing_2024.csv`
writeFile(housingPath, csvRows('Year,Province,Total_Households,Formal_Dwellings_Pct,RDP_Delivered,Backlog_Units,Electricity_Pct,Water_Access_Pct,Spending_ZAR_Millions', housingRows))
seeded.push({ id: 'housing', category: 'social', period: '2024', csv: housingPath, rows: housingRows.length })

// SOCIAL ── unemployment
const unemploymentRows = [
  `2026,Q1,National,32.9,43.1,59.2,16850,All sectors`,
  `2026,Q1,Gauteng,29.1,38.5,62.1,4820,All sectors`,
  `2026,Q1,Western Cape,22.8,31.2,65.8,2340,All sectors`,
  `2026,Q1,KwaZulu-Natal,35.4,46.2,57.8,2890,All sectors`,
]
const unemploymentPath = `social/unemployment/unemployment_2026-q1.csv`
writeFile(unemploymentPath, csvRows('Year,Quarter,Province,Unemployment_Pct,Expanded_Unemployment_Pct,Labour_Force_Participation_Pct,Employed_Thousands,Sector', unemploymentRows))
seeded.push({ id: 'unemployment', category: 'social', period: '2026-q1', csv: unemploymentPath, rows: unemploymentRows.length })

// ECONOMY ── sarb_monetary
const sarbRows = [
  `2026-05-01,8.25,11.75,5.2,4250000,1850000,18.45,17.12,23.11`,
  `2026-04-01,8.25,11.75,5.4,4220000,1820000,18.62,17.28,23.45`,
  `2026-03-01,8.25,11.75,5.8,4180000,1790000,18.91,17.54,23.82`,
]
const sarbPath = `economy/sarb_monetary/sarb_monetary_2026-05.csv`
writeFile(sarbPath, csvRows('Date,Repo_Rate_Pct,Prime_Rate_Pct,CPI_Pct,M3_ZAR_Millions,Credit_Extension_ZAR_Millions,ZAR_USD,ZAR_EUR,ZAR_GBP', sarbRows))
seeded.push({ id: 'sarb_monetary', category: 'economy', period: '2026-05', csv: sarbPath, rows: sarbRows.length })

// ECONOMY ── gdp_macro
const gdpRows = [
  `2026,Q1,1850000,1.2,5.2,Finance,Gross Domestic Expenditure`,
  `2026,Q1,1850000,1.2,5.2,Mining,Gross Value Added`,
  `2025,Q4,1830000,0.8,5.4,Finance,Gross Domestic Expenditure`,
  `2025,Q3,1810000,0.6,5.6,Manufacturing,Gross Value Added`,
]
const gdpPath = `economy/gdp_macro/gdp_macro_2026-q1.csv`
writeFile(gdpPath, csvRows('Year,Quarter,GDP_ZAR_Millions,GDP_Growth_Pct,CPI_Pct,Sector,Expenditure_Type', gdpRows))
seeded.push({ id: 'gdp_macro', category: 'economy', period: '2026-q1', csv: gdpPath, rows: gdpRows.length })

// ECONOMY ── tax_revenue
const taxRows = [
  `2024/25,Personal Income Tax,748000,6.2,38.5`,
  `2024/25,Value Added Tax,512000,5.8,26.4`,
  `2024/25,Corporate Income Tax,289000,4.1,14.9`,
  `2024/25,Customs and Excise,102000,3.2,5.3`,
  `2024/25,Other,291000,2.9,14.9`,
]
const taxPath = `economy/tax_revenue/tax_revenue_2025.csv`
writeFile(taxPath, csvRows('Fiscal_Year,Tax_Type,Amount_ZAR_Millions,YoY_Change_Pct,Share_of_Total_Pct', taxRows))
seeded.push({ id: 'tax_revenue', category: 'economy', period: '2025', csv: taxPath, rows: taxRows.length })

// ECONOMY ── budget_spending
const budgetRows = [
  `2025/26,National,Health,District Health Services,142000,138500,-2.5`,
  `2025/26,National,Education,Basic Education,285000,279000,-2.1`,
  `2025/26,National,Transport,Public Transport,62000,58500,-5.6`,
  `2025/26,National,Police,Visible Policing,115000,112000,-2.6`,
]
const budgetPath = `economy/budget_spending/budget_spending_2026.csv`
writeFile(budgetPath, csvRows('Financial_Year,Sphere,Department,Programme,Budget_ZAR,Actual_ZAR,Variance_Pct', budgetRows))
seeded.push({ id: 'budget_spending', category: 'economy', period: '2026', csv: budgetPath, rows: budgetRows.length })

// ECONOMY ── municipal_finance
const municiRows = [
  `2024/25,City of Johannesburg,Gauteng,3100,Operating Revenue,95200,91800,88400`,
  `2024/25,City of Cape Town,Western Cape,3200,Operating Revenue,74100,72300,71900`,
  `2024/25,eThekwini,KwaZulu-Natal,3200,Operating Revenue,58400,55200,54800`,
]
const municiPath = `economy/municipal_finance/municipal_finance_2025.csv`
writeFile(municiPath, csvRows('Financial_Year,Municipality,Province,Item_Code,Item_Label,Budget_ZAR,Actual_ZAR,Audited_ZAR', municiRows))
seeded.push({ id: 'municipal_finance', category: 'economy', period: '2025', csv: municiPath, rows: municiRows.length })

// ENERGY ── eskom_infrastructure
const infraRows = [
  `${dateStr},Koeberg,1940,65.8,8.2,12.4,5.1,Nuclear`,
  `${dateStr},Medupi,4764,72.1,10.5,8.8,4.2,Coal`,
  `${dateStr},Kusile,4800,68.4,11.2,9.6,3.8,Coal`,
  `${dateStr},Kendal,4116,71.2,9.8,10.1,4.5,Coal`,
]
const infraPath = `energy/eskom_infrastructure/eskom_infrastructure_${week}.csv`
writeFile(infraPath, csvRows('Date,Plant_Name,Capacity_MW,EAF_Pct,UCLF_MW,PCLF_MW,OCLF_MW,Fuel_Type', infraRows))
seeded.push({ id: 'eskom_infrastructure', category: 'energy', period: week, csv: infraPath, rows: infraRows.length })

// ── manifest.json ─────────────────────────────────────────────────────────────
const datasets = {}
for (const s of seeded) {
  datasets[s.id] = {
    files: [{ period: s.period, date: dateStr, rows: s.rows, csv: s.csv }],
  }
}
writeJson('manifest.json', { generatedAt: now, datasets })

// ── status.json ───────────────────────────────────────────────────────────────
const statusDatasets = {}
for (const s of seeded) {
  statusDatasets[s.id] = { success: true, last_updated: dateStr, error: null, skipped: false }
}
// Datasets with no seed data — show as pending/skipped
const ALL_IDS = ['crime_stats','eskom_power','eskom_infrastructure','eskom_spending','eskom_revenue',
  'water','housing','unemployment','sarb_monetary','gdp_macro','tax_revenue','budget_spending',
  'municipal_finance']
for (const id of ALL_IDS) {
  if (!statusDatasets[id]) {
    statusDatasets[id] = { success: false, last_updated: null, error: null, skipped: true }
  }
}
writeJson('status.json', { generatedAt: now, datasets: statusDatasets })

console.log(`\n✅ Seeded ${seeded.length} datasets for week ${week}`)
console.log('   manifest.json and status.json updated')

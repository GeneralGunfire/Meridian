/**
 * registry.ts — the canonical 15-dataset universe for Meridian.
 * Both the API route handlers (read) and the pipeline (write) share this shape.
 * The pipeline has its own copy in pipeline/src/registry.ts.
 */

export type DatasetMethod = "api" | "parse" | "scrape" | "manual";
export type DatasetCadence = "weekly" | "monthly" | "quarterly" | "annual";
export type CategoryId = "economy" | "energy" | "social" | "safety";

/** A single column: machine name + human label + unit/format hint */
export interface ColumnInfo {
  name: string;    // exact CSV header e.g. "Repo_Rate_Pct"
  label: string;   // human label e.g. "Repo rate"
  unit: string;    // unit/format e.g. "%", "ZAR millions", "MW", "text"
}

export interface DatasetSpec {
  id: string;
  category: CategoryId;
  label: string;
  description: string;
  /** What one row in this dataset represents — the grain */
  grain: string;
  source: string;
  sourceUrl: string;
  method: DatasetMethod;
  cadence: DatasetCadence;
  columns: ColumnInfo[];
  color: string;       // Tailwind bg class for card accent
  badgeColor: string;  // Tailwind badge class
}

export interface CategorySpec {
  id: CategoryId;
  label: string;
  description: string;
}

export const CATEGORIES: CategorySpec[] = [
  {
    id: "economy",
    label: "Economy",
    description: "Tax revenue, government spending, GDP, monetary policy and municipal finances.",
  },
  {
    id: "energy",
    label: "Energy",
    description: "Eskom power supply & demand, infrastructure health, and financial performance.",
  },
  {
    id: "social",
    label: "Social",
    description: "Water & sanitation access, housing, and labour market data.",
  },
  {
    id: "safety",
    label: "Safety",
    description: "Province-level crime statistics from the South African Police Service.",
  },
];

// Helper to keep column definitions terse
const col = (name: string, label: string, unit: string): ColumnInfo => ({ name, label, unit });

export const DATASETS: DatasetSpec[] = [
  // ── ECONOMY ─────────────────────────────────────────────────────────────────
  {
    id: "tax_revenue",
    category: "economy",
    label: "Tax Revenue",
    description: "Annual SARS tax collection by type — VAT, income tax, corporate tax, customs & excise. Includes YoY growth and fiscal-year totals.",
    grain: "One row per tax type per fiscal year.",
    source: "SARS",
    sourceUrl: "https://www.sars.gov.za/about/sars-tax-and-customs-system/tax-statistics/",
    method: "parse",
    cadence: "annual",
    columns: [
      col("Fiscal_Year", "Fiscal year", "e.g. 2024/25"),
      col("Tax_Type", "Tax type", "text"),
      col("Amount_ZAR_Millions", "Amount collected", "ZAR millions"),
      col("YoY_Change_Pct", "Year-on-year change", "%"),
      col("Share_of_Total_Pct", "Share of total revenue", "%"),
    ],
    color: "bg-emerald-50 border-emerald-100",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "budget_spending",
    category: "economy",
    label: "Budget & Spending",
    description: "National and provincial government budgets and actual expenditure by department, sourced from the Treasury Vulekamali open-data platform.",
    grain: "One row per programme per department per financial year.",
    source: "National Treasury (Vulekamali)",
    sourceUrl: "https://vulekamali.gov.za/datasets",
    method: "api",
    cadence: "annual",
    columns: [
      col("Financial_Year", "Financial year", "e.g. 2025/26"),
      col("Sphere", "Government sphere", "national / provincial"),
      col("Department", "Department", "text"),
      col("Programme", "Budget programme", "text"),
      col("Budget_ZAR", "Budgeted amount", "ZAR thousands"),
      col("Actual_ZAR", "Actual spent", "ZAR thousands"),
      col("Variance_Pct", "Budget variance", "%"),
    ],
    color: "bg-sky-50 border-sky-100",
    badgeColor: "bg-sky-100 text-sky-700",
  },
  {
    id: "gdp_macro",
    category: "economy",
    label: "GDP & Macro Indicators",
    description: "Quarterly GDP by expenditure and sector, CPI, PPI, and trade balance from StatsSA publication P0441.",
    grain: "One row per sector / expenditure type per quarter.",
    source: "StatsSA (P0441)",
    sourceUrl: "https://www.statssa.gov.za/?page_id=1847",
    method: "parse",
    cadence: "quarterly",
    columns: [
      col("Year", "Year", "e.g. 2026"),
      col("Quarter", "Quarter", "Q1–Q4"),
      col("GDP_ZAR_Millions", "GDP", "ZAR millions"),
      col("GDP_Growth_Pct", "GDP growth (q/q annualised)", "%"),
      col("CPI_Pct", "CPI inflation", "%"),
      col("Sector", "Economic sector", "text"),
      col("Expenditure_Type", "Expenditure type", "text"),
    ],
    color: "bg-violet-50 border-violet-100",
    badgeColor: "bg-violet-100 text-violet-700",
  },
  {
    id: "sarb_monetary",
    category: "economy",
    label: "Monetary & Banking",
    description: "Repo rate, prime rate, M3 money supply, credit extension, exchange rates (ZAR/USD, ZAR/EUR, ZAR/GBP), and CPI from the SA Reserve Bank.",
    grain: "One row per month.",
    source: "SARB",
    sourceUrl: "https://www.resbank.co.za/en/home/what-we-do/statistics",
    method: "api",
    cadence: "monthly",
    columns: [
      col("Date", "Month", "YYYY-MM-DD"),
      col("Repo_Rate_Pct", "Repo rate", "%"),
      col("Prime_Rate_Pct", "Prime lending rate", "%"),
      col("CPI_Pct", "CPI inflation", "%"),
      col("M3_ZAR_Millions", "M3 money supply", "ZAR millions"),
      col("Credit_Extension_ZAR_Millions", "Private sector credit", "ZAR millions"),
      col("ZAR_USD", "Rand / US dollar", "exchange rate"),
      col("ZAR_EUR", "Rand / euro", "exchange rate"),
      col("ZAR_GBP", "Rand / pound", "exchange rate"),
    ],
    color: "bg-amber-50 border-amber-100",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    id: "municipal_finance",
    category: "economy",
    label: "Municipal Finance",
    description: "Income, expenditure, balance sheet and cash flow data for all SA municipalities via the Treasury Municipal Finance OLAP API.",
    grain: "One row per line item per municipality per financial year.",
    source: "National Treasury (Municipal Data API)",
    sourceUrl: "https://municipaldata.treasury.gov.za/",
    method: "api",
    cadence: "annual",
    columns: [
      col("Financial_Year", "Financial year", "e.g. 2024/25"),
      col("Municipality", "Municipality", "text"),
      col("Province", "Province", "text"),
      col("Item_Code", "Line item code", "text"),
      col("Item_Label", "Line item", "text"),
      col("Budget_ZAR", "Budgeted", "ZAR"),
      col("Actual_ZAR", "Actual", "ZAR"),
      col("Audited_ZAR", "Audited", "ZAR"),
    ],
    color: "bg-teal-50 border-teal-100",
    badgeColor: "bg-teal-100 text-teal-700",
  },

  // ── ENERGY ───────────────────────────────────────────────────────────────────
  {
    id: "eskom_power",
    category: "energy",
    label: "Power Supply & Demand",
    description: "Hourly and daily system power demand, available capacity, load-shedding stage, and outage duration — national and by province.",
    grain: "One row per hour per province.",
    source: "Eskom Data Portal",
    sourceUrl: "https://www.eskom.co.za/dataportal/demand-side/system-hourly-demand-and-available-capacity/",
    method: "scrape",
    cadence: "weekly",
    columns: [
      col("Date", "Date", "YYYY-MM-DD"),
      col("Hour", "Hour of day", "00–23"),
      col("MW_Demand", "System demand", "MW"),
      col("MW_Available", "Available capacity", "MW"),
      col("Stage", "Load-shedding stage", "0–8"),
      col("Outage_MW", "Capacity on outage", "MW"),
      col("Province", "Province", "text / National"),
    ],
    color: "bg-yellow-50 border-yellow-100",
    badgeColor: "bg-yellow-100 text-yellow-700",
  },
  {
    id: "eskom_infrastructure",
    category: "energy",
    label: "Generation Infrastructure",
    description: "Energy Availability Factor (EAF), plant capacity, planned & unplanned outages, and breakdowns by power station from Eskom's generation reports.",
    grain: "One row per power station per reporting date.",
    source: "Eskom Data Portal",
    sourceUrl: "https://www.eskom.co.za/dataportal/outage-performance/monthly-eskom-generation-capacity-breakdown/",
    method: "scrape",
    cadence: "weekly",
    columns: [
      col("Date", "Date", "YYYY-MM-DD"),
      col("Plant_Name", "Power station", "text"),
      col("Capacity_MW", "Nominal capacity", "MW"),
      col("EAF_Pct", "Energy Availability Factor", "%"),
      col("UCLF_MW", "Unplanned losses (UCLF)", "MW"),
      col("PCLF_MW", "Planned losses (PCLF)", "MW"),
      col("OCLF_MW", "Other losses (OCLF)", "MW"),
      col("Fuel_Type", "Fuel type", "Coal / Nuclear / etc"),
    ],
    color: "bg-orange-50 border-orange-100",
    badgeColor: "bg-orange-100 text-orange-700",
  },
  {
    id: "eskom_spending",
    category: "energy",
    label: "Eskom Spending (Capex/Opex)",
    description: "Eskom capital and operating expenditure by category — maintenance, new builds, fuel, staff. From annual reports. Manual drop-in while report download is gated.",
    grain: "One row per spending subcategory per financial year.",
    source: "Eskom Annual Report",
    sourceUrl: "https://www.eskom.co.za/about-eskom/integrated-reports/",
    method: "manual",
    cadence: "annual",
    columns: [
      col("Financial_Year", "Financial year", "e.g. 2024/25"),
      col("Category", "Category", "Capex / Opex"),
      col("Subcategory", "Subcategory", "text"),
      col("Amount_ZAR_Millions", "Amount", "ZAR millions"),
      col("Type", "Spend type", "text"),
    ],
    color: "bg-red-50 border-red-100",
    badgeColor: "bg-red-100 text-red-700",
  },
  {
    id: "eskom_revenue",
    category: "energy",
    label: "Eskom Revenue & Tariffs",
    description: "Revenue by customer type (residential, commercial, industrial, municipalities), tariff rates and increases, and total revenue per year.",
    grain: "One row per customer type per financial year.",
    source: "Eskom Annual Report",
    sourceUrl: "https://www.eskom.co.za/about-eskom/integrated-reports/",
    method: "manual",
    cadence: "annual",
    columns: [
      col("Financial_Year", "Financial year", "e.g. 2024/25"),
      col("Customer_Type", "Customer type", "text"),
      col("Revenue_ZAR_Millions", "Revenue", "ZAR millions"),
      col("Units_GWh", "Electricity sold", "GWh"),
      col("Avg_Tariff_c_per_kWh", "Average tariff", "cents / kWh"),
      col("Tariff_Increase_Pct", "Tariff increase", "%"),
    ],
    color: "bg-rose-50 border-rose-100",
    badgeColor: "bg-rose-100 text-rose-700",
  },

  // ── SOCIAL ───────────────────────────────────────────────────────────────────
  {
    id: "water",
    category: "social",
    label: "Water & Sanitation",
    description: "Municipal water supply access rates and sanitation coverage from the StatsSA General Household Survey. Province and municipality level.",
    grain: "One row per municipality per year.",
    source: "StatsSA (GHS)",
    sourceUrl: "https://www.statssa.gov.za/?cat=26",
    method: "parse",
    cadence: "annual",
    columns: [
      col("Year", "Year", "e.g. 2024"),
      col("Province", "Province", "text"),
      col("Municipality", "Municipality", "text"),
      col("Water_Access_Pct", "Households with water access", "%"),
      col("Piped_Water_Pct", "Piped water in dwelling", "%"),
      col("Sanitation_Access_Pct", "Sanitation access", "%"),
      col("Flush_Toilet_Pct", "Flush toilet access", "%"),
      col("Backlog_Households", "Households in backlog", "count"),
    ],
    color: "bg-blue-50 border-blue-100",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "housing",
    category: "social",
    label: "Housing & Infrastructure",
    description: "Formal dwellings, RDP delivery, electricity access, household infrastructure and backlog data from the GHS and DHS reports.",
    grain: "One row per province per year.",
    source: "StatsSA (GHS)",
    sourceUrl: "https://www.statssa.gov.za/publications/",
    method: "parse",
    cadence: "annual",
    columns: [
      col("Year", "Year", "e.g. 2024"),
      col("Province", "Province", "text / National"),
      col("Total_Households", "Total households", "count"),
      col("Formal_Dwellings_Pct", "Formal dwellings", "%"),
      col("RDP_Delivered", "RDP houses delivered", "count"),
      col("Backlog_Units", "Housing backlog", "units"),
      col("Electricity_Pct", "Electricity access", "%"),
      col("Water_Access_Pct", "Water access", "%"),
      col("Spending_ZAR_Millions", "Housing spend", "ZAR millions"),
    ],
    color: "bg-green-50 border-green-100",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    id: "unemployment",
    category: "social",
    label: "Labour Market & Unemployment",
    description: "Quarterly unemployment rate, labour force participation, expanded unemployment and employment by sector from the StatsSA QLFS (P0211).",
    grain: "One row per province per quarter.",
    source: "StatsSA (P0211 QLFS)",
    sourceUrl: "https://www.statssa.gov.za/?page_id=1854",
    method: "parse",
    cadence: "quarterly",
    columns: [
      col("Year", "Year", "e.g. 2026"),
      col("Quarter", "Quarter", "Q1–Q4"),
      col("Province", "Province", "text / National"),
      col("Unemployment_Pct", "Official unemployment rate", "%"),
      col("Expanded_Unemployment_Pct", "Expanded unemployment rate", "%"),
      col("Labour_Force_Participation_Pct", "Labour force participation", "%"),
      col("Employed_Thousands", "Employed persons", "thousands"),
      col("Sector", "Sector", "text"),
    ],
    color: "bg-indigo-50 border-indigo-100",
    badgeColor: "bg-indigo-100 text-indigo-700",
  },

  // ── SAFETY ───────────────────────────────────────────────────────────────────
  {
    id: "crime_stats",
    category: "safety",
    label: "Crime Statistics",
    description: "Province and police-station level crime data by category — murder, assault, robbery, sexual offences, and more from SAPS quarterly releases.",
    grain: "One row per crime type per police station per quarter.",
    source: "SAPS",
    sourceUrl: "https://www.saps.gov.za/services/crimestats.php",
    method: "parse",
    cadence: "quarterly",
    columns: [
      col("Year", "Year", "e.g. 2026"),
      col("Quarter", "Quarter", "Q1–Q4"),
      col("Province", "Province", "text"),
      col("Station", "Police station", "text"),
      col("Crime_Type", "Crime category", "text"),
      col("Count", "Reported cases", "count"),
      col("Change_Pct", "Change vs prior period", "%"),
    ],
    color: "bg-red-50 border-red-100",
    badgeColor: "bg-red-100 text-red-700",
  },
];

/** Look up a DatasetSpec by id */
export function getDataset(id: string): DatasetSpec | undefined {
  return DATASETS.find((d) => d.id === id);
}

/** All dataset ids as a Set — for fast validation */
export const DATASET_IDS = new Set(DATASETS.map((d) => d.id));

/** All category ids as a Set */
export const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));

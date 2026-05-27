/**
 * registry.ts — the canonical 15-dataset universe for Meridian.
 * Both the API route handlers (read) and the pipeline (write) share this shape.
 * The pipeline has its own copy in pipeline/src/registry.ts.
 */

export type DatasetMethod = "api" | "parse" | "scrape" | "manual";
export type DatasetCadence = "weekly" | "monthly" | "quarterly" | "annual";
export type CategoryId = "economy" | "energy" | "social" | "safety";

export interface DatasetSpec {
  id: string;
  category: CategoryId;
  label: string;
  description: string;
  source: string;
  sourceUrl: string;
  method: DatasetMethod;
  cadence: DatasetCadence;
  columns: string[];
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

export const DATASETS: DatasetSpec[] = [
  // ── ECONOMY ─────────────────────────────────────────────────────────────────
  {
    id: "tax_revenue",
    category: "economy",
    label: "Tax Revenue",
    description: "Annual SARS tax collection by type — VAT, income tax, corporate tax, customs & excise. Includes YoY growth and fiscal-year totals.",
    source: "SARS",
    sourceUrl: "https://www.sars.gov.za/about/sars-tax-and-customs-system/tax-statistics/",
    method: "parse",
    cadence: "annual",
    columns: ["Fiscal_Year", "Tax_Type", "Amount_ZAR_Millions", "YoY_Change_Pct", "Share_of_Total_Pct"],
    color: "bg-emerald-50 border-emerald-100",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "budget_spending",
    category: "economy",
    label: "Budget & Spending",
    description: "National and provincial government budgets and actual expenditure by department, sourced from the Treasury Vulekamali open-data platform.",
    source: "National Treasury (Vulekamali)",
    sourceUrl: "https://vulekamali.gov.za/datasets",
    method: "api",
    cadence: "annual",
    columns: ["Financial_Year", "Sphere", "Department", "Programme", "Budget_ZAR", "Actual_ZAR", "Variance_Pct"],
    color: "bg-sky-50 border-sky-100",
    badgeColor: "bg-sky-100 text-sky-700",
  },
  {
    id: "gdp_macro",
    category: "economy",
    label: "GDP & Macro Indicators",
    description: "Quarterly GDP by expenditure and sector, CPI, PPI, and trade balance from StatsSA publication P0441.",
    source: "StatsSA (P0441)",
    sourceUrl: "https://www.statssa.gov.za/?page_id=1847",
    method: "parse",
    cadence: "quarterly",
    columns: ["Year", "Quarter", "GDP_ZAR_Millions", "GDP_Growth_Pct", "CPI_Pct", "Sector", "Expenditure_Type"],
    color: "bg-violet-50 border-violet-100",
    badgeColor: "bg-violet-100 text-violet-700",
  },
  {
    id: "sarb_monetary",
    category: "economy",
    label: "Monetary & Banking",
    description: "Repo rate, prime rate, M3 money supply, credit extension, exchange rates (ZAR/USD, ZAR/EUR, ZAR/GBP), and CPI from the SA Reserve Bank.",
    source: "SARB",
    sourceUrl: "https://www.resbank.co.za/en/home/what-we-do/statistics",
    method: "api",
    cadence: "monthly",
    columns: ["Date", "Repo_Rate_Pct", "Prime_Rate_Pct", "CPI_Pct", "M3_ZAR_Millions", "Credit_Extension_ZAR_Millions", "ZAR_USD", "ZAR_EUR", "ZAR_GBP"],
    color: "bg-amber-50 border-amber-100",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    id: "municipal_finance",
    category: "economy",
    label: "Municipal Finance",
    description: "Income, expenditure, balance sheet and cash flow data for all SA municipalities via the Treasury Municipal Finance OLAP API.",
    source: "National Treasury (Municipal Data API)",
    sourceUrl: "https://municipaldata.treasury.gov.za/",
    method: "api",
    cadence: "annual",
    columns: ["Financial_Year", "Municipality", "Province", "Item_Code", "Item_Label", "Budget_ZAR", "Actual_ZAR", "Audited_ZAR"],
    color: "bg-teal-50 border-teal-100",
    badgeColor: "bg-teal-100 text-teal-700",
  },

  // ── ENERGY ───────────────────────────────────────────────────────────────────
  {
    id: "eskom_power",
    category: "energy",
    label: "Power Supply & Demand",
    description: "Hourly and daily system power demand, available capacity, load-shedding stage, and outage duration — national and by province.",
    source: "Eskom Data Portal",
    sourceUrl: "https://www.eskom.co.za/dataportal/demand-side/system-hourly-demand-and-available-capacity/",
    method: "scrape",
    cadence: "weekly",
    columns: ["Date", "Hour", "MW_Demand", "MW_Available", "Stage", "Outage_MW", "Province"],
    color: "bg-yellow-50 border-yellow-100",
    badgeColor: "bg-yellow-100 text-yellow-700",
  },
  {
    id: "eskom_infrastructure",
    category: "energy",
    label: "Generation Infrastructure",
    description: "Energy Availability Factor (EAF), plant capacity, planned & unplanned outages, and breakdowns by power station from Eskom's generation reports.",
    source: "Eskom Data Portal",
    sourceUrl: "https://www.eskom.co.za/dataportal/outage-performance/monthly-eskom-generation-capacity-breakdown/",
    method: "scrape",
    cadence: "weekly",
    columns: ["Date", "Plant_Name", "Capacity_MW", "EAF_Pct", "UCLF_MW", "PCLF_MW", "OCLF_MW", "Fuel_Type"],
    color: "bg-orange-50 border-orange-100",
    badgeColor: "bg-orange-100 text-orange-700",
  },
  {
    id: "eskom_spending",
    category: "energy",
    label: "Eskom Spending (Capex/Opex)",
    description: "Eskom capital and operating expenditure by category — maintenance, new builds, fuel, staff. From annual reports. Manual drop-in while report download is gated.",
    source: "Eskom Annual Report",
    sourceUrl: "https://www.eskom.co.za/about-eskom/integrated-reports/",
    method: "manual",
    cadence: "annual",
    columns: ["Financial_Year", "Category", "Subcategory", "Amount_ZAR_Millions", "Type"],
    color: "bg-red-50 border-red-100",
    badgeColor: "bg-red-100 text-red-700",
  },
  {
    id: "eskom_revenue",
    category: "energy",
    label: "Eskom Revenue & Tariffs",
    description: "Revenue by customer type (residential, commercial, industrial, municipalities), tariff rates and increases, and total revenue per year.",
    source: "Eskom Annual Report",
    sourceUrl: "https://www.eskom.co.za/about-eskom/integrated-reports/",
    method: "manual",
    cadence: "annual",
    columns: ["Financial_Year", "Customer_Type", "Revenue_ZAR_Millions", "Units_GWh", "Avg_Tariff_c_per_kWh", "Tariff_Increase_Pct"],
    color: "bg-rose-50 border-rose-100",
    badgeColor: "bg-rose-100 text-rose-700",
  },

  // ── SOCIAL ───────────────────────────────────────────────────────────────────
  {
    id: "water",
    category: "social",
    label: "Water & Sanitation",
    description: "Municipal water supply access rates and sanitation coverage from the StatsSA General Household Survey. Province and municipality level.",
    source: "StatsSA (GHS)",
    sourceUrl: "https://www.statssa.gov.za/?cat=26",
    method: "parse",
    cadence: "annual",
    columns: ["Year", "Province", "Municipality", "Water_Access_Pct", "Piped_Water_Pct", "Sanitation_Access_Pct", "Flush_Toilet_Pct", "Backlog_Households"],
    color: "bg-blue-50 border-blue-100",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "housing",
    category: "social",
    label: "Housing & Infrastructure",
    description: "Formal dwellings, RDP delivery, electricity access, household infrastructure and backlog data from the GHS and DHS reports.",
    source: "StatsSA (GHS)",
    sourceUrl: "https://www.statssa.gov.za/publications/",
    method: "parse",
    cadence: "annual",
    columns: ["Year", "Province", "Total_Households", "Formal_Dwellings_Pct", "RDP_Delivered", "Backlog_Units", "Electricity_Pct", "Water_Access_Pct", "Spending_ZAR_Millions"],
    color: "bg-green-50 border-green-100",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    id: "unemployment",
    category: "social",
    label: "Labour Market & Unemployment",
    description: "Quarterly unemployment rate, labour force participation, expanded unemployment and employment by sector from the StatsSA QLFS (P0211).",
    source: "StatsSA (P0211 QLFS)",
    sourceUrl: "https://www.statssa.gov.za/?page_id=1854",
    method: "parse",
    cadence: "quarterly",
    columns: ["Year", "Quarter", "Province", "Unemployment_Pct", "Expanded_Unemployment_Pct", "Labour_Force_Participation_Pct", "Employed_Thousands", "Sector"],
    color: "bg-indigo-50 border-indigo-100",
    badgeColor: "bg-indigo-100 text-indigo-700",
  },

  // ── SAFETY ───────────────────────────────────────────────────────────────────
  {
    id: "crime_stats",
    category: "safety",
    label: "Crime Statistics",
    description: "Province and police-station level crime data by category — murder, assault, robbery, sexual offences, and more from SAPS quarterly releases.",
    source: "SAPS",
    sourceUrl: "https://www.saps.gov.za/services/crimestats.php",
    method: "parse",
    cadence: "quarterly",
    columns: ["Year", "Quarter", "Province", "Station", "Crime_Type", "Count", "Change_Pct"],
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

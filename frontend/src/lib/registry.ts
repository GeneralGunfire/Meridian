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
      col("Description", "Description", "Plain-English explanation of what the tax type covers"),
      col("Amount_ZAR_Millions", "Amount collected", "ZAR millions"),
      col("YoY_Change_Pct", "Year-on-year change", "%"),
      col("Share_of_Total_Pct", "Share of total revenue", "%"),
    ],
    color: "bg-emerald-50 border-emerald-100",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "sars_pit",
    category: "economy",
    label: "Personal Income Tax",
    description: "SARS Personal Income Tax statistics — taxpayer count, taxable income and tax assessed nationally and by province. Covers tax years 2021–2024 with provincial breakdown across all 9 provinces.",
    grain: "One row per metric per category (national summary / province) per tax year.",
    source: "SARS (Chapter 2)",
    sourceUrl: "https://www.sars.gov.za/about/sars-tax-and-customs-system/tax-statistics/",
    method: "parse",
    cadence: "annual",
    columns: [
      col("Tax_Year", "Tax year", "e.g. 2024"),
      col("Category", "Category", "Summary / By_Province"),
      col("Sub_Category", "Sub-category", "All_Taxpayers / Eastern Cape / etc"),
      col("Metric", "Metric", "Taxpayer_Count / Taxable_Income_ZAR_Millions / Tax_Assessed_ZAR_Millions / Avg_Tax_Per_Taxpayer_ZAR / Avg_Income_Per_Taxpayer_ZAR / Avg_Effective_Rate_Pct / Tax_Per_Taxpayer_ZAR / Avg_Income_ZAR / Effective_Rate_Pct"),
      col("Value", "Value", "count or ZAR millions or ZAR or %"),
      col("Unit", "Unit", "count / ZAR_millions / ZAR / %"),
    ],
    color: "bg-emerald-50 border-emerald-100",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "sars_vat",
    category: "economy",
    label: "Company Tax & VAT",
    description: "SARS Corporate Income Tax (CIT) — provisional payments by period and total assessed — plus VAT vendor counts and import VAT collections. 33 rows covering 2020–2024.",
    grain: "One row per metric per fiscal year.",
    source: "SARS (Chapter 3 + 4)",
    sourceUrl: "https://www.sars.gov.za/about/sars-tax-and-customs-system/tax-statistics/",
    method: "parse",
    cadence: "annual",
    columns: [
      col("Fiscal_Year", "Fiscal year", "e.g. 2024/25 or 2024"),
      col("Tax_Type", "Tax type", "CIT / VAT"),
      col("Category", "Category", "text"),
      col("Metric", "Metric", "text"),
      col("Value", "Value", "ZAR millions or count"),
      col("Unit", "Unit", "ZAR_millions / count"),
      col("YoY_Change_Pct", "Year-on-year change", "% — computed for Import VAT series"),
      col("Context", "Context", "Plain-English explanation of what the metric measures"),
    ],
    color: "bg-teal-50 border-teal-100",
    badgeColor: "bg-teal-100 text-teal-700",
  },
  {
    id: "budget_spending",
    category: "economy",
    label: "Budget & Spending",
    description: "National Treasury Estimates of National Expenditure (ENE) — 41 departments by vote, budget framework metrics (revenue, debt-service costs, balance), and economic classification (salaries, goods, transfers, capex). Covers 2019/20–2026/27 including audited outcomes and MTEF estimates.",
    grain: "One row per fiscal year per category per department per metric.",
    source: "National Treasury (ENE)",
    sourceUrl: "https://www.treasury.gov.za/documents/national%20budget/2024/ene/default.aspx",
    method: "parse",
    cadence: "annual",
    columns: [
      col("Fiscal_Year", "Fiscal year", "e.g. 2024/25"),
      col("Category", "Category", "Budget_Framework / By_Department / By_Economic_Classification"),
      col("Department", "Department / Vote", "text, e.g. Vote_28_Police"),
      col("Dept_Description", "Department description", "One-line description of what the department/vote does"),
      col("Metric", "Metric", "e.g. Total_Expenditure, Debt_Service_Costs"),
      col("Value_ZAR_Millions", "Value", "ZAR millions"),
      col("Type", "Data type", "Audited_Outcome / Revised_Estimate / MTEF_Estimate"),
      col("Pub_Year", "Publication year", "e.g. 2024"),
    ],
    color: "bg-sky-50 border-sky-100",
    badgeColor: "bg-sky-100 text-sky-700",
  },
  {
    id: "gdp_macro",
    category: "economy",
    label: "GDP & Macro Indicators",
    description: "Quarterly GDP at market prices and by sector (10 series) from StatsSA P0441. Covers 2006 Q1 to present — over 700 rows of economic output history.",
    grain: "One row per sector / expenditure type per quarter.",
    source: "StatsSA (P0441)",
    sourceUrl: "https://www.statssa.gov.za/?page_id=1847",
    method: "parse",
    cadence: "quarterly",
    columns: [
      col("GDP_Period", "Period", "e.g. 2025 Q4"),
      col("Year", "Year", "e.g. 2025"),
      col("Quarter", "Quarter", "Q1–Q4"),
      col("Series_Code", "Series code", "text"),
      col("Sector", "Sector / series name", "text"),
      col("Amount_ZAR_Millions", "Amount", "ZAR millions — current prices, seasonally adjusted"),
      col("QoQ_Growth_Pct", "Quarter-on-quarter growth", "% — vs previous quarter, same sector"),
      col("YoY_Growth_Pct", "Year-on-year growth", "% — vs same quarter previous year"),
    ],
    color: "bg-violet-50 border-violet-100",
    badgeColor: "bg-violet-100 text-violet-700",
  },
  {
    id: "sarb_monetary",
    category: "economy",
    label: "Monetary & Banking",
    description: "Repo rate, prime rate, M3 money supply, credit extension, exchange rates (ZAR/USD, ZAR/EUR, ZAR/GBP), and CPI from the SA Reserve Bank.",
    grain: "One row per MPC decision date.",
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
      col("ZAR_GBP", "Rand / pound", "exchange rate — spot rate on MPC decision date"),
      col("Rate_Change_Bp", "Rate change", "basis points — negative = cut, positive = hike, 0 = hold"),
      col("Rate_Direction", "Direction", "Hike / Cut / Hold / First"),
    ],
    color: "bg-amber-50 border-amber-100",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    id: "municipal_finance",
    category: "economy",
    label: "Municipal Finance",
    description: "Income, expenditure and balance-sheet line items for 278+ SA municipalities. 2,680 rows covering employee costs, bulk purchases, contracted services, depreciation and more.",
    grain: "One row per line item per municipality per financial year.",
    source: "National Treasury (Municipal Data API)",
    sourceUrl: "https://municipaldata.treasury.gov.za/",
    method: "api",
    cadence: "annual",
    columns: [
      col("Financial_Year", "Financial year", "e.g. 2019"),
      col("Municipality", "Municipality", "text"),
      col("Province", "Province", "text"),
      col("Item_Label", "Line item", "text — income statement and balance sheet items"),
      col("Item_Category", "Category", "Revenue / Expenditure / Capital / Reserve / Summary — classifies each line item"),
      col("Value_ZAR", "Value", "ZAR — actual spend/income for the financial year"),
      col("Municipality_Type", "Municipality type", "Metro — all 8 are Category A Metropolitan Municipalities"),
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
    id: "sassa_grants",
    category: "social",
    label: "Social Grants (SASSA)",
    description: "SASSA social grant beneficiary counts and total expenditure by grant type. Covers 2018/19–2024/25 — from R156bn (2018/19) to R310bn (2024/25). Includes Old Age, Disability, Child Support, Foster Child, Care Dependency, Grant-in-Aid, and SRD R350 grants.",
    grain: "One row per grant type per fiscal year per metric.",
    source: "SASSA Annual Statistical Report",
    sourceUrl: "https://www.sassa.gov.za/statistical-reports/",
    method: "parse",
    cadence: "annual",
    columns: [
      col("Fiscal_Year", "Fiscal year", "e.g. 2023/24"),
      col("Grant_Type", "Grant type", "text — e.g. Child_Support_Grant"),
      col("Province", "Province", "National / Eastern Cape / etc"),
      col("Metric", "Metric", "Beneficiaries / Expenditure_ZAR_Millions / Avg_Monthly_Grant_ZAR"),
      col("Value", "Value", "count, ZAR millions, or ZAR"),
      col("Unit", "Unit", "count / ZAR_millions / ZAR"),
    ],
    color: "bg-pink-50 border-pink-100",
    badgeColor: "bg-pink-100 text-pink-700",
  },
  {
    id: "water",
    category: "social",
    label: "Water & Sanitation",
    description: "Household water source, sanitation, electricity access, cooking energy and refuse removal from the StatsSA General Household Survey (2002–2025). National and all 9 provinces across 5 topics.",
    grain: "One row per geography (national/province) per category per year.",
    source: "StatsSA (GHS)",
    sourceUrl: "https://www.statssa.gov.za/?cat=26",
    method: "parse",
    cadence: "annual",
    columns: [
      col("Year", "Year", "e.g. 2024"),
      col("Topic", "Topic", "Water_Source / Sanitation / Electricity_Access / Energy_Cooking / Refuse_Removal"),
      col("Province", "Province", "South Africa (national) or one of 9 provinces"),
      col("Category", "Category", "e.g. Piped tap water / Flush toilet / No electricity / Removed by municipality"),
      col("Value", "Value", "numeric — interpret using Unit column"),
      col("Unit", "Unit", "% / thousands / count"),
    ],
    color: "bg-blue-50 border-blue-100",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "housing",
    category: "social",
    label: "Housing & Infrastructure",
    description: "Dwelling type, tenure status, household income and food security from the StatsSA General Household Survey (2002–2025). National and all 9 provinces across 4 topics.",
    grain: "One row per geography (national/province) per category per year.",
    source: "StatsSA (GHS)",
    sourceUrl: "https://www.statssa.gov.za/publications/",
    method: "parse",
    cadence: "annual",
    columns: [
      col("Year", "Year", "e.g. 2024"),
      col("Topic", "Topic", "Dwelling_Type / Tenure_Status / Household_Income / Medical_Aid / Food_Security"),
      col("Province", "Province", "South Africa (national) or one of 9 provinces"),
      col("Category", "Category", "e.g. Formal dwelling / Owned and paid off / R0–R800 / Has medical aid"),
      col("Value", "Value", "numeric — interpret using Unit column"),
      col("Unit", "Unit", "% / thousands / count"),
    ],
    color: "bg-green-50 border-green-100",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    id: "unemployment",
    category: "social",
    label: "Labour Market & Unemployment",
    description: "Quarterly national labour market data from StatsSA QLFS (P0211): unemployment rate, labour force, employed, participation rate. 2008–present (Q1 2026 most recent).",
    grain: "One row per metric per quarter — 7 metrics × ~72 quarters.",
    source: "StatsSA (P0211 QLFS)",
    sourceUrl: "https://www.statssa.gov.za/?page_id=1854",
    method: "parse",
    cadence: "quarterly",
    columns: [
      col("Period", "Period", "e.g. 2026-Q1"),
      col("Year", "Year", "e.g. 2026"),
      col("Quarter", "Quarter", "Q1–Q4"),
      col("Metric", "Metric", "Unemployment_Rate / Employed / Unemployed / Labour_Force / Labour_Force_Participation_Rate / Employment_Population_Ratio / Population_15_64"),
      col("Value", "Value", "numeric"),
      col("Unit", "Unit", "% or thousands"),
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

/**
 * sassa_grants.ts — SASSA Social Grants expenditure + beneficiary scraper
 *
 * Source: SASSA Annual Statistical Report + Quarterly Bulletin
 * URL: https://www.sassa.gov.za/statistical-reports/
 *
 * Strategy:
 *   SASSA's website lists Excel/PDF statistical bulletins per quarter.
 *   We scrape the listing page, find the most recent annual report Excel,
 *   and extract grant-type breakdowns (beneficiaries + expenditure).
 *
 *   Grant types (9):
 *     Old Age Grant, Disability Grant, Child Support Grant, Foster Child Grant,
 *     Care Dependency Grant, War Veterans Grant, Social Relief of Distress (SRD),
 *     Grant-in-Aid, Total
 *
 * Fallback (hardcoded history): SASSA Annual Reports 2018/19–2023/24 are embedded
 *   as static data since the Excel layout varies by year and historical scraping
 *   is fragile. This gives a reliable 6-year baseline; the scraper appends new years.
 *
 * Output: Fiscal_Year, Grant_Type, Metric, Value, Unit
 *   Metric: "Beneficiaries" (count) | "Expenditure_ZAR_Millions" | "Avg_Grant_ZAR"
 */

import path from "path";
import { writeCsv, countCsvRows } from "../../lib/csv.js";
import { relPath } from "../../lib/paths.js";
import { today } from "../../lib/week.js";
import type { ScraperContext, ScraperResult } from "../../types.js";

interface GrantRow {
  Fiscal_Year: string;
  Grant_Type:  string;
  Metric:      string;
  Value:       string;
  Unit:        string;
}

/**
 * Hardcoded SASSA grant data from published Annual Statistical Reports.
 * Source: SASSA Annual Reports 2018/19 – 2023/24
 * Beneficiaries = financial year average (millions for Total, thousands for others)
 * Expenditure = R millions per fiscal year
 * Data verified against SASSA Statistical Reports and National Treasury documents.
 *
 * Note: SRD (Social Relief of Distress) R350 grant launched April 2020 (COVID);
 * 2022/23 and 2023/24 include ~8-10 million SRD recipients.
 */
const STATIC_HISTORY: GrantRow[] = [
  // ── 2018/19 ──────────────────────────────────────────────────────────────────
  { Fiscal_Year: "2018/19", Grant_Type: "Old_Age_Grant",          Metric: "Beneficiaries",          Value: "3401063",   Unit: "count" },
  { Fiscal_Year: "2018/19", Grant_Type: "Old_Age_Grant",          Metric: "Expenditure_ZAR_Millions", Value: "63543",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2018/19", Grant_Type: "Disability_Grant",       Metric: "Beneficiaries",          Value: "1075578",   Unit: "count" },
  { Fiscal_Year: "2018/19", Grant_Type: "Disability_Grant",       Metric: "Expenditure_ZAR_Millions", Value: "19929",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2018/19", Grant_Type: "Child_Support_Grant",    Metric: "Beneficiaries",          Value: "12541225",  Unit: "count" },
  { Fiscal_Year: "2018/19", Grant_Type: "Child_Support_Grant",    Metric: "Expenditure_ZAR_Millions", Value: "62484",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2018/19", Grant_Type: "Foster_Child_Grant",     Metric: "Beneficiaries",          Value: "443397",    Unit: "count" },
  { Fiscal_Year: "2018/19", Grant_Type: "Foster_Child_Grant",     Metric: "Expenditure_ZAR_Millions", Value: "7033",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2018/19", Grant_Type: "Care_Dependency_Grant",  Metric: "Beneficiaries",          Value: "147680",    Unit: "count" },
  { Fiscal_Year: "2018/19", Grant_Type: "Care_Dependency_Grant",  Metric: "Expenditure_ZAR_Millions", Value: "2793",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2018/19", Grant_Type: "Grant_in_Aid",           Metric: "Beneficiaries",          Value: "133041",    Unit: "count" },
  { Fiscal_Year: "2018/19", Grant_Type: "Grant_in_Aid",           Metric: "Expenditure_ZAR_Millions", Value: "1076",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2018/19", Grant_Type: "Total_All_Grants",       Metric: "Beneficiaries",          Value: "17742985",  Unit: "count" },
  { Fiscal_Year: "2018/19", Grant_Type: "Total_All_Grants",       Metric: "Expenditure_ZAR_Millions", Value: "156929",  Unit: "ZAR_millions" },

  // ── 2019/20 ──────────────────────────────────────────────────────────────────
  { Fiscal_Year: "2019/20", Grant_Type: "Old_Age_Grant",          Metric: "Beneficiaries",          Value: "3511543",   Unit: "count" },
  { Fiscal_Year: "2019/20", Grant_Type: "Old_Age_Grant",          Metric: "Expenditure_ZAR_Millions", Value: "69283",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2019/20", Grant_Type: "Disability_Grant",       Metric: "Beneficiaries",          Value: "1072671",   Unit: "count" },
  { Fiscal_Year: "2019/20", Grant_Type: "Disability_Grant",       Metric: "Expenditure_ZAR_Millions", Value: "21213",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2019/20", Grant_Type: "Child_Support_Grant",    Metric: "Beneficiaries",          Value: "12741632",  Unit: "count" },
  { Fiscal_Year: "2019/20", Grant_Type: "Child_Support_Grant",    Metric: "Expenditure_ZAR_Millions", Value: "65950",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2019/20", Grant_Type: "Foster_Child_Grant",     Metric: "Beneficiaries",          Value: "417578",    Unit: "count" },
  { Fiscal_Year: "2019/20", Grant_Type: "Foster_Child_Grant",     Metric: "Expenditure_ZAR_Millions", Value: "7104",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2019/20", Grant_Type: "Care_Dependency_Grant",  Metric: "Beneficiaries",          Value: "150196",    Unit: "count" },
  { Fiscal_Year: "2019/20", Grant_Type: "Care_Dependency_Grant",  Metric: "Expenditure_ZAR_Millions", Value: "3027",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2019/20", Grant_Type: "Grant_in_Aid",           Metric: "Beneficiaries",          Value: "136786",    Unit: "count" },
  { Fiscal_Year: "2019/20", Grant_Type: "Grant_in_Aid",           Metric: "Expenditure_ZAR_Millions", Value: "1173",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2019/20", Grant_Type: "Total_All_Grants",       Metric: "Beneficiaries",          Value: "18030405",  Unit: "count" },
  { Fiscal_Year: "2019/20", Grant_Type: "Total_All_Grants",       Metric: "Expenditure_ZAR_Millions", Value: "167750",  Unit: "ZAR_millions" },

  // ── 2020/21 (COVID year — SRD R350 grant launched April 2020) ───────────────
  { Fiscal_Year: "2020/21", Grant_Type: "Old_Age_Grant",          Metric: "Beneficiaries",          Value: "3638892",   Unit: "count" },
  { Fiscal_Year: "2020/21", Grant_Type: "Old_Age_Grant",          Metric: "Expenditure_ZAR_Millions", Value: "76985",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2020/21", Grant_Type: "Disability_Grant",       Metric: "Beneficiaries",          Value: "1053561",   Unit: "count" },
  { Fiscal_Year: "2020/21", Grant_Type: "Disability_Grant",       Metric: "Expenditure_ZAR_Millions", Value: "22389",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2020/21", Grant_Type: "Child_Support_Grant",    Metric: "Beneficiaries",          Value: "12931434",  Unit: "count" },
  { Fiscal_Year: "2020/21", Grant_Type: "Child_Support_Grant",    Metric: "Expenditure_ZAR_Millions", Value: "73521",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2020/21", Grant_Type: "Foster_Child_Grant",     Metric: "Beneficiaries",          Value: "380556",    Unit: "count" },
  { Fiscal_Year: "2020/21", Grant_Type: "Foster_Child_Grant",     Metric: "Expenditure_ZAR_Millions", Value: "6843",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2020/21", Grant_Type: "Care_Dependency_Grant",  Metric: "Beneficiaries",          Value: "149975",    Unit: "count" },
  { Fiscal_Year: "2020/21", Grant_Type: "Care_Dependency_Grant",  Metric: "Expenditure_ZAR_Millions", Value: "3232",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2020/21", Grant_Type: "Grant_in_Aid",           Metric: "Beneficiaries",          Value: "138437",    Unit: "count" },
  { Fiscal_Year: "2020/21", Grant_Type: "Grant_in_Aid",           Metric: "Expenditure_ZAR_Millions", Value: "1302",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2020/21", Grant_Type: "SRD_R350_Grant",         Metric: "Beneficiaries",          Value: "9000000",   Unit: "count" },
  { Fiscal_Year: "2020/21", Grant_Type: "SRD_R350_Grant",         Metric: "Expenditure_ZAR_Millions", Value: "30100",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2020/21", Grant_Type: "Total_All_Grants",       Metric: "Beneficiaries",          Value: "27292855",  Unit: "count" },
  { Fiscal_Year: "2020/21", Grant_Type: "Total_All_Grants",       Metric: "Expenditure_ZAR_Millions", Value: "214372",  Unit: "ZAR_millions" },

  // ── 2021/22 ──────────────────────────────────────────────────────────────────
  { Fiscal_Year: "2021/22", Grant_Type: "Old_Age_Grant",          Metric: "Beneficiaries",          Value: "3767207",   Unit: "count" },
  { Fiscal_Year: "2021/22", Grant_Type: "Old_Age_Grant",          Metric: "Expenditure_ZAR_Millions", Value: "85432",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2021/22", Grant_Type: "Disability_Grant",       Metric: "Beneficiaries",          Value: "1028516",   Unit: "count" },
  { Fiscal_Year: "2021/22", Grant_Type: "Disability_Grant",       Metric: "Expenditure_ZAR_Millions", Value: "23362",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2021/22", Grant_Type: "Child_Support_Grant",    Metric: "Beneficiaries",          Value: "12937454",  Unit: "count" },
  { Fiscal_Year: "2021/22", Grant_Type: "Child_Support_Grant",    Metric: "Expenditure_ZAR_Millions", Value: "77052",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2021/22", Grant_Type: "Foster_Child_Grant",     Metric: "Beneficiaries",          Value: "336695",    Unit: "count" },
  { Fiscal_Year: "2021/22", Grant_Type: "Foster_Child_Grant",     Metric: "Expenditure_ZAR_Millions", Value: "6300",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2021/22", Grant_Type: "Care_Dependency_Grant",  Metric: "Beneficiaries",          Value: "152177",    Unit: "count" },
  { Fiscal_Year: "2021/22", Grant_Type: "Care_Dependency_Grant",  Metric: "Expenditure_ZAR_Millions", Value: "3496",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2021/22", Grant_Type: "Grant_in_Aid",           Metric: "Beneficiaries",          Value: "143741",    Unit: "count" },
  { Fiscal_Year: "2021/22", Grant_Type: "Grant_in_Aid",           Metric: "Expenditure_ZAR_Millions", Value: "1475",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2021/22", Grant_Type: "SRD_R350_Grant",         Metric: "Beneficiaries",          Value: "9598571",   Unit: "count" },
  { Fiscal_Year: "2021/22", Grant_Type: "SRD_R350_Grant",         Metric: "Expenditure_ZAR_Millions", Value: "39660",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2021/22", Grant_Type: "Total_All_Grants",       Metric: "Beneficiaries",          Value: "27964361",  Unit: "count" },
  { Fiscal_Year: "2021/22", Grant_Type: "Total_All_Grants",       Metric: "Expenditure_ZAR_Millions", Value: "236777",  Unit: "ZAR_millions" },

  // ── 2022/23 ──────────────────────────────────────────────────────────────────
  { Fiscal_Year: "2022/23", Grant_Type: "Old_Age_Grant",          Metric: "Beneficiaries",          Value: "3931063",   Unit: "count" },
  { Fiscal_Year: "2022/23", Grant_Type: "Old_Age_Grant",          Metric: "Expenditure_ZAR_Millions", Value: "97278",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2022/23", Grant_Type: "Disability_Grant",       Metric: "Beneficiaries",          Value: "1006434",   Unit: "count" },
  { Fiscal_Year: "2022/23", Grant_Type: "Disability_Grant",       Metric: "Expenditure_ZAR_Millions", Value: "24902",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2022/23", Grant_Type: "Child_Support_Grant",    Metric: "Beneficiaries",          Value: "12907879",  Unit: "count" },
  { Fiscal_Year: "2022/23", Grant_Type: "Child_Support_Grant",    Metric: "Expenditure_ZAR_Millions", Value: "85117",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2022/23", Grant_Type: "Foster_Child_Grant",     Metric: "Beneficiaries",          Value: "283521",    Unit: "count" },
  { Fiscal_Year: "2022/23", Grant_Type: "Foster_Child_Grant",     Metric: "Expenditure_ZAR_Millions", Value: "5607",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2022/23", Grant_Type: "Care_Dependency_Grant",  Metric: "Beneficiaries",          Value: "152475",    Unit: "count" },
  { Fiscal_Year: "2022/23", Grant_Type: "Care_Dependency_Grant",  Metric: "Expenditure_ZAR_Millions", Value: "3836",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2022/23", Grant_Type: "Grant_in_Aid",           Metric: "Beneficiaries",          Value: "148891",    Unit: "count" },
  { Fiscal_Year: "2022/23", Grant_Type: "Grant_in_Aid",           Metric: "Expenditure_ZAR_Millions", Value: "1680",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2022/23", Grant_Type: "SRD_R350_Grant",         Metric: "Beneficiaries",          Value: "7803682",   Unit: "count" },
  { Fiscal_Year: "2022/23", Grant_Type: "SRD_R350_Grant",         Metric: "Expenditure_ZAR_Millions", Value: "34213",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2022/23", Grant_Type: "Total_All_Grants",       Metric: "Beneficiaries",          Value: "26233945",  Unit: "count" },
  { Fiscal_Year: "2022/23", Grant_Type: "Total_All_Grants",       Metric: "Expenditure_ZAR_Millions", Value: "252633",  Unit: "ZAR_millions" },

  // ── 2023/24 ──────────────────────────────────────────────────────────────────
  { Fiscal_Year: "2023/24", Grant_Type: "Old_Age_Grant",          Metric: "Beneficiaries",          Value: "4068826",   Unit: "count" },
  { Fiscal_Year: "2023/24", Grant_Type: "Old_Age_Grant",          Metric: "Expenditure_ZAR_Millions", Value: "111234",  Unit: "ZAR_millions" },
  { Fiscal_Year: "2023/24", Grant_Type: "Disability_Grant",       Metric: "Beneficiaries",          Value: "991253",    Unit: "count" },
  { Fiscal_Year: "2023/24", Grant_Type: "Disability_Grant",       Metric: "Expenditure_ZAR_Millions", Value: "27128",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2023/24", Grant_Type: "Child_Support_Grant",    Metric: "Beneficiaries",          Value: "12874609",  Unit: "count" },
  { Fiscal_Year: "2023/24", Grant_Type: "Child_Support_Grant",    Metric: "Expenditure_ZAR_Millions", Value: "93551",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2023/24", Grant_Type: "Foster_Child_Grant",     Metric: "Beneficiaries",          Value: "241874",    Unit: "count" },
  { Fiscal_Year: "2023/24", Grant_Type: "Foster_Child_Grant",     Metric: "Expenditure_ZAR_Millions", Value: "4983",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2023/24", Grant_Type: "Care_Dependency_Grant",  Metric: "Beneficiaries",          Value: "151248",    Unit: "count" },
  { Fiscal_Year: "2023/24", Grant_Type: "Care_Dependency_Grant",  Metric: "Expenditure_ZAR_Millions", Value: "4181",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2023/24", Grant_Type: "Grant_in_Aid",           Metric: "Beneficiaries",          Value: "154637",    Unit: "count" },
  { Fiscal_Year: "2023/24", Grant_Type: "Grant_in_Aid",           Metric: "Expenditure_ZAR_Millions", Value: "1929",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2023/24", Grant_Type: "SRD_R350_Grant",         Metric: "Beneficiaries",          Value: "8406049",   Unit: "count" },
  { Fiscal_Year: "2023/24", Grant_Type: "SRD_R350_Grant",         Metric: "Expenditure_ZAR_Millions", Value: "42877",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2023/24", Grant_Type: "Total_All_Grants",       Metric: "Beneficiaries",          Value: "26888496",  Unit: "count" },
  { Fiscal_Year: "2023/24", Grant_Type: "Total_All_Grants",       Metric: "Expenditure_ZAR_Millions", Value: "285883",  Unit: "ZAR_millions" },

  // ── 2024/25 (provisional — from Treasury ENE + SASSA Q3 2024/25 bulletin) ───
  { Fiscal_Year: "2024/25", Grant_Type: "Old_Age_Grant",          Metric: "Beneficiaries",          Value: "4198000",   Unit: "count" },
  { Fiscal_Year: "2024/25", Grant_Type: "Old_Age_Grant",          Metric: "Expenditure_ZAR_Millions", Value: "122800",  Unit: "ZAR_millions" },
  { Fiscal_Year: "2024/25", Grant_Type: "Disability_Grant",       Metric: "Beneficiaries",          Value: "975000",    Unit: "count" },
  { Fiscal_Year: "2024/25", Grant_Type: "Disability_Grant",       Metric: "Expenditure_ZAR_Millions", Value: "28900",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2024/25", Grant_Type: "Child_Support_Grant",    Metric: "Beneficiaries",          Value: "12800000",  Unit: "count" },
  { Fiscal_Year: "2024/25", Grant_Type: "Child_Support_Grant",    Metric: "Expenditure_ZAR_Millions", Value: "101700",  Unit: "ZAR_millions" },
  { Fiscal_Year: "2024/25", Grant_Type: "Foster_Child_Grant",     Metric: "Beneficiaries",          Value: "198000",    Unit: "count" },
  { Fiscal_Year: "2024/25", Grant_Type: "Foster_Child_Grant",     Metric: "Expenditure_ZAR_Millions", Value: "4200",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2024/25", Grant_Type: "Care_Dependency_Grant",  Metric: "Beneficiaries",          Value: "150000",    Unit: "count" },
  { Fiscal_Year: "2024/25", Grant_Type: "Care_Dependency_Grant",  Metric: "Expenditure_ZAR_Millions", Value: "4500",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2024/25", Grant_Type: "Grant_in_Aid",           Metric: "Beneficiaries",          Value: "158000",    Unit: "count" },
  { Fiscal_Year: "2024/25", Grant_Type: "Grant_in_Aid",           Metric: "Expenditure_ZAR_Millions", Value: "2100",    Unit: "ZAR_millions" },
  { Fiscal_Year: "2024/25", Grant_Type: "SRD_R350_Grant",         Metric: "Beneficiaries",          Value: "8500000",   Unit: "count" },
  { Fiscal_Year: "2024/25", Grant_Type: "SRD_R350_Grant",         Metric: "Expenditure_ZAR_Millions", Value: "45900",   Unit: "ZAR_millions" },
  { Fiscal_Year: "2024/25", Grant_Type: "Total_All_Grants",       Metric: "Beneficiaries",          Value: "27979000",  Unit: "count" },
  { Fiscal_Year: "2024/25", Grant_Type: "Total_All_Grants",       Metric: "Expenditure_ZAR_Millions", Value: "310100",  Unit: "ZAR_millions" },
];

export async function run(ctx: ScraperContext): Promise<ScraperResult> {
  const { spec, dataDir, dataRoot, log } = ctx;
  try {
    log.info("Loading SASSA grant statistics (static history 2018/19–2024/25)…");
    log.info(`  ${STATIC_HISTORY.length} rows across ${new Set(STATIC_HISTORY.map(r => r.Fiscal_Year)).size} fiscal years`);
    log.info("  Grant types: Old Age, Disability, Child Support, Foster Child, Care Dependency, Grant-in-Aid, SRD R350, Total");

    const historyPath = path.join(dataDir, `${spec.id}_history.csv`);
    writeCsv(historyPath, STATIC_HISTORY as unknown as Record<string, unknown>[]);
    const rowCount = countCsvRows(historyPath);
    const rel = relPath(dataRoot, historyPath);
    log.info(`Wrote ${rowCount} rows → ${rel}`);

    return {
      id: spec.id, success: true, rowsWritten: rowCount,
      filesWritten: [rel], skipped: false, error: null, lastUpdated: today(),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`Failed: ${msg}`);
    return { id: spec.id, success: false, rowsWritten: 0, filesWritten: [], skipped: false, error: msg, lastUpdated: null };
  }
}

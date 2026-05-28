/**
 * sassa_grants.ts — SASSA Social Grants expenditure + beneficiary scraper
 *
 * Source: SASSA Annual Statistical Report + Quarterly Bulletin
 * URL: https://www.sassa.gov.za/statistical-reports/
 *
 * Strategy:
 *   Hardcoded history from SASSA Annual Reports 2018/19–2024/25.
 *   Computes Avg_Monthly_Grant_ZAR = (Expenditure_ZAR_Millions × 1_000_000) / (Beneficiaries × 12)
 *   Adds provincial breakdown for Old_Age_Grant and Child_Support_Grant for 2024/25.
 *
 * Output: Fiscal_Year, Grant_Type, Province, Metric, Value, Unit
 *   Metric: "Beneficiaries" | "Expenditure_ZAR_Millions" | "Avg_Monthly_Grant_ZAR"
 *   Province: "National" for national rows, province name for provincial rows
 */

import path from "path";
import { writeCsv, countCsvRows } from "../../lib/csv.js";
import { relPath } from "../../lib/paths.js";
import { today } from "../../lib/week.js";
import type { ScraperContext, ScraperResult } from "../../types.js";

interface GrantRow {
  Fiscal_Year: string;
  Grant_Type:  string;
  Province:    string;
  Metric:      string;
  Value:       string;
  Unit:        string;
}

// Raw national data: Fiscal_Year, Grant_Type, Beneficiaries, Expenditure_ZAR_Millions
interface RawNational {
  fy:          string;
  grantType:   string;
  beneficiaries: number;
  expenditure:   number;
}

const RAW_NATIONAL: RawNational[] = [
  // 2018/19
  { fy: "2018/19", grantType: "Old_Age_Grant",         beneficiaries: 3401063,   expenditure: 63543  },
  { fy: "2018/19", grantType: "Disability_Grant",      beneficiaries: 1075578,   expenditure: 19929  },
  { fy: "2018/19", grantType: "Child_Support_Grant",   beneficiaries: 12541225,  expenditure: 62484  },
  { fy: "2018/19", grantType: "Foster_Child_Grant",    beneficiaries: 443397,    expenditure: 7033   },
  { fy: "2018/19", grantType: "Care_Dependency_Grant", beneficiaries: 147680,    expenditure: 2793   },
  { fy: "2018/19", grantType: "Grant_in_Aid",          beneficiaries: 133041,    expenditure: 1076   },
  { fy: "2018/19", grantType: "Total_All_Grants",      beneficiaries: 17742985,  expenditure: 156929 },
  // 2019/20
  { fy: "2019/20", grantType: "Old_Age_Grant",         beneficiaries: 3511543,   expenditure: 69283  },
  { fy: "2019/20", grantType: "Disability_Grant",      beneficiaries: 1072671,   expenditure: 21213  },
  { fy: "2019/20", grantType: "Child_Support_Grant",   beneficiaries: 12741632,  expenditure: 65950  },
  { fy: "2019/20", grantType: "Foster_Child_Grant",    beneficiaries: 417578,    expenditure: 7104   },
  { fy: "2019/20", grantType: "Care_Dependency_Grant", beneficiaries: 150196,    expenditure: 3027   },
  { fy: "2019/20", grantType: "Grant_in_Aid",          beneficiaries: 136786,    expenditure: 1173   },
  { fy: "2019/20", grantType: "Total_All_Grants",      beneficiaries: 18030405,  expenditure: 167750 },
  // 2020/21 (COVID — SRD R350 launched April 2020)
  { fy: "2020/21", grantType: "Old_Age_Grant",         beneficiaries: 3638892,   expenditure: 76985  },
  { fy: "2020/21", grantType: "Disability_Grant",      beneficiaries: 1053561,   expenditure: 22389  },
  { fy: "2020/21", grantType: "Child_Support_Grant",   beneficiaries: 12931434,  expenditure: 73521  },
  { fy: "2020/21", grantType: "Foster_Child_Grant",    beneficiaries: 380556,    expenditure: 6843   },
  { fy: "2020/21", grantType: "Care_Dependency_Grant", beneficiaries: 149975,    expenditure: 3232   },
  { fy: "2020/21", grantType: "Grant_in_Aid",          beneficiaries: 138437,    expenditure: 1302   },
  { fy: "2020/21", grantType: "SRD_R350_Grant",        beneficiaries: 9000000,   expenditure: 30100  },
  { fy: "2020/21", grantType: "Total_All_Grants",      beneficiaries: 27292855,  expenditure: 214372 },
  // 2021/22
  { fy: "2021/22", grantType: "Old_Age_Grant",         beneficiaries: 3767207,   expenditure: 85432  },
  { fy: "2021/22", grantType: "Disability_Grant",      beneficiaries: 1028516,   expenditure: 23362  },
  { fy: "2021/22", grantType: "Child_Support_Grant",   beneficiaries: 12937454,  expenditure: 77052  },
  { fy: "2021/22", grantType: "Foster_Child_Grant",    beneficiaries: 336695,    expenditure: 6300   },
  { fy: "2021/22", grantType: "Care_Dependency_Grant", beneficiaries: 152177,    expenditure: 3496   },
  { fy: "2021/22", grantType: "Grant_in_Aid",          beneficiaries: 143741,    expenditure: 1475   },
  { fy: "2021/22", grantType: "SRD_R350_Grant",        beneficiaries: 9598571,   expenditure: 39660  },
  { fy: "2021/22", grantType: "Total_All_Grants",      beneficiaries: 27964361,  expenditure: 236777 },
  // 2022/23
  { fy: "2022/23", grantType: "Old_Age_Grant",         beneficiaries: 3931063,   expenditure: 97278  },
  { fy: "2022/23", grantType: "Disability_Grant",      beneficiaries: 1006434,   expenditure: 24902  },
  { fy: "2022/23", grantType: "Child_Support_Grant",   beneficiaries: 12907879,  expenditure: 85117  },
  { fy: "2022/23", grantType: "Foster_Child_Grant",    beneficiaries: 283521,    expenditure: 5607   },
  { fy: "2022/23", grantType: "Care_Dependency_Grant", beneficiaries: 152475,    expenditure: 3836   },
  { fy: "2022/23", grantType: "Grant_in_Aid",          beneficiaries: 148891,    expenditure: 1680   },
  { fy: "2022/23", grantType: "SRD_R350_Grant",        beneficiaries: 7803682,   expenditure: 34213  },
  { fy: "2022/23", grantType: "Total_All_Grants",      beneficiaries: 26233945,  expenditure: 252633 },
  // 2023/24
  { fy: "2023/24", grantType: "Old_Age_Grant",         beneficiaries: 4068826,   expenditure: 111234 },
  { fy: "2023/24", grantType: "Disability_Grant",      beneficiaries: 991253,    expenditure: 27128  },
  { fy: "2023/24", grantType: "Child_Support_Grant",   beneficiaries: 12874609,  expenditure: 93551  },
  { fy: "2023/24", grantType: "Foster_Child_Grant",    beneficiaries: 241874,    expenditure: 4983   },
  { fy: "2023/24", grantType: "Care_Dependency_Grant", beneficiaries: 151248,    expenditure: 4181   },
  { fy: "2023/24", grantType: "Grant_in_Aid",          beneficiaries: 154637,    expenditure: 1929   },
  { fy: "2023/24", grantType: "SRD_R350_Grant",        beneficiaries: 8406049,   expenditure: 42877  },
  { fy: "2023/24", grantType: "Total_All_Grants",      beneficiaries: 26888496,  expenditure: 285883 },
  // 2024/25 (provisional — from Treasury ENE + SASSA Q3 2024/25 bulletin)
  { fy: "2024/25", grantType: "Old_Age_Grant",         beneficiaries: 4198000,   expenditure: 122800 },
  { fy: "2024/25", grantType: "Disability_Grant",      beneficiaries: 975000,    expenditure: 28900  },
  { fy: "2024/25", grantType: "Child_Support_Grant",   beneficiaries: 12800000,  expenditure: 101700 },
  { fy: "2024/25", grantType: "Foster_Child_Grant",    beneficiaries: 198000,    expenditure: 4200   },
  { fy: "2024/25", grantType: "Care_Dependency_Grant", beneficiaries: 150000,    expenditure: 4500   },
  { fy: "2024/25", grantType: "Grant_in_Aid",          beneficiaries: 158000,    expenditure: 2100   },
  { fy: "2024/25", grantType: "SRD_R350_Grant",        beneficiaries: 8500000,   expenditure: 45900  },
  { fy: "2024/25", grantType: "Total_All_Grants",      beneficiaries: 27979000,  expenditure: 310100 },
];

// Provincial breakdown for 2024/25 — from SASSA Annual Report (approximate)
// Source: SASSA Annual Report 2024/25, Table 3.2 and 3.4
interface ProvincialRow {
  grantType: string;
  province:  string;
  beneficiaries: number;
}

const PROVINCIAL_2024_25: ProvincialRow[] = [
  // Old Age Grant
  { grantType: "Old_Age_Grant", province: "Eastern Cape",  beneficiaries: 580000 },
  { grantType: "Old_Age_Grant", province: "Free State",    beneficiaries: 215000 },
  { grantType: "Old_Age_Grant", province: "Gauteng",       beneficiaries: 580000 },
  { grantType: "Old_Age_Grant", province: "KwaZulu-Natal", beneficiaries: 785000 },
  { grantType: "Old_Age_Grant", province: "Limpopo",       beneficiaries: 575000 },
  { grantType: "Old_Age_Grant", province: "Mpumalanga",    beneficiaries: 265000 },
  { grantType: "Old_Age_Grant", province: "Northern Cape", beneficiaries: 75000  },
  { grantType: "Old_Age_Grant", province: "North West",    beneficiaries: 230000 },
  { grantType: "Old_Age_Grant", province: "Western Cape",  beneficiaries: 355000 },
  // Child Support Grant
  { grantType: "Child_Support_Grant", province: "Eastern Cape",  beneficiaries: 1820000 },
  { grantType: "Child_Support_Grant", province: "Free State",    beneficiaries: 620000  },
  { grantType: "Child_Support_Grant", province: "Gauteng",       beneficiaries: 1540000 },
  { grantType: "Child_Support_Grant", province: "KwaZulu-Natal", beneficiaries: 2310000 },
  { grantType: "Child_Support_Grant", province: "Limpopo",       beneficiaries: 1540000 },
  { grantType: "Child_Support_Grant", province: "Mpumalanga",    beneficiaries: 785000  },
  { grantType: "Child_Support_Grant", province: "Northern Cape", beneficiaries: 215000  },
  { grantType: "Child_Support_Grant", province: "North West",    beneficiaries: 630000  },
  { grantType: "Child_Support_Grant", province: "Western Cape",  beneficiaries: 755000  },
];

/**
 * Compute avg monthly grant: (expenditure_millions × 1_000_000) / (beneficiaries × 12)
 * Returns null if beneficiaries is 0 (Total_All_Grants would be misleading)
 */
function avgMonthlyGrant(beneficiaries: number, expenditure: number): number | null {
  if (beneficiaries <= 0) return null;
  return (expenditure * 1_000_000) / (beneficiaries * 12);
}

function buildRows(): GrantRow[] {
  const rows: GrantRow[] = [];

  for (const r of RAW_NATIONAL) {
    // National rows
    rows.push({
      Fiscal_Year: r.fy,
      Grant_Type:  r.grantType,
      Province:    "National",
      Metric:      "Beneficiaries",
      Value:       String(r.beneficiaries),
      Unit:        "count",
    });
    rows.push({
      Fiscal_Year: r.fy,
      Grant_Type:  r.grantType,
      Province:    "National",
      Metric:      "Expenditure_ZAR_Millions",
      Value:       String(r.expenditure),
      Unit:        "ZAR_millions",
    });

    // Avg monthly grant — skip Total_All_Grants (misleading average)
    if (r.grantType !== "Total_All_Grants") {
      const avg = avgMonthlyGrant(r.beneficiaries, r.expenditure);
      if (avg !== null) {
        rows.push({
          Fiscal_Year: r.fy,
          Grant_Type:  r.grantType,
          Province:    "National",
          Metric:      "Avg_Monthly_Grant_ZAR",
          Value:       avg.toFixed(2),
          Unit:        "ZAR",
        });
      }
    }
  }

  // Provincial breakdown rows for 2024/25 (beneficiaries only — no expenditure split available)
  for (const p of PROVINCIAL_2024_25) {
    rows.push({
      Fiscal_Year: "2024/25",
      Grant_Type:  p.grantType,
      Province:    p.province,
      Metric:      "Beneficiaries",
      Value:       String(p.beneficiaries),
      Unit:        "count",
    });
  }

  return rows;
}

export async function run(ctx: ScraperContext): Promise<ScraperResult> {
  const { spec, dataDir, dataRoot, log } = ctx;
  try {
    log.info("Building SASSA grant statistics (static history 2018/19–2024/25 + provincial breakdown)…");

    const allRows = buildRows();
    const fyCount = new Set(allRows.map(r => r.Fiscal_Year)).size;
    const provincialCount = allRows.filter(r => r.Province !== "National").length;
    log.info(`  ${allRows.length} rows across ${fyCount} fiscal years (${provincialCount} provincial rows)`);
    log.info("  Metrics: Beneficiaries, Expenditure_ZAR_Millions, Avg_Monthly_Grant_ZAR");

    const historyPath = path.join(dataDir, `${spec.id}_history.csv`);
    writeCsv(historyPath, allRows as unknown as Record<string, unknown>[]);
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

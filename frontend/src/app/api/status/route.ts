/**
 * GET /api/status
 * Returns per-dataset health status from data/status.json.
 * Merges with registry so all 15 datasets appear even if no scrape has run.
 */

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { DATASETS } from "@/lib/registry";
import type { StatusResponse, DatasetStatus } from "@/lib/datasets";

// ── status file shape (written by pipeline) ───────────────────────────────────
interface StatusFile {
  generatedAt: string;
  datasets: Record<string, DatasetStatus>;
}

function getDataRoot(): string {
  return process.env.MERIDIAN_DATA_ROOT ?? path.resolve(process.cwd(), "..", "data");
}

export async function GET(): Promise<NextResponse> {
  try {
    const dataRoot = getDataRoot();
    const statusPath = path.join(dataRoot, "status.json");

    let file: StatusFile = {
      generatedAt: new Date().toISOString(),
      datasets: {},
    };

    if (fs.existsSync(statusPath)) {
      const raw = fs.readFileSync(statusPath, "utf-8");
      file = JSON.parse(raw) as StatusFile;
    }

    // Ensure all 15 registry datasets appear — default to "never run"
    const datasets: Record<string, DatasetStatus> = {};
    for (const spec of DATASETS) {
      datasets[spec.id] = file.datasets[spec.id] ?? {
        success: false,
        last_updated: null,
        error: null,
        skipped: true,
      };
    }

    const response: StatusResponse = {
      generatedAt: file.generatedAt,
      datasets,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[/api/status]", err);
    return NextResponse.json({ error: "Failed to load status" }, { status: 500 });
  }
}

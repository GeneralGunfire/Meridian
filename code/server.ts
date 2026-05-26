import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Mock Data
  const files = {
    crime_stats: [
      { week: "2026-w21", date: "2026-05-26", csv_url: "/api/download/crime_stats_2026-w21.csv", xlsx_url: "/api/download/crime_stats_2026-w21.xlsx", rows: 1247 },
      { week: "2026-w20", date: "2026-05-19", csv_url: "/api/download/crime_stats_2026-w20.csv", xlsx_url: "/api/download/crime_stats_2026-w20.xlsx", rows: 1240 }
    ],
    eskom: [
      { week: "2026-w21", date: "2026-05-26", csv_url: "/api/download/eskom_2026-w21.csv", xlsx_url: "/api/download/eskom_2026-w21.xlsx", rows: 842 },
      { week: "2026-w20", date: "2026-05-19", csv_url: "/api/download/eskom_2026-w20.csv", xlsx_url: "/api/download/eskom_2026-w20.xlsx", rows: 815 }
    ],
    water: [
      { week: "2026-w21", date: "2026-05-26", csv_url: "/api/download/water_2026-w21.csv", xlsx_url: "/api/download/water_2026-w21.xlsx", rows: 562 },
      { week: "2026-w20", date: "2026-05-19", csv_url: "/api/download/water_2026-w20.csv", xlsx_url: "/api/download/water_2026-w20.xlsx", rows: 558 }
    ],
    housing: [
      { week: "2026-w21", date: "2026-05-26", csv_url: "/api/download/housing_2026-w21.csv", xlsx_url: "/api/download/housing_2026-w21.xlsx", rows: 312 },
      { week: "2026-w20", date: "2026-05-19", csv_url: "/api/download/housing_2026-w20.csv", xlsx_url: "/api/download/housing_2026-w20.xlsx", rows: 310 }
    ]
  };

  const status = {
    crime_stats: { success: true, last_updated: "2026-05-26", error: null },
    eskom: { success: true, last_updated: "2026-05-26", error: null },
    water: { success: true, last_updated: "2026-05-26", error: null },
    housing: { success: true, last_updated: "2026-05-26", error: null }
  };

  // API Routes
  app.get("/api/files", (req, res) => {
    res.json(files);
  });

  app.get("/api/status", (req, res) => {
    res.json(status);
  });

  app.get("/api/download/:filename", (req, res) => {
    const { filename } = req.params;
    // For a real app, this would stream the file from storage
    // For this demo, we'll send a mock text blob converted to a download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send("mock,data,for,demo\n1,2,3,4");
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

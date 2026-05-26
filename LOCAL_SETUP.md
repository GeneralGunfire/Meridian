# Local Development Setup

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm installed

### First Time Setup

```bash
# Install dependencies (already done, but just in case)
npm install

# Generate dummy test data (optional—already done)
npm run seed
```

### Run Development Servers

Choose one of these methods:

#### Method 1: Combined (Recommended)
```bash
npm run dev
```
This starts both backend and frontend simultaneously using `concurrently`.

#### Method 2: Separate Terminals (Better for debugging)

**Terminal 1 - Backend (Next.js API on :3000)**
```bash
npm run dev:next
```

**Terminal 2 - Frontend (Vite on :5173)**
```bash
npm run dev:vite
```

#### Method 3: PowerShell Script (Windows)
```powershell
.\start-dev.ps1
```

## Access the App

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api/files

## Testing the API

### Check available files
```bash
curl http://localhost:3000/api/files
```

### Check scrape status
```bash
curl http://localhost:3000/api/status
```

### Download a file
```bash
curl http://localhost:3000/api/download/crime_stats_2026-w22.csv -o test.csv
```

## File Structure

```
Meridian/
├── src/
│   ├── app/              # Next.js backend (API routes)
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── hooks/           # React hooks (useFiles)
│   └── index.css        # Global styles (dark theme)
├── data/                # CSV/Excel data files
├── scripts/             # Utility scripts (seed-data.js)
├── .github/workflows/   # GitHub Actions
├── CLAUDE.md           # Architecture + dev guidance
└── BACKEND.md          # Backend API documentation
```

## Key URLs

| Page | URL | Status |
|------|-----|--------|
| Landing | http://localhost:5173 | ✓ Done |
| Downloads | http://localhost:5173/downloads | Structure ready, needs styling |
| Dashboards | http://localhost:5173/dashboards | Structure ready, needs styling |
| About | http://localhost:5173/about | Structure ready, needs styling |

## Testing Checklist

- [ ] Landing page loads with dark theme
- [ ] Hero section displays correctly
- [ ] 4 featured dataset cards render
- [ ] Status indicators show all green
- [ ] Navigation links work (click between pages)
- [ ] Framer Motion transitions work
- [ ] API calls succeed (check Network tab in browser dev tools)
- [ ] Dark background (slate-950) applies globally

## Troubleshooting

### "Port 3000 already in use"
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows (then taskkill)
```

### "Port 5173 already in use"
Same as above, but for port 5173.

### API calls failing
Make sure both servers are running:
```bash
# Check ports
netstat -an | grep -E "3000|5173"  # macOS/Linux
netstat -ano | findstr "3000 5173" # Windows
```

## Next Steps

When improving the UI:
1. Modify components in `src/components/`
2. Update styles in component files (Tailwind classes)
3. Changes hot-reload automatically
4. Commit improvements with descriptive messages

## Commands Reference

```bash
npm run dev           # Start both servers
npm run dev:next      # Backend only
npm run dev:vite      # Frontend only
npm run build         # Build for production
npm run seed          # Regenerate dummy data
npm run lint          # Check TypeScript
```

---

**Last Updated:** 2026-05-26  
**Status:** Ready for local testing

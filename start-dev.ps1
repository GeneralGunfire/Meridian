# Start backend and frontend in separate terminal windows

# Backend (Next.js on port 3000)
Start-Process -NoNewWindow -FilePath "cmd" -ArgumentList "/c npm run dev:next"

# Wait 3 seconds for backend to start
Start-Sleep -Seconds 3

# Frontend (Vite on port 5173)
Start-Process -NoNewWindow -FilePath "cmd" -ArgumentList "/c npm run dev:vite"

Write-Host "✓ Backend starting on http://localhost:3000"
Write-Host "✓ Frontend starting on http://localhost:5173"
Write-Host ""
Write-Host "Open http://localhost:5173 in your browser"

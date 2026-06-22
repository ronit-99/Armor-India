# Armor India architecture

The live interface is the React/Next.js application in `frontend/`. The standalone HTML prototype is not used by the live app.

## Frontend

- `src/app/` — route pages; each `page.tsx` composes a screen.
- `src/components/` — reusable UI components.
- `src/data/` — static navigation and dashboard presentation data.
- `src/lib/` — API client and shared utilities.
- `src/app/globals.css` — shared Armor India theme.

Next.js links the application through `src/app/layout.tsx`; `src/app/page.tsx` is the dashboard route.

## Backend

- `backend/app/main.py` — FastAPI entry point.
- `backend/app/routers/` — endpoints grouped by feature.
- `backend/app/services/` — fraud, language, graph, geospatial, and currency logic.

## Start

```powershell
.\start.ps1
```

Frontend: <http://localhost:3000>  
API docs: <http://localhost:8000/docs>

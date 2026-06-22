# Armor India

**AI-Powered Digital Public Safety Intelligence Platform**

An integrated platform for **predictive threat neutralisation** supporting law enforcement, financial institutions, and citizens.

## Quick Start (2 minutes)

### 1. Add your API key

```bash
cp .env.example .env
# Edit .env and set your OpenAI API key:
# OPENAI_API_KEY=sk-your-key-here
```

> **Works without API key too** — demo mode uses rule-based classifiers and seeded intelligence data.

### 2. Start the platform

**Windows (PowerShell):**
```powershell
.\start.ps1
```

**Linux/macOS:**
```bash
chmod +x start.sh && ./start.sh
```

### 3. Open the dashboard

- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs

---

## Features (All 5 Challenge Modules)

| Module | Description | Demo |
|--------|-------------|------|
| **Digital Arrest Scam Detection** | Real-time AI classifier for call scripts, spoofing signatures, MHA alert generation | Load demo transcript → Analyze |
| **Counterfeit Currency ID** | CV agent for microprint, security thread, UV simulation across ₹10–₹500 | Upload note image |
| **Fraud Network Graph** | Graph AI mapping scammers, mules, victims with court-admissible evidence packages | Interactive force graph |
| **Geospatial Crime Intel** | Hotspot mapping, patrol zones, inter-district intelligence | NCR dark map |
| **Citizen Fraud Shield** | Multi-channel AI advisor in 12 languages with NCRB reporting | Chat interface |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Armor India Frontend                     │
│              Next.js 14 · Tailwind · Leaflet                 │
│   Command Center │ Scam │ Counterfeit │ Graph │ Map │ Chat  │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
┌──────────────────────────▼──────────────────────────────────┐
│                   FastAPI Backend (Python)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Scam NLP │ │ CV Agent │ │ Graph AI │ │ Geo Intel    │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘   │
│       └────────────┴────────────┴──────────────┘           │
│                    OpenAI API (optional)                     │
│              GPT-4o-mini · Vision · JSON mode              │
└─────────────────────────────────────────────────────────────┘
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full details.

## Judging Criteria Alignment

| Criteria | How We Address It |
|----------|-------------------|
| **Innovation (25%)** | Agentic multi-module fusion — scam + CV + graph + geo + citizen shield in one platform |
| **Business Impact (25%)** | MHA/I4C/NCRB compatible alerts, ₹ loss prevention metrics, inter-jurisdiction evidence |
| **Technical Excellence (20%)** | OpenAI vision + NLP, NetworkX graph clustering, geospatial hotspot analysis |
| **Scalability (15%)** | Stateless API, modular services, deployable to edge (mobile CV) and command centers |
| **User Experience (15%)** | Armor India shield UI, fraud score gauges, low false-positive citizen chat |

## Demo Script (for judges)

1. **Dashboard** — Show live stats, avg threat score, module overview
2. **Scam Detection** — Click "Load Demo" → Analyze → Show 80%+ fraud score + MHA alert
3. **Counterfeit** — Upload any currency note image → Security checks breakdown
4. **Fraud Network** — Interactive graph with clusters + evidence package
5. **Crime Map** — NCR hotspots with patrol zone recommendations
6. **Citizen Shield** — Ask "CBI called asking for UPI transfer" → Instant danger verdict

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Leaflet, react-force-graph-2d, Recharts
- **Backend:** FastAPI, Python 3.11+, OpenAI SDK, NetworkX, Pillow
- **AI:** OpenAI GPT-4o-mini (text + vision) with rule-based fallback

## Project Structure

```
hackathon/
├── backend/          # FastAPI API server
│   └── app/
│       ├── routers/  # API endpoints per module
│       └── services/ # AI + business logic
├── frontend/         # Next.js dashboard
│   └── src/
│       ├── app/      # Pages per module
│       └── components/
├── docs/             # Architecture + presentation
├── .env.example      # API key template
├── start.ps1         # Windows startup
└── start.sh          # Linux/macOS startup
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health + AI status |
| `/api/scam/analyze` | POST | Scam transcript analysis |
| `/api/counterfeit/analyze` | POST | Currency note image analysis |
| `/api/graph/network` | GET | Fraud network graph data |
| `/api/graph/evidence-package` | GET | Court-admissible evidence |
| `/api/geo/hotspots` | GET | Geospatial crime data |
| `/api/citizen/chat` | POST | Citizen fraud shield chat |

## Deliverables Checklist

- [x] Working Prototype
- [x] Architecture Diagram (`docs/ARCHITECTURE.md`)
- [x] Presentation Deck (`docs/PRESENTATION.md`)
- [ ] Demo Video (record using demo script above)

## Deploy to Netlify

The hosted build is self-contained: Next.js serves both the UI and `/api/*` serverless routes. The Python backend remains available for local development but is not required on Netlify.

1. Choose **Add new project → Import an existing project** in Netlify.
2. Select GitHub and `ronit-99/Armor-India`.
3. Keep the build settings detected from `netlify.toml`.
4. Add `GEMINI_API_KEY` under **Site configuration → Environment variables**.
5. Optionally add `GEMINI_MODEL=gemini-2.5-flash`, then deploy.

Do not set `NEXT_PUBLIC_API_URL` on Netlify. When it is unset, the frontend uses the same-origin serverless API and all modules remain connected.

## License

Built for KAVACH Hackathon — Digital Public Safety Intelligence Challenge.

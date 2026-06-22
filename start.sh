#!/bin/bash
set -e

echo "🛡️  Starting Armor India..."
ROOT="$(cd "$(dirname "$0")" && pwd)"

# Copy .env if missing
if [ ! -f "$ROOT/.env" ]; then
    cp "$ROOT/.env.example" "$ROOT/.env"
    echo "⚠️  Created .env from template — add your OPENAI_API_KEY for full AI features"
fi

# Load .env
set -a
source "$ROOT/.env"
set +a

# Backend
echo "📦 Setting up backend..."
cd "$ROOT/backend"
python3 -m venv venv 2>/dev/null || true
source venv/bin/activate
pip install -r requirements.txt -q

echo "🚀 Starting API server on http://localhost:8000"
PYTHONPATH="$ROOT/backend" uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Frontend
echo "📦 Setting up frontend..."
cd "$ROOT/frontend"
npm install --silent 2>/dev/null || npm install

echo "🚀 Starting dashboard on http://localhost:3000"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Armor India is running!"
echo "   Dashboard:  http://localhost:3000"
echo "   API Docs:   http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait

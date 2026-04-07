---
name: run-dev-servers
description: 'Start the FastAPI backend and React frontend dev servers simultaneously. Use when: developing features, testing changes, running the full application locally.'
argument-hint: 'Optional: specify which server(s) to start: api, web, or both (default: both)'
---

# Run Development Servers

Start the Todo monorepo in development mode with both backend API and frontend web server running.

## When to Use

- **Active development**: Making changes to backend or frontend
- **Feature testing**: Testing new features end-to-end
- **Full-stack debugging**: Observing frontend↔backend interactions
- **Local validation**: Before committing or opening a PR

## Prerequisites

- Dependencies installed: `pip install -r api/requirements.txt` and `npm install` in `web/`
- SQL Server running on localhost:1433
- `.env` files configured with database credentials

## Quick Start

Run the [all-in-one script](./scripts/run-all.sh):

```bash
cd /workspaces/todo
bash ./.github/skills/run-dev-servers/scripts/run-all.sh
```

This starts both servers in one terminal, clearly labeled for each.

## Separate Terminals (Recommended)

For independent monitoring and log separation:

**Terminal 1 — Backend API (http://localhost:8000)**
```bash
cd /workspaces/todo/api
python -m uvicorn app.main:app --reload
```

**Terminal 2 — Frontend Web (http://localhost:5173)**
```bash
cd /workspaces/todo/web
npm run dev
```

## Individual Servers

### Backend Only
```bash
cd /workspaces/todo/api
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Only
```bash
cd /workspaces/todo/web
npm run dev
```

## Verification

- **API Health**: Visit http://localhost:8000/docs (interactive Swagger UI)
- **Web App**: Visit http://localhost:5173
- **API Logs**: Watch terminal for incoming requests
- **Frontend Logs**: Watch terminal for build/bundle changes

## Troubleshooting

| Issue | Solution |
|---|---|
| Port 8000 already in use | Change: `--port 9000` |
| Port 5173 already in use | Vite will auto-increment to 5174, 5175, etc. |
| Module not found (Python) | Run `pip install -r api/requirements.txt` |
| Module not found (Node) | Run `cd web && npm install` |
| Database connection error | Verify SQL Server is running; check `.env` credentials |

## See Also

- [Backend Architecture](../../../docs/TRD.md) — 3-layer pattern, dependencies
- [API Testing](../../../api/pytest.ini) — Run `pytest` in `/api`
- [Frontend Testing](../../../web/package.json) — Run `npm test` in `/web`


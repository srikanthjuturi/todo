# Advanced Configuration & Troubleshooting

## Environment Variables

Both API and web servers read from `.env` files (not committed to git).

### API (.env in `/api`)
```env
DATABASE_URL=mssql+aioodbc://sa:YourSQLServerPassword@localhost:1433/todo?driver=ODBC+Driver+17+for+SQL+Server&TrustServerCertificate=yes
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### Web (.env in `/web`) 
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Port Customization

### Change API Port
```bash
cd api
python -m uvicorn app.main:app --reload --port 9000
```

Then update `.env` in web:
```env
VITE_API_BASE_URL=http://localhost:9000
```

### Change Web Port
Vite automatically tries alternative ports (5174, 5175, etc.) if 5173 is in use. No configuration needed; check console output for the assigned port.

## Debug Mode

### Backend with Debug Logging
```bash
cd api
ENVIRONMENT=development LOG_LEVEL=DEBUG python -m uvicorn app.main:app --reload
```

### Frontend with Debug Output
```bash
cd web
npm run dev -- --debug
```

## Monitoring & Logs

### API Access Logs
```bash
# Terminal 1 (running API)
# Watch for incoming requests in console output
```

### Frontend Build Logs
```bash
# Terminal 2 (running web dev server)
# Watch for hot-reload messages and build errors
```

### Database Queries (if using SQLAlchemy logging)
Set in API `.env` or Python:
```python
# app/config.py or via env var
SQLALCHEMY_ECHO=true  # Logs all SQL queries to console
```

## Common Issues & Solutions

### 1. Port 8000 Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill it (replace PID)
kill -9 <PID>

# Or change port as shown above
```

### 2. SQL Server Connection Failed
```bash
# Verify SQL Server is running
docker ps | grep sql

# If not running, start it (assuming Docker):
docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=YourPassword' \
  -p 1433:1433 -d mcr.microsoft.com/mssql/server:latest
```

### 3. Module Import Errors (API)
```bash
cd api
pip install -r requirements.txt
```

### 4. Module Import Errors (Web)
```bash
cd web
npm install
```

### 5. Hot Reload Not Working
- **API**: Restart `uvicorn` to pick up changes
- **Web**: Vite should auto-reload on file save; check console for errors

### 6. CORS Errors in Browser Console
Verify API is running and `.env` CORS settings in `app/main.py`:
```python
CORSMiddleware(allow_origins=["http://localhost:5173"])
```

## Performance Tips

- **API logging**: Use `LOG_LEVEL=WARNING` in production-like testing to reduce I/O
- **Vite bundling**: Close unused browser tabs to reduce memory usage
- **Database**: Use indexes on frequently queried columns (see migrations)

## Docker Alternative (Optional)

If using Docker Compose, create `docker-compose.yml`:
```yaml
version: '3'
services:
  api:
    build: ./api
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
  web:
    build: ./web
    ports:
      - "5173:5173"
```

Then:
```bash
docker-compose up
```

## See Also

- [Backend Architecture](../../../docs/TRD.md) — Full 3-layer pattern details
- [API Routes](../../../api/app/routes/) — Available endpoints
- [Vite Config](../../../web/vite.config.ts) — Frontend build settings

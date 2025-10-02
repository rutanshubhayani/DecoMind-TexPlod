# Run TEXplods locally

Follow these commands exactly (Linux/macOS). Adjust MySQL credentials if needed.

## 1) Install backend dependencies
```
cd "$(dirname "$0")/server"
npm install
```

## 2) Create environment file
Create `server/.env` with your DB credentials. Example values:
```
PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_USER=texplod
DB_PASSWORD=texplod_pass
DB_NAME=texplods
```

## 3) Initialize database (only once)
Import schema and sample data. Enter the password for DB_USER when prompted.
```
cd "$(dirname "$0")"
mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" < server/db/schema.sql
```
If you didn't export env vars, run with explicit values:
```
mysql -h localhost -u texplod -p texplods < server/db/schema.sql
```

## 4) Start the API server
```
cd server
npm run start
# API listening at http://localhost:8080
```

## 5) Verify API health (new terminal)
```
curl http://localhost:8080/health
```

## 6) Open the frontend
- Open `index.html` (double-click in file browser) or use a static server
- Admin dashboard: `admin.html`
- If API is not at localhost:8080, append the query param:
  - `index.html?api=http://HOST:PORT` 
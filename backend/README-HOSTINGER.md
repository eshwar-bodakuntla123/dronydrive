# Dronydrive FastAPI — Hostinger VPS deployment

Current MVP deployment: SQLite + persistent Docker volume. Before real client-scale drone data, move files to Cloudflare R2 and the database to PostgreSQL.

## DNS
Create an A record: `api.dronylights.com` -> your Hostinger VPS public IP.

## VPS
Use Ubuntu 24.04 with Docker.

## Deploy
`cp .env.example .env`
`docker compose up -d --build`

## Test
`curl http://127.0.0.1:8000/api/health`

## HTTPS
Reverse proxy `api.dronylights.com` to `127.0.0.1:8000` using Nginx/Caddy/Hostinger proxy and enable SSL.

## Frontend
Set `VITE_API_URL=https://api.dronylights.com`, rebuild, and redeploy the React frontend.

# Dronydrive — React + FastAPI MVP

## Hostinger frontend
Set application root to `frontend`, build command `npm run build`, output directory `dist`, and set `VITE_API_URL` to the public FastAPI API URL.

## Backend
FastAPI requires a Python-capable environment. For Hostinger, use a VPS for the API. The managed Node.js Web App deployment is for the React/Vite frontend.

## Production
Move SQLite to PostgreSQL, local file storage to S3-compatible object storage such as Cloudflare R2, and add authentication, authorization, signed URLs, resumable uploads and background processing before handling real client data.

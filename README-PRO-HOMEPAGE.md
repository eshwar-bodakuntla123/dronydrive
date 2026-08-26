# Dronydrive — Pro Homepage Baseline

This version consolidates the landing page around the actual Dronydrive visual identity and removes the long, low-value marketing scroll.

## What changed

- Rebuilt the homepage around the real local panorama asset.
- Removed external Unsplash imagery from the landing page.
- Removed the old 300vh scroll showcase and replaced it with a compact 4-stage cinematic hero.
- Added a tighter platform section with GeoTIFF / 360° / project-memory cards.
- Added a compact three-step workflow section.
- Kept the browser-only Free 360° Viewer.
- Kept the existing workspace and backend.
- Standardized the free 360° viewer on a Three.js `BackSide` sphere instead of negative geometry scaling.
- Fixed Docker configuration so the FastAPI package path and persistent `/app/data` volume are consistent.

## Run frontend locally

```bat
cd frontend
npm install
npm run dev
```

## Run backend locally

From the repository root:

```bat
python -m uvicorn backend.main:app --reload --port 8000
```

## Hostinger frontend

Build command:

```text
npm run build
```

Output directory:

```text
dist
```

If the repository contains both `frontend/` and `backend/`, set the Hostinger frontend application root to `frontend`.

## Important

The public Free 360° Viewer is intentionally browser-only. A selected image is held in browser memory through a temporary Blob URL and is not sent to FastAPI.

# Dronydrive — True 360° Homepage

The homepage uses the supplied 2048×1024 equirectangular panorama as a real inside-facing Three.js sphere. The panorama is never rendered as a flat image, so the equirectangular "two sides" appearance is not shown. The initial sphere rotation places the panorama seam behind the viewer.

## Run

```bash
cd frontend
npm install
npm run dev
```

The panorama is bundled at `frontend/public/assets/dronydrive-hero-360.jpg`.

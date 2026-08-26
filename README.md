# Dronydrive — Cinematic Scroll Homepage

This version keeps the existing React + FastAPI MVP and upgrades the landing page into a scroll-driven cinematic experience using the supplied 2048×1024 aerial panorama.

## Homepage behavior
- Panorama remains pinned while the user scrolls through four story stages.
- Scroll progress moves the visual composition horizontally and gently changes scale.
- Cursor movement creates subtle camera/parallax response.
- Pointer/touch drag pans the panorama.
- Stage copy transitions through Capture → Context → Review → Deliver.
- The workspace and existing backend are preserved.

## Run locally
```bat
cd frontend
npm install
npm run dev
```

The supplied panorama is already included at:
`frontend/public/assets/dronydrive-hero-360.jpg`

## Note
The homepage intentionally uses the panorama as a cinematic 2D/scroll-driven visual rather than a true VR-style 360 viewer. The dedicated project 360 viewer remains separate.

## New: Free 360° Viewer

The homepage now includes a free, browser-only 360° viewer utility. Visitors can select or drag in a JPEG, PNG, or WebP panorama and click **View 360°**. The image is never sent to the Dronydrive backend: the browser creates a temporary `blob:` URL and Three.js renders it locally.

This feature is intentionally separate from the authenticated/project upload flow. It can be used as a public utility to attract search traffic and introduce users to Dronydrive.

Recommended panorama format: equirectangular 2:1 (for example 6000×3000 or 2048×1024).

TIFF is not accepted by this lightweight browser-only utility because standard browsers do not reliably decode TIFF without an additional client-side decoder. GeoTIFF/orthomosaic TIFFs remain part of the Dronydrive project viewer workflow.

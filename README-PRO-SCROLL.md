# Dronydrive — Pro Scroll Pass

This version is tuned from the supplied screen recording. The main issue in the previous build was vertical dead space: a 300vh scroll showcase plus a tall free-tool section made the page feel like separate screens with empty transitions.

## Changes

- Replaced the 300vh orbit showcase with a compact 185vh cinematic story.
- The supplied 2048×1024 panorama remains visually present through the story instead of disappearing into a blank section.
- Scroll advances through 3 clear stages: Capture → Understand → Deliver.
- Added a restrained image track, data pins, coordinates and progress rail.
- Reduced the Free 360° tool section so it reads as a useful product feature rather than a full-page gap.
- Tightened spacing across platform, workflow, capabilities, pricing and CTA sections.
- Preserved the existing local-only Free 360° viewer and workspace/backend code.

## Local run

```bash
cd frontend
npm install
npm run dev
```

No backend is required for the public Free 360° tool. The selected panorama stays in the browser and is never sent to the FastAPI backend.

## Hostinger frontend

Build command:

```bash
npm run build
```

Output:

```text
dist
```

Root directory when deploying the monorepo frontend:

```text
frontend
```

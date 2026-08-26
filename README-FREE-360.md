# Dronydrive Free 360° Viewer

This build adds a public-facing **Free 360° Viewer** section to the React homepage.

## Privacy / architecture
- The selected image is handled entirely in the browser.
- No API request is made when a visitor chooses an image.
- The image is represented by a temporary browser `blob:` URL.
- Closing/removing the file releases the object URL.
- The viewer accepts JPEG, PNG and WebP images.
- A 2:1 aspect ratio is recommended for equirectangular 360° panoramas.
- TIFF is intentionally not accepted by this lightweight browser-only tool because normal browsers do not reliably decode TIFF images without an additional TIFF decoder.

## User flow
1. Visitor opens the homepage.
2. Scrolls to **Free 360° Viewer**.
3. Drops/selects a panorama.
4. Clicks **View 360°**.
5. Drag to look around and scroll to zoom.
6. Close the viewer; no file is stored on Dronydrive.

## Why this is useful
This creates a low-friction free utility that can be indexed and shared as a standalone feature while keeping the Dronydrive product upload/storage workflow separate.

# Hostinger frontend deployment

This frontend is a Vite/React static build.

Build locally:

```bash
npm install
npm run build
```

Upload the contents of `frontend/dist/` to the Hostinger public web directory.

Before building, set the API URL:

```text
VITE_API_URL=https://api.yourdomain.com
```

For SPA routing, keep the supplied `.htaccess` in the public directory.

The Python FastAPI backend should run separately. Do not put large drone TIFF/video/object files into normal web hosting storage for production; use object storage and a proper application server.

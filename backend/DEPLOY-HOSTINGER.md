# Backend deployment

The FastAPI backend does not need Rasterio/GDAL for the MVP TIFF preview. The requirements file intentionally avoids Rasterio so Windows/Python 3.14 setup remains straightforward.

For production GeoTIFF CRS/bounds extraction, add rasterio/GDAL in the server environment later.

Local Windows:

```bat
cd backend
setup_windows.bat
cd ..
python -m uvicorn backend.main:app --reload --port 8000
```

API docs: http://127.0.0.1:8000/docs

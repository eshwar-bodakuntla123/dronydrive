FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app/backend
RUN mkdir -p /app/data/storage
ENV STORAGE_DIR=/app/data/storage
ENV DATABASE_URL=sqlite:////app/data/dronydrive.db
ENV CORS_ORIGINS=https://dronylights.com
ENV MAX_UPLOAD_MB=4096
EXPOSE 8000
CMD ["uvicorn","backend.main:app","--host","0.0.0.0","--port","8000"]

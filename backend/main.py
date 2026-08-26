import json,os,mimetypes,uuid
from pathlib import Path
from fastapi import FastAPI,Depends,File,HTTPException,UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from .models import Project, ProjectFile
from .schemas import ProjectCreate, ProjectSummary, ProjectDetail, FileOut
from .tiff_service import inspect, preview
Base.metadata.create_all(bind=engine)
STORAGE=Path(os.getenv('STORAGE_DIR','./storage')); STORAGE.mkdir(parents=True,exist_ok=True)
MAX=int(os.getenv('MAX_UPLOAD_MB','4096'))*1024*1024
orig=os.getenv('CORS_ORIGINS','http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174'); origins=['*'] if orig=='*' else [x.strip() for x in orig.split(',') if x.strip()]
app=FastAPI(title='Dronydrive API',version='1.0.0')
app.add_middleware(CORSMiddleware,allow_origins=origins,allow_credentials=True,allow_methods=['*'],allow_headers=['*'])
ALLOWED={'.tif','.tiff','.jpg','.jpeg','.png','.webp','.mp4','.mov','.zip','.obj','.fbx','.pdf'}; IMAGES={'.tif','.tiff','.jpg','.jpeg','.png','.webp'}
@app.get('/api/health')
def health(): return {'status':'ok','service':'dronydrive-api'}
def summary(p): return ProjectSummary(id=p.id,name=p.name,description=p.description or '',created_at=p.created_at,file_count=len(p.files),storage_bytes=sum(f.size_bytes or 0 for f in p.files))
def fout(f): return FileOut(id=f.id,project_id=f.project_id,original_name=f.original_name,extension=f.extension,mime_type=f.mime_type,size_bytes=f.size_bytes,width=f.width,height=f.height,pages=f.pages,bands=f.bands,crs=f.crs,bounds=json.loads(f.bounds_json) if f.bounds_json else None,is_image=f.is_image,created_at=f.created_at)
@app.post('/api/projects',response_model=ProjectSummary)
def create(payload:ProjectCreate,db:Session=Depends(get_db)):
 name=payload.name.strip()
 if not name: raise HTTPException(400,'Project name is required')
 p=Project(name=name,description=payload.description.strip());db.add(p);db.commit();db.refresh(p);return summary(p)
@app.get('/api/projects',response_model=list[ProjectSummary])
def projects(db:Session=Depends(get_db)): return [summary(p) for p in db.query(Project).order_by(Project.created_at.desc()).all()]
@app.get('/api/projects/{pid}',response_model=ProjectDetail)
def project(pid:int,db:Session=Depends(get_db)):
 p=db.get(Project,pid)
 if not p: raise HTTPException(404,'Project not found')
 return ProjectDetail(id=p.id,name=p.name,description=p.description or '',created_at=p.created_at,file_count=len(p.files),storage_bytes=sum(f.size_bytes or 0 for f in p.files),files=[fout(f) for f in p.files])
@app.post('/api/projects/{pid}/files',response_model=FileOut)
async def upload(pid:int,file:UploadFile=File(...),db:Session=Depends(get_db)):
 p=db.get(Project,pid)
 if not p: raise HTTPException(404,'Project not found')
 original=Path(file.filename or 'unnamed').name; ext=Path(original).suffix.lower()
 if ext not in ALLOWED: raise HTTPException(400,f'File type {ext or "unknown"} is not enabled')
 token=uuid.uuid4().hex; d=STORAGE/str(pid);d.mkdir(parents=True,exist_ok=True);stored=f'{token}{ext}';path=d/stored;total=0
 with path.open('wb') as out:
  while True:
   chunk=await file.read(1024*1024)
   if not chunk: break
   total+=len(chunk)
   if total>MAX: out.close();path.unlink(missing_ok=True);raise HTTPException(413,'File exceeds configured upload limit')
   out.write(chunk)
 width=height=pages=bands=None;crs=None;bounds=None;prev=None;is_image=ext in IMAGES
 try:
  if ext in {'.tif','.tiff'}:
   m=inspect(str(path));width,height,pages,bands=m.get('width'),m.get('height'),m.get('pages'),m.get('bands');crs=m.get('crs');bounds=m.get('bounds');prev=str(d/f'{token}.png');preview(str(path),prev)
  elif ext in {'.jpg','.jpeg','.png','.webp'}:
   from PIL import Image
   with Image.open(path) as im: width,height=im.size
   prev=str(path)
 except Exception: prev=None
 rec=ProjectFile(project_id=pid,original_name=original,stored_name=stored,extension=ext,mime_type=file.content_type or mimetypes.guess_type(original)[0] or 'application/octet-stream',size_bytes=total,width=width,height=height,pages=pages,bands=bands,crs=crs,bounds_json=json.dumps(bounds) if bounds else None,is_image=is_image,preview_path=prev)
 db.add(rec);db.commit();db.refresh(rec);return fout(rec)
def getfile(fid,db):
 f=db.get(ProjectFile,fid)
 if not f: raise HTTPException(404,'File not found')
 return f
@app.get('/api/files/{fid}/preview')
def file_preview(fid:int,db:Session=Depends(get_db)):
 f=getfile(fid,db)
 if not f.preview_path or not Path(f.preview_path).exists(): raise HTTPException(404,'Preview unavailable')
 return FileResponse(f.preview_path,media_type='image/png')
@app.get('/api/files/{fid}/thumbnail')
def thumbnail(fid:int,db:Session=Depends(get_db)):
 f=getfile(fid,db)
 if f.preview_path and Path(f.preview_path).exists(): return FileResponse(f.preview_path,media_type='image/png')
 raise HTTPException(404,'Thumbnail unavailable')
@app.get('/api/files/{fid}/download')
def download(fid:int,db:Session=Depends(get_db)):
 f=getfile(fid,db);path=STORAGE/str(f.project_id)/f.stored_name
 if not path.exists(): raise HTTPException(404,'Stored file not found')
 return FileResponse(path,media_type=f.mime_type,filename=f.original_name)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

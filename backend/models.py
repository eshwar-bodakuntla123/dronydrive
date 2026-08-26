from datetime import datetime,timezone
from sqlalchemy import Column,Integer,String,Text,DateTime,ForeignKey,BigInteger,Boolean
from sqlalchemy.orm import relationship
from .database import Base
class Project(Base):
 __tablename__='projects'
 id=Column(Integer,primary_key=True); name=Column(String(255),nullable=False); description=Column(Text,default=''); created_at=Column(DateTime,default=lambda:datetime.now(timezone.utc))
 files=relationship('ProjectFile',back_populates='project',cascade='all, delete-orphan')
class ProjectFile(Base):
 __tablename__='project_files'
 id=Column(Integer,primary_key=True); project_id=Column(Integer,ForeignKey('projects.id'),nullable=False); original_name=Column(String(500),nullable=False); stored_name=Column(String(500),unique=True,nullable=False); extension=Column(String(30),nullable=False); mime_type=Column(String(150),default='application/octet-stream'); size_bytes=Column(BigInteger,default=0); width=Column(Integer); height=Column(Integer); pages=Column(Integer); bands=Column(Integer); crs=Column(String(255)); bounds_json=Column(Text); is_image=Column(Boolean,default=False); preview_path=Column(String(1000)); created_at=Column(DateTime,default=lambda:datetime.now(timezone.utc))
 project=relationship('Project',back_populates='files')

from datetime import datetime
from typing import Optional
from pydantic import BaseModel,ConfigDict
class ProjectCreate(BaseModel): name:str; description:str=''
class FileOut(BaseModel):
 model_config=ConfigDict(from_attributes=True)
 id:int; project_id:int; original_name:str; extension:str; mime_type:str; size_bytes:int; width:Optional[int]=None; height:Optional[int]=None; pages:Optional[int]=None; bands:Optional[int]=None; crs:Optional[str]=None; bounds:Optional[dict]=None; is_image:bool; created_at:datetime
class ProjectSummary(BaseModel):
 model_config=ConfigDict(from_attributes=True)
 id:int; name:str; description:str; created_at:datetime; file_count:int; storage_bytes:int
class ProjectDetail(ProjectSummary): files:list[FileOut]

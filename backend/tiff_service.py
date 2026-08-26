import numpy as np
import tifffile
from PIL import Image,ImageOps

def displayable(arr):
 arr=np.squeeze(np.asarray(arr))
 if arr.ndim==2:
  d=arr.astype(np.float32); finite=np.isfinite(d)
  if finite.any():
   lo,hi=np.percentile(d[finite],[1,99]); hi=max(hi,lo+1e-9); d=np.clip((d-lo)/(hi-lo),0,1)
  else:d=np.zeros_like(d)
  return Image.fromarray((d*255).astype(np.uint8),'L').convert('RGB')
 if arr.ndim>=3:
  if arr.shape[-1] in (3,4): data=arr[...,:3]
  elif arr.shape[0] in (3,4): data=np.moveaxis(arr[:3],0,-1)
  else:
   while arr.ndim>3: arr=arr[0]
   return displayable(arr)
  data=data.astype(np.float32); out=np.zeros_like(data)
  for c in range(data.shape[-1]):
   ch=data[...,c]; finite=np.isfinite(ch)
   if finite.any():
    lo,hi=np.percentile(ch[finite],[1,99]); hi=max(hi,lo+1e-9); out[...,c]=np.clip((ch-lo)/(hi-lo),0,1)
  return Image.fromarray((out*255).astype(np.uint8),'RGB')
 raise ValueError('Unsupported TIFF dimensionality')

def inspect(path):
 with tifffile.TiffFile(path) as tif:
  page=tif.pages[0]; shape=tuple(page.shape); pages=len(tif.pages); dtype=str(page.dtype)
  h=w=None; bands=None
  if len(shape)>=2: h,w=shape[-2],shape[-1]
  if len(shape)>=3 and shape[-1] in (3,4): bands=shape[-1]
  elif len(shape)>=3 and shape[0]<=16: bands=shape[0]
 meta={'width':int(w) if w else None,'height':int(h) if h else None,'pages':pages,'bands':bands,'dtype':dtype}
 # GeoTIFF CRS/bounds extraction is optional in this MVP.
 # The viewer works without GDAL/rasterio.
 return meta

def preview(path,out):
 with tifffile.TiffFile(path) as tif: arr=tif.pages[0].asarray()
 img=ImageOps.exif_transpose(displayable(arr)); img.thumbnail((2400,1600),Image.Resampling.LANCZOS); img.save(out,'PNG',optimize=True)

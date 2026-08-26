const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
async function request(path, options={}) {
  const r = await fetch(`${API_URL}${path}`, options);
  if (!r.ok) { let m=`Request failed (${r.status})`; try { m=(await r.json()).detail || m; } catch{} throw new Error(m); }
  return r;
}
export async function getProjects(){ return (await request('/api/projects')).json(); }
export async function getProject(id){ return (await request(`/api/projects/${id}`)).json(); }
export async function createProject(name, description=''){ return (await request('/api/projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,description})})).json(); }
export async function uploadFile(projectId,file,onProgress){
  return new Promise((resolve,reject)=>{ const x=new XMLHttpRequest(); x.open('POST',`${API_URL}/api/projects/${projectId}/files`); const f=new FormData(); f.append('file',file); x.upload.onprogress=e=>e.lengthComputable&&onProgress?.(Math.round(e.loaded/e.total*100)); x.onload=()=>{try{const d=JSON.parse(x.responseText);x.status>=200&&x.status<300?resolve(d):reject(new Error(d.detail||'Upload failed'))}catch{reject(new Error('Upload failed'))}}; x.onerror=()=>reject(new Error('Network error')); x.send(f); });
}
export const previewUrl=id=>`${API_URL}/api/files/${id}/preview`;
export const thumbnailUrl=id=>`${API_URL}/api/files/${id}/thumbnail`;
export const downloadUrl=id=>`${API_URL}/api/files/${id}/download`;

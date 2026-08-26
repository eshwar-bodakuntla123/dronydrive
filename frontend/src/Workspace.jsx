import React,{useEffect,useState} from 'react';
import {getProjects,getProject,createProject,uploadFile,previewUrl,thumbnailUrl,downloadUrl} from './api';
import PanoramaViewer from './PanoramaViewer';

function isPanorama(file){
 const ext=(file.extension||'').toLowerCase();
 const ratio=file.width && file.height ? file.width/file.height : 0;
 const isAllowed = ['.jpg','.jpeg','.png','.webp','.tif','.tiff'].includes(ext);
 if (!isAllowed) return false;
 if (ratio > 0) return ratio >= 1.7 && ratio <= 2.3;
 return file.is_image === true;
}

function bytes(n){if(!n)return '0 B';const u=['B','KB','MB','GB','TB'];const i=Math.min(u.length-1,Math.floor(Math.log(n)/Math.log(1024)));return `${(n/1024**i).toFixed(i?1:0)} ${u[i]}`}

function TiffViewer({file,onClose}){
 const [zoom,setZoom]=useState(1),[pos,setPos]=useState({x:0,y:0}),[drag,setDrag]=useState(null);
 const start=e=>{if(e.button===0)setDrag({sx:e.clientX,sy:e.clientY,bx:pos.x,by:pos.y})};
 const move=e=>{if(drag)setPos({x:drag.bx+e.clientX-drag.sx,y:drag.by+e.clientY-drag.sy})};
 return <div className="viewerOverlay">
  <div className="viewerHeader"><div><div className="viewerEyebrow">TIFF / GEOTIFF VIEWER</div><strong>{file.original_name}</strong><span>{file.width&&file.height?` · ${file.width} × ${file.height}`:''}</span></div><div className="viewerActions"><button onClick={()=>setZoom(z=>Math.max(.25,z-.25))}>−</button><span>{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(z=>Math.min(5,z+.25))}>+</button><button onClick={()=>{setZoom(1);setPos({x:0,y:0})}}>Fit</button><a href={downloadUrl(file.id)}>Download</a><button className="close" onClick={onClose}>Close</button></div></div>
  <div className="viewerCanvas" onMouseDown={start} onMouseMove={move} onMouseUp={()=>setDrag(null)} onMouseLeave={()=>setDrag(null)}><img src={previewUrl(file.id)} alt={file.original_name} draggable="false" style={{transform:`translate(${pos.x}px,${pos.y}px) scale(${zoom})`}}/></div>
  <div className="viewerInfo"><span>Original: {bytes(file.size_bytes)}</span><span>Type: {file.mime_type}</span>{file.crs&&<span>CRS: {file.crs}</span>} {file.bounds&&<span>Geo bounds available</span>}</div>
 </div>
}

export default function Workspace({onBack}){
 const [projects,setProjects]=useState([]),[selected,setSelected]=useState(null),[name,setName]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[progress,setProgress]=useState({}),[viewer,setViewer]=useState(null),[panorama,setPanorama]=useState(null);
 const load=async()=>{try{const p=await getProjects();setProjects(p);if(selected)setSelected(await getProject(selected.id));}catch(e){setError(e.message)}};
 useEffect(()=>{load()},[]);
 const add=async()=>{if(!name.trim())return;setBusy(true);try{const p=await createProject(name.trim());setName('');await load();setSelected(p)}catch(e){setError(e.message)}finally{setBusy(false)}};
 const choose=async p=>{try{setSelected(await getProject(p.id));setError('')}catch(e){setError(e.message)}};
 const upload=async e=>{const f=e.target.files?.[0];if(!f||!selected)return;try{setProgress(x=>({...x,[f.name]:0}));await uploadFile(selected.id,f,v=>setProgress(x=>({...x,[f.name]:v})));await load()}catch(err){setError(err.message)}finally{setProgress(x=>{const y={...x};delete y[f.name];return y});e.target.value=''}};
 return <div className="appShell"><aside className="sidebar"><div className="sideBrand"><span className="logoMark">D</span><strong>Dronydrive</strong></div><div className="sideLabel">WORKSPACE</div><button className="sideActive">Overview</button><button>Projects</button><button>Shared with me</button><button>Black Box</button><div className="sideLabel">ACCOUNT</div><button>Storage</button><button>Settings</button><div className="sideBottom"><div className="storageBar"><span/></div><small>Storage usage is calculated from uploaded project files.</small></div></aside>
 <main className="dashboard"><header className="dashHeader"><div><div className="tiny">DRONYDRIVE WORKSPACE</div><h1>Projects</h1></div><button className="backDash" onClick={onBack}>← Website</button></header>{error&&<div className="errorBox">{error}</div>}
 <section className="createProject"><input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="New project name…"/><button onClick={add} disabled={busy}>{busy?'Creating…':'Create project +'}</button></section>
 <section className="projectGrid">{!projects.length?<div className="empty"><strong>No projects yet.</strong><span>Create a project and upload your first drone dataset.</span></div>:projects.map(p=><button className={`projectCard ${selected?.id===p.id?'selected':''}`} key={p.id} onClick={()=>choose(p)}><div className="projectVisual"><div className="projectOrb"/><span>{String(p.id).padStart(2,'0')}</span></div><div className="projectCardBody"><strong>{p.name}</strong><small>{p.file_count} files · {bytes(p.storage_bytes)}</small></div></button>)}</section>
 {selected&&<section className="projectDetail"><div className="detailHeader"><div><div className="tiny">PROJECT</div><h2>{selected.name}</h2><p>{selected.description||'Drone project workspace'}</p></div><div className="detailActions"><span className="uploadHint">JPG/PNG/TIFF panorama at 2:1 ratio → 360° viewer</span><label className="uploadButton">+ Upload file<input type="file" accept=".jpg,.jpeg,.png,.webp,.tif,.tiff,.mp4,.mov,.obj,.fbx,.pdf,.zip" onChange={upload} hidden/></label></div></div>
 {Object.entries(progress).map(([n,v])=><div className="uploadProgress" key={n}><span>{n}</span><b>{v}%</b><div><i style={{width:`${v}%`}}/></div></div>)}
 <div className="fileTable"><div className="fileRow fileHead"><span>FILE</span><span>TYPE</span><span>SIZE</span><span>ACTION</span></div>{selected.files?.map(f=><div className="fileRow" key={f.id}><div className="fileName"><div className="fileThumb">{f.is_image?<img src={thumbnailUrl(f.id)} alt=""/>:<span>{f.extension.replace('.','').toUpperCase()}</span>}</div><div><strong>{f.original_name}</strong><small>{new Date(f.created_at).toLocaleString()}</small></div></div><span>{f.extension.replace('.','').toUpperCase()}</span><span>{bytes(f.size_bytes)}</span><div className="fileActions">{isPanorama(f)&&<button className="panoButton" onClick={()=>setPanorama(f)}>360° View</button>}<button className="viewButton" onClick={()=>setViewer(f)}>Open ↗</button></div></div>)}{!selected.files?.length&&<div className="empty">No files uploaded yet.</div>}</div></section>}
 </main>{viewer&&<TiffViewer file={viewer} onClose={()=>setViewer(null)}/>} {panorama&&<PanoramaViewer file={panorama} src={previewUrl(panorama.id)} onClose={()=>setPanorama(null)}/>}</div>
}

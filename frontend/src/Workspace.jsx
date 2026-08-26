import React,{useEffect,useMemo,useState} from "react";
import {getProjects,getProject,createProject,uploadFile,previewUrl,thumbnailUrl,downloadUrl} from "./api";
import PanoramaViewer from "./PanoramaViewer";

function bytes(n){if(!n)return "0 B";const u=["B","KB","MB","GB","TB"],i=Math.min(u.length-1,Math.floor(Math.log(n)/Math.log(1024)));return `${(n/1024**i).toFixed(i?1:0)} ${u[i]}`}
function isPanorama(f){const e=(f.extension||"").toLowerCase(),r=f.width&&f.height?f.width/f.height:0;return [".jpg",".jpeg",".png",".webp",".tif",".tiff"].includes(e) && r>=1.7 && r<=2.3;}
function isTiff(f){return [".tif",".tiff"].includes((f.extension||"").toLowerCase());}
function Icon({children}){return <span className="uiIcon">{children}</span>}

function TiffViewer({file,onClose}){
 const [zoom,setZoom]=useState(1),[pos,setPos]=useState({x:0,y:0}),[drag,setDrag]=useState(null);
 const start=e=>{if(e.button!==0)return;setDrag({sx:e.clientX,sy:e.clientY,bx:pos.x,by:pos.y})};
 const move=e=>{if(!drag)return;setPos({x:drag.bx+e.clientX-drag.sx,y:drag.by+e.clientY-drag.sy})};
 const wheel=e=>{e.preventDefault();setZoom(z=>Math.max(.25,Math.min(6,z+(e.deltaY<0?.15:-.15))))};
 const reset=()=>{setZoom(1);setPos({x:0,y:0})};
 return <div className="surveyViewer">
   <header className="surveyTop">
     <div className="surveyTitle"><button onClick={onClose} className="iconButton">←</button><div><span className="eyebrow">ORTHOMOSAIC / GEOTIFF</span><h3>{file.original_name}</h3></div></div>
     <div className="surveyTools"><span className="viewerChip">{file.width&&file.height?`${file.width.toLocaleString()} × ${file.height.toLocaleString()}`:"TIFF"}</span><button onClick={()=>setZoom(z=>Math.min(6,z+.15))}>＋</button><span>{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(z=>Math.max(.25,z-.15))}>−</button><button onClick={reset}>Fit</button><a href={downloadUrl(file.id)}>Download</a></div>
   </header>
   <div className="surveyBody">
     <aside className="surveyRail">
       <div className="railSection"><span>DATASET</span><strong>Orthomosaic</strong><small>{bytes(file.size_bytes)} · {file.extension?.toUpperCase()}</small></div>
       <div className="railSection"><span>LAYERS</span><label><i className="dot blue"/> Orthomosaic</label><label><i className="dot gray"/> Boundaries</label><label><i className="dot gray"/> Flight path</label></div>
       <div className="railSection"><span>VIEW</span><button onClick={reset}>Reset position</button><button onClick={()=>setZoom(1)}>100% scale</button></div>
       <div className="railHint">Drag to pan<br/>Scroll to zoom</div>
     </aside>
     <div className="surveyCanvas" onMouseDown={start} onMouseMove={move} onMouseUp={()=>setDrag(null)} onMouseLeave={()=>setDrag(null)} onWheel={wheel}>
       <div className="mapGrid"/>
       <img src={previewUrl(file.id)} alt={file.original_name} draggable="false" style={{transform:`translate(${pos.x}px,${pos.y}px) scale(${zoom})`}}/>
       <div className="mapHud topLeft"><b>ORTHOMOSAIC</b><span>LIVE PREVIEW</span></div>
       <div className="mapHud bottomLeft"><span>Source preview</span><span>{file.crs || "GeoTIFF"}</span></div>
       <div className="mapControls"><button onClick={()=>setZoom(z=>Math.min(6,z+.2))}>+</button><button onClick={()=>setZoom(z=>Math.max(.25,z-.2))}>−</button><button onClick={reset}>⌖</button></div>
     </div>
   </div>
 </div>
}

export default function Workspace({onBack}){
 const [projects,setProjects]=useState([]),[selected,setSelected]=useState(null),[name,setName]=useState(""),[error,setError]=useState(""),[upload,setUpload]=useState(null),[panorama,setPanorama]=useState(null),[viewer,setViewer]=useState(null),[view,setView]=useState("overview"),[search,setSearch]=useState("");
 const load=async()=>{try{setError("");const p=await getProjects();setProjects(p);if(selected?.id){const d=await getProject(selected.id);setSelected(d)}else if(p[0]){setSelected(await getProject(p[0].id))}}catch(e){setError(e.message||"Unable to connect to the Dronydrive API.")}};
 useEffect(()=>{load()},[]);
 const create=async()=>{if(!name.trim())return;try{const p=await createProject(name);setName("");setProjects(v=>[p,...v]);setSelected(await getProject(p.id));setView("projects")}catch(e){setError(e.message)}};
 const choose=async id=>{try{setSelected(await getProject(id));setView("projects")}catch(e){setError(e.message)}};
 const uploadOne=async e=>{const f=e.target.files?.[0];e.target.value="";if(!f||!selected)return;try{setUpload({name:f.name,p:0});await uploadFile(selected.id,f,p=>setUpload({name:f.name,p}));setUpload(null);setSelected(await getProject(selected.id));}catch(err){setUpload(null);setError(err.message)}};
 const filtered=useMemo(()=>selected?.files?.filter(f=>f.original_name.toLowerCase().includes(search.toLowerCase()))||[],[selected,search]);
 const stats={files:selected?.file_count||0,size:bytes(selected?.storage_bytes||0),projects:projects.length};
 return <div className="workspaceApp">
   <aside className="workspaceSide">
     <div className="sideTop"><div className="sideBrand"><span className="logoMark">D</span><b>Dronydrive</b></div><button className="collapseHint">⌘ K</button></div>
     <div className="sideGroup"><span>WORKSPACE</span>
       <button className={view==="overview"?"active":""} onClick={()=>setView("overview")}><Icon>⌂</Icon>Overview</button>
       <button className={view==="projects"?"active":""} onClick={()=>setView("projects")}><Icon>▦</Icon>Projects</button>
       <button><Icon>↗</Icon>Shared with me</button>
       <button><Icon>◌</Icon>Black Box</button>
     </div>
     <div className="sideGroup"><span>ACCOUNT</span><button><Icon>◉</Icon>Storage</button><button><Icon>⚙</Icon>Settings</button></div>
     <div className="storageWidget"><div><span>Storage</span><b>38%</b></div><div className="storageTrack"><i/></div><small>19 GB of 50 GB used</small></div>
     <button className="backWebsite" onClick={onBack}>← Website</button>
   </aside>

   <main className="workspaceMain">
     <header className="workspaceHeader">
       <div><span className="eyebrow">DRONYDRIVE WORKSPACE</span><h1>{view==="overview"?"Good morning.":view==="projects"?"Projects":"Workspace"}</h1><p>{view==="overview"?"Everything your drone team needs, in one place.":"Choose a project to inspect its datasets."}</p></div>
       <div className="headerActions"><button className="roundAction">⌕</button><button className="avatar">B</button></div>
     </header>

     {error&&<div className="workspaceError"><span>!</span>{error}<button onClick={()=>setError("")}>×</button></div>}

     {view==="overview" && <section className="overviewPage">
       <div className="overviewHero"><div><span className="eyebrow">PROJECT CONTROL CENTER</span><h2>Your data,<br/><span>with context.</span></h2><p>Open a project, upload a dataset and move directly into visual review.</p><button onClick={()=>setView("projects")}>Browse projects ↗</button></div><div className="overviewVisual"><div className="visualGlow"/>{selected?.files?.filter(f=>f.is_image).slice(0,4).map((f,i)=><img key={f.id} src={thumbnailUrl(f.id)} style={{"--i":i}} alt=""/>)}</div></div>
       <div className="statGrid"><article><span>PROJECTS</span><b>{stats.projects}</b><small>Active workspace</small></article><article><span>FILES</span><b>{stats.files}</b><small>Across selected project</small></article><article><span>STORAGE</span><b>{stats.size}</b><small>Current project</small></article><article><span>VIEWERS</span><b>02</b><small>360° + GeoTIFF</small></article></div>
       <div className="recentHeader"><div><span className="eyebrow">RECENT PROJECT</span><h2>{selected?.name || "No project yet"}</h2></div><button onClick={()=>setView("projects")}>View all →</button></div>
       {selected ? <div className="recentCard" onClick={()=>setView("projects")}><div className="recentThumb">{selected.files?.[0]&&<img src={thumbnailUrl(selected.files[0].id)} alt=""/>}</div><div><b>{selected.name}</b><p>{selected.file_count} files · {bytes(selected.storage_bytes)}</p></div><span>Open project ↗</span></div> : <div className="emptyState">Create your first project to start.</div>}
     </section>}

     {view==="projects" && <section className="projectsPage">
       <div className="projectToolbar"><div><span className="eyebrow">PROJECTS</span><h2>Project library</h2></div><div className="toolbarRight"><input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&create()} placeholder="New project name"/><button onClick={create}>Create project <b>+</b></button></div></div>
       <div className="projectCards">{projects.map(p=><button key={p.id} className={`projectTile ${selected?.id===p.id?"selected":""}`} onClick={()=>choose(p.id)}><span className="tileNumber">{String(p.id).padStart(2,"0")}</span><span className="tileIcon">◫</span><b>{p.name}</b><small>{p.file_count} files · {bytes(p.storage_bytes)}</small><em>Open ↗</em></button>)}{!projects.length&&<div className="emptyState">No projects yet. Create one above.</div>}</div>
       {selected && <div className="projectWorkspace">
         <div className="projectHeader"><div><span className="eyebrow">PROJECT / {String(selected.id).padStart(2,"0")}</span><h2>{selected.name}</h2><p>{selected.description||"Drone survey workspace"}</p></div><div className="projectHeaderActions"><label className="uploadMain"><input type="file" onChange={uploadOne} accept=".tif,.tiff,.jpg,.jpeg,.png,.webp,.mp4,.mov,.zip,.obj,.fbx,.pdf"/><span>＋ Upload dataset</span></label><button onClick={()=>setView("overview")}>Overview</button></div></div>
         {upload&&<div className="uploadBar"><span>Uploading <b>{upload.name}</b></span><div><i style={{width:`${upload.p}%`}}/></div><strong>{upload.p}%</strong></div>}
         <div className="datasetToolbar"><div className="datasetTabs"><button className={!search?"active":""} onClick={()=>setSearch("")}>All <b>{selected.files?.length||0}</b></button><button>360°</button><button>GeoTIFF</button><button>Media</button></div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search files…"/></div>
         <div className="datasetGrid">{filtered.map(f=><article className="datasetCard" key={f.id}>
           <div className="datasetPreview">{f.is_image?<img src={thumbnailUrl(f.id)} alt=""/>:<div className="fileType">{f.extension?.replace(".","").toUpperCase()}</div>}<span className="datasetBadge">{isTiff(f)?"ORTHO":isPanorama(f)?"360°":f.extension?.replace(".","").toUpperCase()}</span></div>
           <div className="datasetInfo"><b title={f.original_name}>{f.original_name}</b><span>{bytes(f.size_bytes)} · {f.width&&f.height?`${f.width.toLocaleString()}×${f.height.toLocaleString()}`:"Dataset"}</span></div>
           <div className="datasetActions">{isTiff(f)&&<button onClick={()=>setViewer(f)}>Open survey ↗</button>}{isPanorama(f)&&<button onClick={()=>setPanorama(f)}>360° view</button>}<a href={downloadUrl(f.id)}>Download</a></div>
         </article>)}{!filtered.length&&<div className="emptyState">No datasets match this view.</div>}</div>
       </div>}
     </section>}

   </main>
   {viewer&&<TiffViewer file={viewer} onClose={()=>setViewer(null)}/>}
   {panorama&&<PanoramaViewer file={panorama} src={previewUrl(panorama.id)} onClose={()=>setPanorama(null)}/>}
 </div>
}

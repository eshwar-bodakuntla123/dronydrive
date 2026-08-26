import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import Workspace from "./Workspace";
import HeroPanorama from "./HeroPanorama";
import FreePanoramaTool from "./FreePanoramaTool";

const media = [
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=88",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=88",
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1400&q=88",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=88",
  "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1400&q=88",
  "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1400&q=88",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1400&q=88",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=88"
];

function Logo({light=false}) {
  return (
    <a className={`logo ${light ? "logoLight" : ""}`} href="#top" aria-label="Dronydrive home">
      <span className="logoIcon"><i/><i/><i/></span>
      <span>DRONYDRIVE</span>
    </a>
  );
}

function SmartImage({src, alt, className=""}) {
  return <img className={className} src={src} alt={alt} loading="lazy"
    onError={e => { e.currentTarget.style.opacity = 0; }} />;
}

function useScrollProgress(ref) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const total = Math.max(1, el.offsetHeight - window.innerHeight);
      setP(Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total)));
    };
    window.addEventListener("scroll", update, {passive:true});
    update();
    return () => window.removeEventListener("scroll", update);
  }, [ref]);
  return p;
}

function DragGallery() {
  const ref = useRef(null);
  const [drag, setDrag] = useState({active:false,x:0,y:0,rx:0,ry:0});
  const pointer = useRef(null);

  const down = e => {
    pointer.current = {x:e.clientX,y:e.clientY,rx:drag.rx,ry:drag.ry};
    setDrag(d => ({...d,active:true}));
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const move = e => {
    if (!pointer.current) return;
    const dx = e.clientX - pointer.current.x;
    const dy = e.clientY - pointer.current.y;
    setDrag(d => ({...d,rx:Math.max(-22,Math.min(22,pointer.current.ry + dy*.05)),ry:Math.max(-34,Math.min(34,pointer.current.rx + dx*.07))}));
  };
  const up = () => { pointer.current=null; setDrag(d=>({...d,active:false})); };

  return (
    <div ref={ref} className={`heroGallery ${drag.active ? "isDragging" : ""}`}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up}>
      <div className="galleryGlow"/>
      <div className="galleryStage" style={{"--rx":`${drag.rx}deg`,"--ry":`${drag.ry}deg`}}>
        {media.map((src,i) => {
          const angle = (i/media.length)*Math.PI*2;
          const radius = 245 + (i%2)*22;
          const x = Math.cos(angle)*radius;
          const y = Math.sin(angle)*radius*.48;
          const z = Math.cos(angle)*80;
          return (
            <div key={src} className={`galleryCard card${i}`} style={{
              "--x":`${x}px`,"--y":`${y}px`,"--z":`${z}px`,
              "--rot":`${Math.sin(angle)*9}deg`,
              zIndex: 30 + Math.round(z)
            }}>
              <SmartImage src={src} alt="Drone survey preview"/>
              <span>{i%3===0 ? "ORTHO" : i%3===1 ? "360°" : "PHOTO"}</span>
            </div>
          );
        })}
        <div className="galleryCore">
          <div className="coreRing"/>
          <div className="coreLabel">DRONE<br/><b>DATA</b></div>
        </div>
      </div>
      <div className="dragBadge">
        <span className="dragCursor">↔</span>
        <span>{drag.active ? "Release to settle" : "Drag to explore"}</span>
      </div>
    </div>
  );
}

function ScrollShowcase() {
  const ref = useRef(null);
  const p = useScrollProgress(ref);
  const cards = media.slice(0,7);
  return (
    <section ref={ref} className="scrollShowcase">
      <div className="scrollSticky">
        <div className="scrollBackdrop"/>
        <div className="scrollCopy">
          <div className="eyebrow">ONE WORKSPACE. EVERY DATASET.</div>
          <h2>{p < .35 ? <>Your survey, <span>in context.</span></> :
            p < .7 ? <>See the detail.<br/><span>Keep the story.</span></> :
            <>From capture<br/><span>to delivery.</span></>}</h2>
          <p>{p < .7 ? "Move through the project without leaving the visual context behind." : "Store, review and share the data your team depends on."}</p>
        </div>
        <div className="scrollOrbit">
          {cards.map((src,i) => {
            const angle = (i/cards.length)*Math.PI*2 + p*5.2;
            const r = 210 + p*150;
            return <div key={src} className="orbitCard" style={{
              "--ox":`${Math.cos(angle)*r}px`,"--oy":`${Math.sin(angle)*r*.62}px`,
              "--os":`${.68 + p*.35}`,"--or":`${Math.sin(angle)*12}deg`
            }}><SmartImage src={src} alt="Drone data"/></div>;
          })}
        </div>
        <div className="scrollMetric"><b>{String(Math.round(p*100)).padStart(2,"0")}</b><span>SCROLL / EXPLORE</span></div>
      </div>
    </section>
  );
}

function Landing({onWorkspace}) {
  const [menu, setMenu] = useState(false);
  const scrollTo = id => {
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
  };

  return (
    <div id="top" className="site premiumSite">
      <header className="header heroHeader">
        <div className="nav">
          <Logo light/>
          <div className={`links ${menu ? "open" : ""}`}>
            <button onClick={()=>scrollTo("platform")}>Platform</button>
            <button onClick={()=>scrollTo("workflow")}>Workflow</button>
            <button onClick={()=>scrollTo("capabilities")}>Capabilities</button>
            <button onClick={()=>scrollTo("free-360")}>Free 360° viewer</button>
          </div>
          <div className="navCtas">
            <button className="ghost ghostLight" onClick={()=>scrollTo("contact")}>Talk to us</button>
            <button className="navWorkspace" onClick={onWorkspace}>Open workspace ↗</button>
          </div>
          <button className="hamb hambLight" onClick={()=>setMenu(v=>!v)} aria-label="Menu"><span/><span/></button>
        </div>
      </header>

      <main>
        <HeroPanorama
          onWorkspace={onWorkspace}
          onExplore={()=>scrollTo("platform")}
        />

        <section className="signalBar darkSignal">
          <span>DRONE DATA MANAGEMENT</span><i>✦</i><span>ORTHOMOSAIC REVIEW</span><i>✦</i><span>360° VIEWING</span><i>✦</i><span>SECURE DELIVERY</span>
        </section>

        <FreePanoramaTool />

        <section id="platform" className="platformIntro premiumIntro">
          <div>
            <div className="eyebrow">BUILT FOR THE WAY YOU WORK</div>
            <h2>Not a folder.<br/><span>A visual workspace.</span></h2>
          </div>
          <p>Keep the project, its files and its visual context together. Open a GeoTIFF as a survey, a panorama as a 360° scene, or a photo as a high-resolution asset.</p>
        </section>

        <ScrollShowcase/>

        <section id="workflow" className="workflowSection">
          <div className="sectionLabel">01 / CAPTURE → REVIEW → DELIVER</div>
          <div className="workflowGrid">
            <article><span>01</span><h3>Upload once.</h3><p>Bring your flight folders into a project and keep the original files intact.</p></article>
            <article><span>02</span><h3>Review visually.</h3><p>Inspect orthomosaics, 360° panoramas and media without leaving the workspace.</p></article>
            <article><span>03</span><h3>Deliver confidently.</h3><p>Give clients a clean project view instead of a messy download folder.</p></article>
          </div>
        </section>

        <section id="capabilities" className="capabilities">
          <div className="eyebrow">CAPABILITIES</div>
          <h2>Simple outside.<br/><span>Serious underneath.</span></h2>
          <div className="capGrid">
            {[
              ["01","GeoTIFF / Orthomosaic","High-resolution survey imagery with pan, zoom and metadata."],
              ["02","360° Panorama","Immersive drag-to-explore viewing directly in the browser."],
              ["03","Project memory","Files, dates, sizes and project context stay together."],
              ["04","Client delivery","A cleaner path from internal data to client-ready review."]
            ].map(x=><article key={x[0]}><small>{x[0]}</small><h3>{x[1]}</h3><p>{x[2]}</p><b>↗</b></article>)}
          </div>
        </section>

        <section id="pricing" className="pricingClean">
          <div className="eyebrow">PLANS</div>
          <h2>Start small.<br/><span>Scale with your flights.</span></h2>
          <div className="planGrid">
            {[["Starter","500 GB","₹2,499","For independent pilots"],["Pro","2 TB","₹7,499","For growing drone teams"],["Black Box","20 TB","₹3,499","For long-term archives"]].map((p,i)=>(
              <article className={i===1?"plan featured":"plan"} key={p[0]}>
                {i===1&&<label>MOST POPULAR</label>}<small>{p[0]}</small><strong>{p[1]}</strong><p>{p[3]}</p><div>{p[2]}<em>/mo</em></div><button onClick={onWorkspace}>Get started ↗</button>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="contactClean">
          <div className="contactAura"/>
          <div className="eyebrow">DRONYDRIVE</div>
          <h2>Your drone data<br/><span>deserves context.</span></h2>
          <p>A cleaner, more visual way to manage the work that comes back from every flight.</p>
          <button onClick={onWorkspace}>Open workspace ↗</button>
        </section>
      </main>

      <footer><Logo/><span>Drone data infrastructure, beautifully designed.</span><small>© 2026 Dronydrive</small></footer>
    </div>
  );
}

function App() {
  const [workspace,setWorkspace] = useState(()=>window.location.hash === "#workspace");
  useEffect(()=>{
    const sync=()=>setWorkspace(window.location.hash === "#workspace");
    window.addEventListener("hashchange",sync); return()=>window.removeEventListener("hashchange",sync);
  },[]);
  const open=()=>{window.location.hash="workspace";setWorkspace(true)};
  const close=()=>{window.location.hash="";setWorkspace(false)};
  return workspace ? <Workspace onBack={close}/> : <Landing onWorkspace={open}/>;
}
export default App;

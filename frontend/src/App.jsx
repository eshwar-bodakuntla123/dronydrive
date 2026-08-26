
import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import "./pro-landing.css";
import Workspace from "./Workspace";
import HeroPanorama from "./HeroPanorama";
import Free360Viewer from "./Free360Viewer";

const PANORAMA = "/assets/dronydrive-hero-360.jpg";

function Logo() {
  return (
    <a className="proLogo" href="#top" aria-label="Dronydrive home">
      <span className="proLogoMark">D</span>
      <span>DRONY<span>DRIVE</span></span>
    </a>
  );
}

function Reveal({ children, className="" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("is-visible"); },
      { threshold: 0.14 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`proReveal ${className}`}>{children}</div>;
}

function ScrollShowcase() {
  const ref = useRef(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const total = Math.max(1, el.offsetHeight - innerHeight);
      setP(Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total)));
    };
    addEventListener("scroll", update, {passive:true});
    update();
    return () => removeEventListener("scroll", update);
  }, []);

  const cards = [
    ["01","ORTHOMOSAIC","Survey context"],
    ["02","360°","Immersive view"],
    ["03","PHOTO","High resolution"],
    ["04","PROGRESS","Site history"],
    ["05","INSPECTION","Visual review"],
    ["06","REPORT","Client delivery"]
  ];

  return (
    <section ref={ref} className="proScrollStory" id="explore">
      <div className="proScrollSticky">
        <div className="storyBackdrop" />
        <div className="storyNoise" />
        <div className="storyHeader">
          <span>02 / VISUAL WORKSPACE</span>
          <b>{String(Math.round(p*100)).padStart(2,"0")}</b>
        </div>

        <div className="storyCopy">
          <span className="proKicker">ONE PROJECT. EVERY VIEW.</span>
          <h2>
            {p < .34 ? <>Keep the site<br/><em>in context.</em></> :
             p < .68 ? <>Move from<br/><em>detail to overview.</em></> :
             <>From capture<br/><em>to delivery.</em></>}
          </h2>
          <p>
            {p < .68
              ? "Your drone data stays connected to the place it describes."
              : "Review the work visually, then hand clients a cleaner experience."}
          </p>
        </div>

        <div className="proOrbit">
          {cards.map(([n,title,sub], i) => {
            const angle = (i/cards.length)*Math.PI*2 + p*Math.PI*2.2;
            const radius = 235 + p*85;
            const x = Math.cos(angle)*radius;
            const y = Math.sin(angle)*radius*.56;
            const front = (Math.cos(angle)+1)/2;
            return (
              <article
                key={n}
                className="proOrbitCard"
                style={{
                  "--x": `${x}px`,
                  "--y": `${y}px`,
                  "--scale": `${.74 + front*.24}`,
                  "--opacity": `${.32 + front*.68}`,
                  "--rotate": `${Math.sin(angle)*7}deg`,
                  zIndex: Math.round(front*20)
                }}
              >
                <div className="proCardImage">
                  <img src={PANORAMA} alt="" style={{objectPosition:`${(i*19)%100}% ${35+(i%3)*15}%`}} />
                  <span>{n}</span>
                </div>
                <strong>{title}</strong>
                <small>{sub}</small>
              </article>
            );
          })}
        </div>

        <div className="storyCenter">
          <div className="storyCenterImage">
            <img src={PANORAMA} alt="Dronydrive site panorama" />
            <div className="storyCenterShade" />
            <span>LIVE SITE VIEW</span>
          </div>
          <div className="storyRing" />
        </div>

        <div className="storyHint">SCROLL TO EXPLORE <i>↕</i></div>
      </div>
    </section>
  );
}

function Landing({onWorkspace}) {
  const [menu,setMenu] = useState(false);
  const go = id => {
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
  };

  return (
    <div id="top" className="proSite">
      <header className="proHeader">
        <div className="proNav">
          <Logo />
          <nav className={menu ? "open" : ""}>
            <button onClick={()=>go("platform")}>Platform</button>
            <button onClick={()=>go("explore")}>Experience</button>
            <button onClick={()=>go("free-360")}>Free 360°</button>
            <button onClick={()=>go("workflow")}>Workflow</button>
          </nav>
          <div className="proNavActions">
            <button className="proTextBtn" onClick={()=>go("contact")}>Contact</button>
            <button className="proPrimary small" onClick={onWorkspace}>Open workspace <span>↗</span></button>
          </div>
          <button className="proMenu" onClick={()=>setMenu(v=>!v)} aria-label="Menu">☰</button>
        </div>
      </header>

      <main>
        <HeroPanorama onWorkspace={onWorkspace} onExplore={()=>go("platform")} />

        <section className="proSignal">
          <span><i>●</i> DRONE DATA PLATFORM</span>
          <span>ORTHOMOSAICS</span>
          <span>360° PANORAMAS</span>
          <span>PROJECT MEMORY</span>
          <span>CLIENT DELIVERY</span>
        </section>

        <section id="platform" className="proIntro">
          <Reveal className="proIntroGrid">
            <div>
              <span className="proKicker">01 / THE PLATFORM</span>
              <h2>All the visual context.<br/><em>One workspace.</em></h2>
            </div>
            <div className="proIntroSide">
              <p>Stop treating drone output like a pile of files. Dronydrive keeps the capture, the project and the visual review connected.</p>
              <button onClick={onWorkspace} className="proLineBtn">Open a project <span>↗</span></button>
            </div>
          </Reveal>
        </section>

        <ScrollShowcase />

        <Reveal>
          <Free360Viewer />
        </Reveal>

        <section id="workflow" className="proWorkflow">
          <Reveal>
            <div className="proSectionTop">
              <span className="proKicker">03 / SIMPLE WORKFLOW</span>
              <span className="proSectionMeta">CAPTURE → REVIEW → DELIVER</span>
            </div>
            <div className="proWorkflowGrid">
              {[
                ["01","Bring it together","Upload the flight folder once. Keep originals, previews and project context together."],
                ["02","Explore visually","Open GeoTIFFs, 360° panoramas and media without leaving the project."],
                ["03","Share with confidence","Give clients a clean visual destination instead of a confusing download folder."]
              ].map(([n,t,d])=>(
                <article key={n}>
                  <span className="stepNo">{n}</span>
                  <div className="stepLine" />
                  <h3>{t}</h3>
                  <p>{d}</p>
                  <b>↗</b>
                </article>
              ))}
            </div>
          </Reveal>
        </section>

        <section className="proCapabilities">
          <Reveal>
            <div className="proSectionTop">
              <span className="proKicker">04 / CAPABILITIES</span>
              <span className="proSectionMeta">BUILT AROUND THE CAPTURE</span>
            </div>
            <div className="proCapabilitiesGrid">
              {[
                ["01","GeoTIFF / Orthomosaic","Pan, zoom and inspect high-resolution survey imagery."],
                ["02","360° Panorama","Explore a site naturally with drag-to-look viewing."],
                ["03","Project memory","Dates, files and visual context stay together."],
                ["04","Client delivery","A focused presentation layer for the people who need the result."]
              ].map(([n,t,d])=>(
                <article key={n}>
                  <span>{n}</span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                  <div className="capArrow">↗</div>
                </article>
              ))}
            </div>
          </Reveal>
        </section>

        <section id="contact" className="proFinal">
          <div className="proFinalImage"><img src={PANORAMA} alt="" /></div>
          <div className="proFinalShade" />
          <div className="proFinalContent">
            <span className="proKicker">DRONYDRIVE</span>
            <h2>Your drone data<br/><em>deserves context.</em></h2>
            <p>A visual home for the work that comes back from every flight.</p>
            <button className="proPrimary" onClick={onWorkspace}>Open workspace <span>↗</span></button>
          </div>
        </section>
      </main>

      <footer className="proFooter">
        <Logo />
        <span>Drone data infrastructure, beautifully designed.</span>
        <small>© 2026 Dronydrive</small>
      </footer>
    </div>
  );
}

export default function App() {
  const [workspace,setWorkspace] = useState(()=>location.hash === "#workspace");
  useEffect(()=>{
    const sync=()=>setWorkspace(location.hash === "#workspace");
    addEventListener("hashchange",sync);
    return()=>removeEventListener("hashchange",sync);
  },[]);
  const open=()=>{location.hash="workspace";setWorkspace(true)};
  const close=()=>{location.hash="";setWorkspace(false)};
  return workspace ? <Workspace onBack={close}/> : <Landing onWorkspace={open}/>;
}

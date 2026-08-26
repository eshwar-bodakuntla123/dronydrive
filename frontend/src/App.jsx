import React, { useEffect, useState } from "react";
import "./styles.css";
import Workspace from "./Workspace";
import HeroPanorama from "./HeroPanorama";
import FreePanoramaTool from "./FreePanoramaTool";

function Logo({ light = false }) {
  return (
    <a className={`logo ${light ? "logoLight" : ""}`} href="#top" aria-label="Dronydrive home">
      <span className="logoIcon"><i/><i/><i/></span>
      <span>DRONYDRIVE</span>
    </a>
  );
}

function MetricStrip() {
  return (
    <section className="metricStrip" aria-label="Dronydrive capabilities">
      <div><b>01</b><span>CAPTURE</span></div>
      <div><b>02</b><span>UNDERSTAND</span></div>
      <div><b>03</b><span>REVIEW</span></div>
      <div><b>04</b><span>DELIVER</span></div>
      <div className="metricStripNote">One visual workspace for the data that comes back from every flight.</div>
    </section>
  );
}

function PlatformSection({ onWorkspace }) {
  const items = [
    { n: "01", title: "Orthomosaics", text: "Open large survey imagery with a viewer built for pan, zoom and visual inspection.", tag: "GEOTIFF" },
    { n: "02", title: "360° scenes", text: "Turn a panorama into an immersive view without leaving the project context.", tag: "PANORAMA" },
    { n: "03", title: "Project memory", text: "Keep files, dates, sizes and visual assets together instead of scattering them across folders.", tag: "PROJECT" },
  ];

  return (
    <section id="platform" className="platformPro">
      <div className="platformProIntro">
        <div>
          <span className="sectionEyebrow">THE PLATFORM</span>
          <h2>Everything from the flight.<br/><em>One place to understand it.</em></h2>
        </div>
        <div className="platformProAside">
          <span className="asideLine" />
          <p>Dronydrive turns a folder of drone outputs into a visual project experience your team and clients can actually navigate.</p>
          <button onClick={onWorkspace}>Open workspace <b>↗</b></button>
        </div>
      </div>

      <div className="platformCards">
        {items.map((item) => (
          <article className="platformCard" key={item.n}>
            <div className="platformCardTop"><span>{item.n}</span><small>{item.tag}</small></div>
            <div className="platformCardVisual">
              <div className={`platformVisualArt art-${item.n}`}>
                <div className="visualGrid" />
                <div className="visualCore" />
                <span className="visualCoordinate">28°36' · 77°18'</span>
                <span className="visualMeasure">03.07 cm / px</span>
              </div>
            </div>
            <div className="platformCardBody">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span className="cardArrow">↗</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkflowSection() {
  const steps = [
    ["01", "Bring the flight in", "Create a project and keep the original outputs together."],
    ["02", "Open the right view", "Orthomosaic, 360°, photo or video — use the viewer that fits the data."],
    ["03", "Share the context", "Give clients a clean place to understand what the capture means."],
  ];
  return (
    <section id="workflow" className="workflowPro">
      <div className="workflowHeader">
        <span className="sectionEyebrow">HOW IT WORKS</span>
        <h2>Less file hunting.<br/><em>More useful review.</em></h2>
      </div>
      <div className="workflowSteps">
        {steps.map(([n, title, text], i) => (
          <article key={n} className="workflowStep">
            <div className="stepIndex">{n}</div>
            <div className="stepLine"><i style={{ width: `${i === 2 ? 100 : 52}%` }} /></div>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FinalCTA({ onWorkspace }) {
  return (
    <section id="contact" className="finalCtaPro">
      <div className="ctaImage" aria-hidden="true" />
      <div className="ctaOverlay" />
      <div className="finalCtaContent">
        <span className="sectionEyebrow">DRONYDRIVE</span>
        <h2>Your drone data<br/><em>deserves context.</em></h2>
        <p>A cleaner way to manage, inspect and present the work that comes back from every flight.</p>
        <div className="finalCtaActions">
          <button className="ctaPrimary" onClick={onWorkspace}>Open workspace <b>↗</b></button>
          <a className="ctaSecondary" href="#free-360">Try the free 360° viewer <b>↓</b></a>
        </div>
      </div>
      <div className="ctaFooterNote"><span>VISUAL DATA INFRASTRUCTURE</span><span>© 2026 DRONYDRIVE</span></div>
    </section>
  );
}

function Landing({ onWorkspace }) {
  const [menu, setMenu] = useState(false);
  const scrollTo = (id) => {
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div id="top" className="site premiumSite redesignedHome">
      <header className="header heroHeader redesignedHeader">
        <div className="nav">
          <Logo light />
          <div className={`links ${menu ? "open" : ""}`}>
            <button onClick={() => scrollTo("platform")}>Platform</button>
            <button onClick={() => scrollTo("workflow")}>Workflow</button>
            <button onClick={() => scrollTo("free-360")}>Free 360° viewer</button>
          </div>
          <div className="navCtas">
            <button className="ghost ghostLight" onClick={() => scrollTo("contact")}>Contact</button>
            <button className="navWorkspace" onClick={onWorkspace}>Open workspace ↗</button>
          </div>
          <button className="hamb hambLight" onClick={() => setMenu(v => !v)} aria-label="Menu"><span/><span/></button>
        </div>
      </header>

      <main>
        <HeroPanorama onWorkspace={onWorkspace} onExplore={() => scrollTo("platform")} />
        <MetricStrip />
        <PlatformSection onWorkspace={onWorkspace} />
        <WorkflowSection />
        <FreePanoramaTool />
        <FinalCTA onWorkspace={onWorkspace} />
      </main>
    </div>
  );
}

function App() {
  const [workspace, setWorkspace] = useState(() => window.location.hash === "#workspace");
  useEffect(() => {
    const sync = () => setWorkspace(window.location.hash === "#workspace");
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const open = () => { window.location.hash = "workspace"; setWorkspace(true); };
  const close = () => { window.location.hash = ""; setWorkspace(false); };
  return workspace ? <Workspace onBack={close} /> : <Landing onWorkspace={open} />;
}

export default App;

import React, { useEffect, useRef, useState } from "react";

const HERO_IMAGE = "/assets/dronydrive-hero-360.jpg";

const stages = [
  {
    eyebrow: "DRONYDRIVE / VISUAL DATA CLOUD",
    title: <>See the site.<br /><em>Understand the data.</em></>,
    body: "A visual workspace for drone surveys, orthomosaics, panoramas and the files behind every flight.",
    kicker: "01 / CAPTURE",
  },
  {
    eyebrow: "ONE PLACE FOR THE WHOLE FLIGHT",
    title: <>One capture.<br /><em>Multiple ways to explore.</em></>,
    body: "Move from the aerial view to the dataset itself without losing the context of the site.",
    kicker: "02 / CONTEXT",
  },
  {
    eyebrow: "FROM RAW FILES TO CLIENT REVIEW",
    title: <>Your data,<br /><em>with a point of view.</em></>,
    body: "Review orthomosaics, open 360° scenes and keep every project asset connected to the place it came from.",
    kicker: "03 / REVIEW",
  },
  {
    eyebrow: "DRONYDRIVE WORKSPACE",
    title: <>Capture less chaos.<br /><em>Deliver more clarity.</em></>,
    body: "A cleaner path from flight folder to a client-ready project experience.",
    kicker: "04 / DELIVER",
  },
];

export default function HeroPanorama({ onWorkspace, onExplore }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const pointerRef = useRef(null);
  const frameRef = useRef(0);
  const motionRef = useRef({
    scroll: 0,
    cursorX: 0,
    cursorY: 0,
    targetX: 0,
    targetY: 0,
    panX: 0,
    panY: 0,
    scale: 1.08,
    targetScale: 1.08,
  });
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setReady(true);
    img.onerror = () => setReady(false);
    img.src = HERO_IMAGE;

    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const distance = Math.max(1, el.offsetHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / distance));
      motionRef.current.scroll = progress;
      setStage(Math.min(stages.length - 1, Math.floor(progress * stages.length)));
    };

    const onResize = () => onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();

    const tick = () => {
      const m = motionRef.current;
      const p = m.scroll;
      const autoPan = (p - 0.5) * -210;
      const cursorPan = m.targetX;
      const cursorY = m.targetY;
      const desiredX = autoPan + cursorPan;
      const desiredY = cursorY + Math.sin(p * Math.PI * 2) * -7;
      const desiredScale = 1.08 + p * 0.13;

      m.panX += (desiredX - m.panX) * 0.065;
      m.panY += (desiredY - m.panY) * 0.065;
      m.scale += (desiredScale - m.scale) * 0.055;

      if (stageRef.current) {
        stageRef.current.style.setProperty("--pan-x", `${m.panX}px`);
        stageRef.current.style.setProperty("--pan-y", `${m.panY}px`);
        stageRef.current.style.setProperty("--hero-scale", m.scale.toFixed(4));
        stageRef.current.style.setProperty("--cursor-x", `${m.cursorX}%`);
        stageRef.current.style.setProperty("--cursor-y", `${m.cursorY}%`);
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const pointerDown = (event) => {
    const m = motionRef.current;
    pointerRef.current = { x: event.clientX, y: event.clientY, startX: m.targetX, startY: m.targetY };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
  };

  const pointerMove = (event) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    const m = motionRef.current;
    m.cursorX = nx * 100;
    m.cursorY = ny * 100;

    if (!pointerRef.current) {
      m.targetX = nx * -55;
      m.targetY = ny * -20;
      return;
    }

    const dx = event.clientX - pointerRef.current.x;
    const dy = event.clientY - pointerRef.current.y;
    m.targetX = Math.max(-250, Math.min(250, pointerRef.current.startX + dx * 0.8));
    m.targetY = Math.max(-45, Math.min(45, pointerRef.current.startY + dy * 0.28));
  };

  const pointerUp = () => {
    pointerRef.current = null;
    setDragging(false);
  };

  const resetView = () => {
    const m = motionRef.current;
    m.targetX = 0;
    m.targetY = 0;
    m.cursorX = 0;
    m.cursorY = 0;
  };

  const current = stages[stage];

  return (
    <section ref={sectionRef} className="panoramaStory">
      <div className="panoramaStorySticky">
        <div
          ref={stageRef}
          className={`panoramaHeroCanvas cinematicPanorama ${dragging ? "isDragging" : ""}`}
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerCancel={pointerUp}
          onPointerLeave={() => {
            pointerRef.current = null;
            setDragging(false);
          }}
          aria-label="Interactive aerial panorama"
        >
          <div className="panoramaBackdrop" aria-hidden="true" />
          <div className="panoramaImageWrap" aria-hidden="true">
            <img src={HERO_IMAGE} alt="Aerial drone panorama" draggable="false" />
          </div>
          <div className="panoramaVignette" aria-hidden="true" />
          <div className="panoramaCursorGlow" aria-hidden="true" />
        </div>

        <div className="panoramaHeroShade" />
        <div className="panoramaHeroGlow" />

        <div className="panoramaHeroChrome">
          <span><i /> LIVE VISUAL PREVIEW</span>
          <span>DRONE PANORAMA</span>
        </div>

        <div className="panoramaStoryProgress">
          {stages.map((item, index) => (
            <span key={item.kicker} className={index === stage ? "active" : ""} />
          ))}
        </div>

        <div className="panoramaHeroContent" key={stage}>
          <div className="eyebrow heroEyebrow">{current.eyebrow}</div>
          <div className="storyKicker">{current.kicker}</div>
          <h1>{current.title}</h1>
          <p>{current.body}</p>
          {stage === 0 ? (
            <div className="heroActions">
              <button className="heroPrimary" onClick={onWorkspace}>Open workspace <b>↗</b></button>
              <button className="heroSecondary" onClick={onExplore}>Explore the platform <b>↓</b></button>
            </div>
          ) : (
            <div className="storyHint"><span>↕</span> Keep scrolling to explore</div>
          )}
        </div>

        <div className="panoramaStoryFooter">
          <div className="panoramaInstruction">
            <span className="gestureIcon">↔</span>
            <span>{dragging ? "Release to settle" : "Move to explore · drag to pan"}</span>
          </div>
          <div className="panoramaMeta">
            <span>SCROLL / EXPLORE</span>
            <span>2048 × 1024</span>
            <button onClick={resetView}>Reset view</button>
          </div>
        </div>

        <div className="panoramaScrollCue"><span>SCROLL</span><i /></div>
        {!ready && <div className="panoramaHeroLoading">Loading visual environment…</div>}
      </div>
    </section>
  );
}

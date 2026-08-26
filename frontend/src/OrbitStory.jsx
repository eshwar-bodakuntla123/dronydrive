import React, { useEffect, useRef, useState } from 'react';

const cards = [
  { label:'ORTHOMOSAIC', title:'See the whole site.', image:'/assets/orbit/orbit-01.jpg' },
  { label:'360°', title:'Look around the capture.', image:'/assets/orbit/orbit-02.jpg' },
  { label:'SITE', title:'Keep the place in view.', image:'/assets/orbit/orbit-03.jpg' },
  { label:'DETAIL', title:'Move from context to detail.', image:'/assets/orbit/orbit-04.jpg' },
  { label:'PROGRESS', title:'Make every flight comparable.', image:'/assets/orbit/orbit-05.jpg' },
  { label:'REVIEW', title:'Give clients something to explore.', image:'/assets/orbit/orbit-06.jpg' },
  { label:'DELIVERY', title:'Turn capture into confidence.', image:'/assets/orbit/orbit-07.jpg' },
];

export default function OrbitStory({ onWorkspace }) {
  const sectionRef = useRef(null);
  const rafRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [pointer, setPointer] = useState({x:0,y:0});

  useEffect(() => {
    const update = () => {
      rafRef.current = null;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -rect.top / total));
      setProgress(p);
    };
    const onScroll = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const rotation = -28 + progress * 360 + pointer.x * 7;

  return (
    <section ref={sectionRef} className="orbitStory" aria-label="Visual data story">
      <div className="orbitSticky">
        <div className="orbitIntro">
          <span className="sectionEyebrow">ONE SITE · MANY VIEWS</span>
          <h2>Move through the<br/><em>whole story.</em></h2>
          <p>Scroll to rotate the capture. Each view brings another layer of the site into focus.</p>
        </div>

        <div
          className="orbitViewport"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setPointer({x:(e.clientX-r.left)/r.width-.5, y:(e.clientY-r.top)/r.height-.5});
          }}
          onMouseLeave={() => setPointer({x:0,y:0})}
        >
          <div className="orbitGlow" />
          <div className="orbitCore" style={{ transform:`translate(-50%,-50%) rotateX(${-pointer.y*2}deg) rotateY(${pointer.x*3}deg)` }}>
            <img src="/assets/dronydrive-hero-360.jpg" alt="Drone panorama" />
            <div className="orbitCoreShade" />
            <div className="orbitCoreMeta"><span>LIVE CAPTURE</span><span>2048 × 1024</span></div>
            <div className="orbitCoreCopy">
              <span>DRONYDRIVE</span>
              <strong>Context<br/>over files.</strong>
            </div>
          </div>

          <div className="orbitRing" style={{ transform:`translate(-50%,-50%) rotateY(${rotation}deg)` }}>
            {cards.map((card, i) => {
              const angle = i * (360 / cards.length);
              const facing = Math.cos(((angle + rotation) * Math.PI) / 180);
              const depth = Math.max(0, (facing + 1) / 2);
              return (
                <article
                  className="orbitCard"
                  key={card.label}
                  style={{
                    transform:`translate(-50%,-50%) rotateY(${angle}deg) translateZ(clamp(220px, 29vw, 370px)) rotateY(${-angle}deg) scale(${0.82 + depth*0.18})`,
                    opacity:0.22 + depth*0.78,
                    zIndex:Math.round(depth*100),
                    filter:`blur(${(1-depth)*1.8}px)`,
                  }}
                >
                  <div className="orbitCardImage"><img src={card.image} alt="" /></div>
                  <div className="orbitCardInfo"><small>{String(i+1).padStart(2,'0')} · {card.label}</small><strong>{card.title}</strong></div>
                </article>
              );
            })}
          </div>

          <div className="orbitAxis orbitAxisLeft" />
          <div className="orbitAxis orbitAxisRight" />
          <div className="orbitHint"><span>SCROLL</span><i /></div>
        </div>

        <div className="orbitFooter">
          <div><b>{String(Math.min(7, Math.floor(progress*7)+1)).padStart(2,'0')}</b><span>/ 07 VIEWS</span></div>
          <button onClick={onWorkspace}>Open workspace <b>↗</b></button>
        </div>
      </div>
    </section>
  );
}

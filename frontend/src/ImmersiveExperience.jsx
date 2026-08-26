import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function ImmersiveExperience({ onBack }) {
  const mountRef = useRef(null);
  const videoRef = useRef(null);
  const [mediaMode, setMediaMode] = useState("image");
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
  const [active, setActive] = useState("Overview");
  const [autoMove, setAutoMove] = useState(true);
  const [videoSrc, setVideoSrc] = useState(null);
  const autoRef = useRef(true);
  useEffect(() => { autoRef.current = autoMove; }, [autoMove]);
  const cameraState = useRef({ lon: 0, lat: 0, fov: 70, dragging: false, x: 0, y: 0, lon0: 0, lat0: 0, idle: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let raf;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, mount.clientWidth / mount.clientHeight, 0.1, 1100);
    camera.position.set(0, 0, 0.01);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(50, 96, 64);
    geometry.scale(-1, 1, 1);
    let texture;
    let videoEl;
    if (videoSrc) {
      videoEl = document.createElement("video");
      videoEl.src = videoSrc; videoEl.muted = true; videoEl.loop = true; videoEl.playsInline = true;
      videoEl.play().catch(() => {});
      texture = new THREE.VideoTexture(videoEl);
      texture.colorSpace = THREE.SRGBColorSpace;
      setLoaded(true);
    } else {
      texture = new THREE.TextureLoader().load("/assets/dronydrive-hero-360.jpg", () => setLoaded(true));
      texture.colorSpace = THREE.SRGBColorSpace;
    }
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.rotation.y = Math.PI;
    scene.add(sphere);

    const updateCamera = () => {
      const s = cameraState.current;
      const phi = THREE.MathUtils.degToRad(90 - THREE.MathUtils.clamp(s.lat, -78, 78));
      const theta = THREE.MathUtils.degToRad(s.lon);
      const target = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      );
      camera.lookAt(target);
      camera.fov = s.fov;
      camera.updateProjectionMatrix();
    };

    const resize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", resize);

    const down = e => {
      const s = cameraState.current;
      s.dragging = true; s.x = e.clientX; s.y = e.clientY; s.lon0 = s.lon; s.lat0 = s.lat;
      renderer.domElement.setPointerCapture?.(e.pointerId);
      renderer.domElement.style.cursor = "grabbing";
    };
    const move = e => {
      const s = cameraState.current;
      if (!s.dragging) return;
      s.lon = s.lon0 - (e.clientX - s.x) * 0.12;
      s.lat = THREE.MathUtils.clamp(s.lat0 + (e.clientY - s.y) * 0.09, -70, 70);
      setAutoMove(false);
    };
    const up = () => { cameraState.current.dragging = false; renderer.domElement.style.cursor = "grab"; };
    const wheel = e => {
      e.preventDefault();
      cameraState.current.fov = THREE.MathUtils.clamp(cameraState.current.fov + e.deltaY * 0.035, 42, 88);
    };
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointermove", move);
    renderer.domElement.addEventListener("pointerup", up);
    renderer.domElement.addEventListener("pointercancel", up);
    renderer.domElement.addEventListener("wheel", wheel, { passive: false });
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.style.touchAction = "none";

    const tick = () => {
      const s = cameraState.current;
      if (autoRef.current && !s.dragging) s.lon += 0.012;
      updateCamera();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      if (videoEl) { videoEl.pause(); videoEl.src = ""; }
      cancelAnimationFrame(raf); window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointerdown", down); renderer.domElement.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("pointerup", up); renderer.domElement.removeEventListener("pointercancel", up);
      renderer.domElement.removeEventListener("wheel", wheel);
      texture.dispose(); material.dispose(); geometry.dispose(); renderer.dispose(); mount.removeChild(renderer.domElement);
    };
  }, [videoSrc]);

  const reset = () => { cameraState.current.lon = 0; cameraState.current.lat = 0; cameraState.current.fov = 70; };
  const openVideo = () => { if (videoRef.current) videoRef.current.click(); };

  return (
    <div className="immersiveExperience">
      <div ref={mountRef} className="immersiveCanvas" />
      <div className="immersiveVignette" />
      <header className="immersiveHeader">
        <button className="immersiveBrand" onClick={onBack}><span className="immersiveMark">D</span><span>DRONYDRIVE</span></button>
        <div className="immersiveHeaderMeta"><span>TRIBECA / SITE EXPERIENCE</span><i/> <span>LIVE VIEW</span></div>
        <button className="immersiveClose" onClick={onBack}>Exit experience <b>↗</b></button>
      </header>

      <aside className={`experiencePanel ${menuOpen ? "open" : "closed"}`}>
        <div className="panelHandle" onClick={() => setMenuOpen(v => !v)}>{menuOpen ? "‹" : "›"}</div>
        {menuOpen && <>
          <div className="panelEyebrow">SITE EXPERIENCE</div>
          <h1>See the site.<br/><span>from every angle.</span></h1>
          <p>Explore the capture in context. Drag to look around or let the scene move with you.</p>
          <div className="experienceNav">
            {["Overview","Tower A","Tower B","Roads"].map(item => <button className={active === item ? "active" : ""} key={item} onClick={() => setActive(item)}><span>{active === item ? "●" : "○"}</span>{item}<b>↗</b></button>)}
          </div>
          <div className="panelBottom"><span>DATASET</span><strong>360° PANORAMA</strong><small>2048 × 1024 · EQUIRECTANGULAR</small></div>
        </>}
      </aside>

      <div className="experienceCompass"><div className="compassRing"><span>N</span><span>E</span><span>S</span><span>W</span><b>⌖</b></div></div>
      <div className="experienceHotspot hotspotA"><span>01</span><div><strong>Site overview</strong><small>Primary capture</small></div></div>
      <div className="experienceHotspot hotspotB"><span>02</span><div><strong>Construction zone</strong><small>Visual checkpoint</small></div></div>

      <div className="experienceControls">
        <button onClick={reset}>Reset <span>⌂</span></button>
        <button onClick={() => setAutoMove(v => !v)}>{autoMove ? "Pause" : "Auto"} <span>{autoMove ? "Ⅱ" : "▶"}</span></button>
        <button onClick={openVideo}>Use 360° video <span>＋</span></button>
        <input ref={videoRef} type="file" accept="video/mp4,video/webm" hidden onChange={e => { const file = e.target.files?.[0]; if (!file) return; const url = URL.createObjectURL(file); setVideoSrc(url); setMediaMode("video"); setAutoMove(false); }} />
      </div>
      <div className="experienceHint"><span>↔</span> Drag to explore <i>•</i> Scroll to zoom</div>
      <div className="experienceFooter"><span>DRONYDRIVE / IMMERSIVE VIEW</span><span>{active.toUpperCase()} · {loaded ? "READY" : "LOADING"}</span></div>
    </div>
  );
}

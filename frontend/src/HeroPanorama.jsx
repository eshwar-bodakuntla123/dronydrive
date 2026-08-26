import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const HERO_IMAGE = "/assets/dronydrive-hero-360.jpg";

export default function HeroPanorama({ onWorkspace, onExplore }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hint, setHint] = useState("Move to explore");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080b0e);

    const camera = new THREE.PerspectiveCamera(92, 1, 0.1, 100);
    camera.position.set(0, 0, 0.01);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x080b0e, 1);
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(50, 96, 64);
    // Render the inside of the sphere. Rotating the sphere moves the equirectangular seam
    // behind the viewer so the homepage never opens on the visible seam.
    const material = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.rotation.y = Math.PI;
    scene.add(sphere);

    const state = {
      yaw: 0,
      pitch: 0,
      targetYaw: 0,
      targetPitch: 0,
      pointerX: 0,
      pointerY: 0,
      dragging: false,
      downX: 0,
      downY: 0,
      startYaw: 0,
      startPitch: 0,
      lastInput: performance.now(),
    };

    const loader = new THREE.TextureLoader();
    loader.load(
      HERO_IMAGE,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        material.map = texture;
        material.needsUpdate = true;
        setReady(true);
      },
      undefined,
      () => setReady(false)
    );

    const resize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();
    window.addEventListener("resize", resize);

    const onPointerDown = (e) => {
      state.dragging = true;
      state.downX = e.clientX;
      state.downY = e.clientY;
      state.startYaw = state.targetYaw;
      state.startPitch = state.targetPitch;
      state.lastInput = performance.now();
      mount.setPointerCapture?.(e.pointerId);
      setDragging(true);
      setHint("Drag to explore");
    };

    const onPointerMove = (e) => {
      const rect = mount.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      state.lastInput = performance.now();

      if (state.dragging) {
        state.targetYaw = state.startYaw - (e.clientX - state.downX) * 0.0042;
        state.targetPitch = state.startPitch - (e.clientY - state.downY) * 0.0024;
        state.targetPitch = THREE.MathUtils.clamp(state.targetPitch, -0.95, 0.95);
        setHint("Release to settle");
      } else {
        // Small cursor steering: the panorama follows the cursor without fighting the user.
        state.pointerX = nx;
        state.pointerY = ny;
        state.targetYaw = nx * -0.24;
        state.targetPitch = ny * -0.10;
        setHint("Move to explore");
      }
    };

    const onPointerUp = () => {
      state.dragging = false;
      state.lastInput = performance.now();
      setDragging(false);
      setHint("Move to explore");
    };

    const onWheel = (e) => {
      e.preventDefault();
      camera.fov = THREE.MathUtils.clamp(camera.fov + e.deltaY * 0.025, 62, 105);
      camera.updateProjectionMatrix();
      state.lastInput = performance.now();
    };

    const reset = () => {
      state.targetYaw = 0;
      state.targetPitch = 0;
      camera.fov = 92;
      camera.updateProjectionMatrix();
      state.lastInput = performance.now();
    };

    mount.addEventListener("pointerdown", onPointerDown);
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerup", onPointerUp);
    mount.addEventListener("pointercancel", onPointerUp);
    mount.addEventListener("wheel", onWheel, { passive: false });
    sceneRef.current = { reset };

    let raf = 0;
    const animate = (time) => {
      const idle = time - state.lastInput > 2600 && !state.dragging;
      if (idle) {
        state.targetYaw += Math.sin(time * 0.00012) * 0.00018;
      }
      state.yaw += (state.targetYaw - state.yaw) * 0.055;
      state.pitch += (state.targetPitch - state.pitch) * 0.055;
      sphere.rotation.y = Math.PI + state.yaw;
      sphere.rotation.x = state.pitch;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointerdown", onPointerDown);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("pointercancel", onPointerUp);
      mount.removeEventListener("wheel", onWheel);
      material.map?.dispose();
      material.dispose();
      geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      scene.clear();
    };
  }, []);

  return (
    <section className="panoramaHero immersiveHeroFixed">
      <div ref={mountRef} className={`panoramaHeroCanvas immersive360Canvas ${dragging ? "isDragging" : ""}`} aria-label="Interactive 360 degree aerial panorama" />
      <div className="panoramaHeroShade" />
      <div className="panoramaHeroGlow" />

      <div className="panoramaHeroChrome">
        <span><i /> LIVE VISUAL PREVIEW</span>
        <span>360° PANORAMA</span>
      </div>

      <div className="panoramaHeroContent">
        <div className="eyebrow heroEyebrow">DRONYDRIVE / VISUAL DATA CLOUD</div>
        <h1>See the site.<br /><em>Understand the data.</em></h1>
        <p>A visual workspace for drone surveys, orthomosaics, panoramas and the files behind every flight.</p>
        <div className="heroActions">
          <button className="heroPrimary" onClick={onWorkspace}>Open workspace <b>↗</b></button>
          <button className="heroSecondary" onClick={onExplore}>Explore the platform <b>↓</b></button>
        </div>
      </div>

      <div className="panoramaHeroFooter">
        <div className="panoramaInstruction">
          <span className="gestureIcon">↔</span>
          <span>{dragging ? "Release to settle" : hint + " · drag to look around"}</span>
        </div>
        <div className="panoramaMeta">
          <span>TRUE 360°</span>
          <span>2048 × 1024</span>
          <button onClick={() => sceneRef.current?.reset()}>Reset view</button>
        </div>
      </div>

      {!ready && <div className="panoramaHeroLoading">Loading visual environment…</div>}
    </section>
  );
}

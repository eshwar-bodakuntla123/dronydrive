import React, {useEffect, useRef, useState} from "react";
import * as THREE from "three";

export default function PanoramaViewer({file, src, onClose}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(75);
  const dragRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101114);

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 0, 0.01);

    const renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: "high-performance"});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(50, 96, 64);
    geometry.scale(-1, 1, 1);

    const texture = new THREE.TextureLoader();
    texture.setCrossOrigin("anonymous");
    texture.load(
      src,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        const material = new THREE.MeshBasicMaterial({map: tex});
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        sceneRef.current = {scene, camera, renderer, geometry, sphere, texture: tex};
        setLoading(false);
      },
      undefined,
      () => {
        setLoading(false);
        setError("Unable to load this panorama. Make sure it is an equirectangular 360° image.");
      }
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

    const animate = () => {
      renderer.setAnimationLoop(() => renderer.render(scene, camera));
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      renderer.setAnimationLoop(null);
      const current = sceneRef.current;
      if (current?.sphere?.material?.map) current.sphere.material.map.dispose();
      if (current?.sphere?.material) current.sphere.material.dispose();
      geometry.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      sceneRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    const current = sceneRef.current;
    if (!current) return;
    current.camera.fov = zoom;
    current.camera.updateProjectionMatrix();
  }, [zoom]);

  const pointerDown = (e) => {
    dragRef.current = {x: e.clientX, y: e.clientY, lon: sceneRef.current?.sphere?.rotation.y || 0, lat: sceneRef.current?.sphere?.rotation.x || 0};
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const pointerMove = (e) => {
    const d = dragRef.current;
    const current = sceneRef.current;
    if (!d || !current?.sphere) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    current.sphere.rotation.y = d.lon + dx * 0.004;
    current.sphere.rotation.x = THREE.MathUtils.clamp(d.lat + dy * 0.004, -Math.PI * 0.49, Math.PI * 0.49);
  };

  const pointerUp = () => { dragRef.current = null; };

  const wheel = (e) => {
    e.preventDefault();
    setZoom(z => THREE.MathUtils.clamp(z + (e.deltaY > 0 ? 5 : -5), 35, 95));
  };

  const reset = () => {
    const current = sceneRef.current;
    if (current?.sphere) {
      current.sphere.rotation.set(0, 0, 0);
    }
    setZoom(75);
  };

  return (
    <div className="panoramaOverlay">
      <div className="panoramaTopbar">
        <div>
          <div className="viewerEyebrow">360° PANORAMA VIEWER</div>
          <strong>{file.original_name}</strong>
          <span>{file.width && file.height ? ` · ${file.width} × ${file.height}` : ""}</span>
        </div>
        <div className="panoramaActions">
          <button onClick={() => setZoom(z => Math.min(95, z + 5))}>＋</button>
          <span>{Math.round((75 / zoom) * 100)}%</span>
          <button onClick={() => setZoom(z => Math.max(35, z - 5))}>−</button>
          <button onClick={reset}>Reset view</button>
          <a href={src} target="_blank" rel="noreferrer">Open image</a>
          <button className="close" onClick={onClose}>Close</button>
        </div>
      </div>

      <div
        ref={mountRef}
        className="panoramaCanvas"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onPointerLeave={pointerUp}
        onWheel={wheel}
      >
        {loading && <div className="panoramaLoading">Loading 360° panorama…</div>}
        {error && <div className="panoramaError">{error}</div>}
        {!loading && !error && <div className="panoramaHint">Drag to look around · Scroll to zoom</div>}
      </div>
    </div>
  );
}

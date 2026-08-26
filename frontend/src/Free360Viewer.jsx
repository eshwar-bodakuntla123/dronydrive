
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./free360.css";

export default function Free360Viewer() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const choose = (f) => {
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(f.type)) {
      setMessage("Please choose a JPG, PNG or WebP equirectangular panorama.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setMessage("");
  };

  return (
    <section className="free360" id="free-360">
      <div className="free360-copy">
        <span className="section-kicker">FREE 360° VIEWER</span>
        <h2>See your panorama<br /><em>before you share it.</em></h2>
        <p>
          Drop a 360° image here and explore it instantly in your browser.
          Nothing is uploaded to Dronydrive.
        </p>
        <div className="free360-points">
          <span>✓ No sign up</span>
          <span>✓ No backend upload</span>
          <span>✓ Private in your browser</span>
        </div>
      </div>

      <div
        className="free360-drop"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          choose(e.dataTransfer.files?.[0]);
        }}
      >
        <div className="free360-icon">◎</div>
        <h3>{file ? file.name : "Drop your 360° image here"}</h3>
        <p>JPG, PNG or WebP · 2:1 equirectangular recommended</p>
        <label className="free360-button">
          Choose image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => choose(e.target.files?.[0])}
            hidden
          />
        </label>
        {file && (
          <button className="free360-view" onClick={() => setOpen(true)}>
            View 360° →
          </button>
        )}
        {message && <small className="free360-error">{message}</small>}
      </div>

      {open && previewUrl && (
        <Free360Modal
          src={previewUrl}
          name={file?.name || "Panorama"}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  );
}

function Free360Modal({ src, name, onClose }) {
  const mount = useRef(null);
  const [zoom, setZoom] = useState(72);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(72, 1, 0.1, 100);
    camera.position.set(0, 0, 0.01);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x050807, 1);
    el.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(50, 128, 80);
    const material = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    const texture = new THREE.TextureLoader().load(src, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      material.map = t;
      material.needsUpdate = true;
    });

    const state = { yaw: 0, pitch: 0, tyaw: 0, tpitch: 0, down: false, x: 0, y: 0 };

    const resize = () => {
      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const down = (e) => {
      state.down = true;
      state.x = e.clientX;
      state.y = e.clientY;
      renderer.domElement.setPointerCapture?.(e.pointerId);
    };
    const move = (e) => {
      if (!state.down) return;
      state.tyaw -= (e.clientX - state.x) * 0.004;
      state.tpitch = THREE.MathUtils.clamp(
        state.tpitch - (e.clientY - state.y) * 0.0025,
        -1.25,
        1.25
      );
      state.x = e.clientX;
      state.y = e.clientY;
    };
    const up = (e) => {
      state.down = false;
      renderer.domElement.releasePointerCapture?.(e.pointerId);
    };
    const wheel = (e) => {
      e.preventDefault();
      setZoom((z) => THREE.MathUtils.clamp(z + e.deltaY * 0.03, 45, 88));
    };

    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointermove", move);
    renderer.domElement.addEventListener("pointerup", up);
    renderer.domElement.addEventListener("pointercancel", up);
    renderer.domElement.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("resize", resize);
    resize();

    let raf;
    const render = () => {
      raf = requestAnimationFrame(render);
      state.yaw += (state.tyaw - state.yaw) * 0.09;
      state.pitch += (state.tpitch - state.pitch) * 0.09;
      camera.rotation.order = "YXZ";
      camera.rotation.y = state.yaw;
      camera.rotation.x = state.pitch;
      camera.fov = zoom;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("pointerup", up);
      renderer.domElement.removeEventListener("pointercancel", up);
      renderer.domElement.removeEventListener("wheel", wheel);
      texture.dispose();
      material.dispose();
      geometry.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, [src, zoom]);

  return (
    <div className="free360-modal">
      <div className="free360-toolbar">
        <div>
          <strong>FREE 360° VIEWER</strong>
          <span>{name}</span>
        </div>
        <div className="free360-toolbar-actions">
          <button onClick={() => setZoom(72)}>Reset</button>
          <button onClick={onClose}>Close ×</button>
        </div>
      </div>
      <div className="free360-canvas" ref={mount} />
      <div className="free360-help">Drag to look around · Scroll to zoom · Your image stays in your browser</div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}

function FreeViewer({ file, onClose }) {
  const mountRef = useRef(null);
  const stateRef = useRef(null);
  const dragRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fov, setFov] = useState(75);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !file?.url) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080b10);
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 0, 0.01);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(50, 96, 64);
    geometry.scale(-1, 1, 1);
    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      file.url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        const material = new THREE.MeshBasicMaterial({ map: tex });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        stateRef.current = { scene, camera, renderer, geometry, sphere, material, texture };
        setLoading(false);
      },
      undefined,
      () => {
        setLoading(false);
        setError("This file could not be rendered as an image. Try a JPEG, PNG or WebP panorama.");
      }
    );

    const resize = () => {
      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    window.addEventListener("resize", resize);
    renderer.setAnimationLoop(() => renderer.render(scene, camera));

    return () => {
      window.removeEventListener("resize", resize);
      renderer.setAnimationLoop(null);
      const current = stateRef.current;
      current?.texture?.dispose();
      current?.material?.dispose();
      geometry.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      stateRef.current = null;
    };
  }, [file]);

  useEffect(() => {
    if (!stateRef.current) return;
    stateRef.current.camera.fov = fov;
    stateRef.current.camera.updateProjectionMatrix();
  }, [fov]);

  const pointerDown = (event) => {
    const current = stateRef.current;
    if (!current?.sphere) return;
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      lon: current.sphere.rotation.y,
      lat: current.sphere.rotation.x,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
  };

  const pointerMove = (event) => {
    const d = dragRef.current;
    const current = stateRef.current;
    if (!d || !current?.sphere) return;
    const dx = event.clientX - d.x;
    const dy = event.clientY - d.y;
    current.sphere.rotation.y = d.lon + dx * 0.004;
    current.sphere.rotation.x = THREE.MathUtils.clamp(d.lat + dy * 0.004, -Math.PI * 0.49, Math.PI * 0.49);
  };

  const pointerUp = () => {
    dragRef.current = null;
    setDragging(false);
  };

  const wheel = (event) => {
    event.preventDefault();
    setFov((value) => THREE.MathUtils.clamp(value + (event.deltaY > 0 ? 5 : -5), 40, 95));
  };

  const reset = () => {
    const current = stateRef.current;
    if (current?.sphere) current.sphere.rotation.set(0, 0, 0);
    setFov(75);
  };

  return (
    <div className="freeViewerOverlay" role="dialog" aria-modal="true" aria-label="Free 360 degree viewer">
      <div className="freeViewerTopbar">
        <div className="freeViewerTitle">
          <span className="freeViewerPill">FREE 360° TOOL</span>
          <strong>{file.name}</strong>
          <small>{formatBytes(file.size)} · {file.width} × {file.height}</small>
        </div>
        <div className="freeViewerActions">
          <button onClick={() => setFov((v) => Math.max(40, v - 5))}>＋</button>
          <span>{Math.round((75 / fov) * 100)}%</span>
          <button onClick={() => setFov((v) => Math.min(95, v + 5))}>−</button>
          <button onClick={reset}>Reset</button>
          <button className="freeViewerClose" onClick={onClose}>Close</button>
        </div>
      </div>
      <div
        ref={mountRef}
        className={`freeViewerCanvas ${dragging ? "isDragging" : ""}`}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onPointerLeave={pointerUp}
        onWheel={wheel}
      >
        {loading && <div className="freeViewerStatus">Preparing your panorama…</div>}
        {error && <div className="freeViewerStatus freeViewerError">{error}</div>}
        {!loading && !error && <div className="freeViewerHint">Drag to look around · scroll to zoom</div>}
      </div>
      <div className="freeViewerPrivacy">Local preview only · your image is not uploaded to Dronydrive</div>
    </div>
  );
}

export default function FreePanoramaTool() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [viewerFile, setViewerFile] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    fileRef.current = file;
  }, [file]);

  useEffect(() => () => {
    if (fileRef.current?.url) URL.revokeObjectURL(fileRef.current.url);
  }, []);

  const prepareFile = (candidate) => {
    setError("");
    if (!candidate) return;
    if (!ACCEPTED.includes(candidate.type)) {
      setError("For the free viewer, use a JPEG, PNG or WebP image. TIFF files are not reliably decoded by browsers.");
      return;
    }
    if (fileRef.current?.url) URL.revokeObjectURL(fileRef.current.url);
    const url = URL.createObjectURL(candidate);
    const image = new Image();
    image.onload = () => {
      const ratio = image.width / image.height;
      const isLikelyPanorama = ratio >= 1.75 && ratio <= 2.25;
      setFile({ name: candidate.name, size: candidate.size, type: candidate.type, width: image.width, height: image.height, url, isLikelyPanorama });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setError("That image could not be read. Please choose a valid JPEG, PNG or WebP file.");
    };
    image.src = url;
  };

  const onInput = (event) => prepareFile(event.target.files?.[0]);
  const onDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    prepareFile(event.dataTransfer.files?.[0]);
  };

  const clear = () => {
    if (fileRef.current?.url) URL.revokeObjectURL(fileRef.current.url);
    fileRef.current = null;
    setFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const view = () => {
    if (!file) return;
    setViewerFile(file);
  };

  return (
    <>
      <section id="free-360" className="freeToolSection">
        <div className="freeToolGrid">
          <div className="freeToolCopy">
            <div className="eyebrow">FREE 360° VIEWER</div>
            <h2>See your panorama<br /><span>before you share it.</span></h2>
            <p>Drop a 360° image here and explore it instantly in your browser. No account, no upload and no file is sent to our servers.</p>
            <div className="freeToolBullets">
              <span><i>01</i> Drag to look around</span>
              <span><i>02</i> Scroll to zoom</span>
              <span><i>03</i> Runs locally in your browser</span>
            </div>
          </div>

          <div className={`freeToolDropzone ${dragOver ? "dragOver" : ""} ${file ? "hasFile" : ""}`}
            onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            {!file ? (
              <>
                <div className="freeToolIcon">360°</div>
                <strong>Drop a panorama here</strong>
                <span>JPEG, PNG or WebP · ideally 2:1 equirectangular</span>
                <button className="freeToolBrowse" onClick={() => inputRef.current?.click()}>Choose image</button>
                <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onInput} hidden />
                {error && <div className="freeToolError">{error}</div>}
              </>
            ) : (
              <>
                <div className="freeToolPreview">
                  <img src={file.url} alt="Selected panorama preview" />
                  <div className="freeToolPreviewShade" />
                  <span>{file.isLikelyPanorama ? "360° READY" : "CHECK ASPECT RATIO"}</span>
                </div>
                <div className="freeToolFileMeta">
                  <strong>{file.name}</strong>
                  <small>{file.width} × {file.height} · {formatBytes(file.size)}</small>
                </div>
                {!file.isLikelyPanorama && <div className="freeToolWarning">This image is not close to a 2:1 panorama ratio. You can still try it, but a true equirectangular image will look best.</div>}
                {error && <div className="freeToolError">{error}</div>}
                <div className="freeToolButtons">
                  <button className="freeToolBrowse" onClick={view}>View 360° ↗</button>
                  <button className="freeToolReplace" onClick={() => inputRef.current?.click()}>Choose another</button>
                  <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onInput} hidden />
                  <button className="freeToolClear" onClick={clear}>Remove</button>
                </div>
              </>
            )}
            <div className="freeToolPrivacy"><span>●</span> Local-only preview. Nothing is uploaded.</div>
          </div>
        </div>
      </section>
      {viewerFile && <FreeViewer file={viewerFile} onClose={() => setViewerFile(null)} />}
    </>
  );
}

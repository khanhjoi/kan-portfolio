"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function disposeHierarchy(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      const m = obj.material;
      if (Array.isArray(m)) m.forEach((x) => x.dispose());
      else m?.dispose();
    }
    if (obj instanceof THREE.Line || obj instanceof THREE.LineSegments) {
      obj.geometry?.dispose();
      (obj.material as THREE.Material).dispose?.();
    }
  });
}

export type ToastSceneProps = {
  /** Number of TOAST pages with visible chunks (2–6) */
  chunkCount?: number;
};

const MAX_CHUNKS = 6;

export default function ToastScene({ chunkCount = 4 }: ToastSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const count = Math.min(MAX_CHUNKS, Math.max(2, Math.round(chunkCount)));

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 320);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf2ede4);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 200);
    camera.position.set(-8, 6, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(2, 2.5, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 0.5);
    key.position.set(-10, 12, 8);
    scene.add(key);

    const ink = 0x0a0a0a;

    const mainShell = new THREE.Mesh(
      new THREE.BoxGeometry(7, 4.2, 1.2),
      new THREE.MeshStandardMaterial({ color: ink, roughness: 0.35 })
    );
    mainShell.position.set(-4.5, 3.3, 0);
    scene.add(mainShell);

    const heapPage = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 2.8, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xc8e6c9, roughness: 0.5 })
    );
    heapPage.position.set(-4.5, 3.5, 0.65);
    scene.add(heapPage);

    const pointer = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.65, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xff9800, emissive: 0xaa4400, emissiveIntensity: 0.15 })
    );
    pointer.position.set(-5.2, 3.55, 1.05);
    scene.add(pointer);

    const toastShell = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 8.2, 1),
      new THREE.MeshStandardMaterial({ color: ink, roughness: 0.35 })
    );
    toastShell.position.set(4.4, 4.2, 0);
    const shellStretch = 0.72 + count * 0.11;
    toastShell.scale.set(1, shellStretch, 1);
    scene.add(toastShell);

    const chunkCenters: THREE.Vector3[] = [];
    const chunkMeshes: THREE.Mesh[] = [];
    const arrows: THREE.ArrowHelper[] = [];

    for (let i = 0; i < MAX_CHUNKS; i++) {
      const page = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 1.35, 0.28),
        new THREE.MeshStandardMaterial({ color: 0xa5d6a7, roughness: 0.45 })
      );
      const y = 6.5 - i * 1.75;
      page.position.set(4.4, y, 0.55);
      page.visible = i < count;
      scene.add(page);

      const chunkCore = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.65, 0.34),
        new THREE.MeshStandardMaterial({ color: 0xffcc80, wireframe: true })
      );
      chunkCore.position.set(4.4, y - 0.05, 0.82);
      chunkCore.visible = i < count;
      scene.add(chunkCore);
      chunkMeshes.push(chunkCore);
      if (i < count) chunkCenters.push(chunkCore.position.clone());
    }

    chunkCenters.forEach((target) => {
      const start = pointer.position.clone().add(new THREE.Vector3(0.4, 0, 0.2));
      const dir = new THREE.Vector3().subVectors(target, start);
      const len = dir.length();
      dir.normalize();
      const arrow = new THREE.ArrowHelper(dir, start, len * 0.92, 0xff2800, len * 0.12, len * 0.09);
      scene.add(arrow);
      arrows.push(arrow);
    });

    let frame = 0;
    let t0 = performance.now();
    const loop = () => {
      frame = requestAnimationFrame(loop);
      const t = (performance.now() - t0) / 1000;
      const spin = 0.1 + count * 0.018;
      chunkMeshes.forEach((m, i) => {
        if (!m.visible) return;
        m.rotation.y = Math.sin(t * 0.9 + i * 0.7) * spin;
        m.rotation.x = Math.sin(t * 0.55 + i * 0.4) * (spin * 0.35);
      });
      pointer.scale.setScalar(1 + Math.sin(t * 2.2) * 0.035 + count * 0.004);
      controls.update();
      renderer.render(scene, camera);
    };
    loop();

    const onResize = () => {
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 320);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      disposeHierarchy(scene);
      arrows.forEach((arrow) => {
        arrow.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry?.dispose();
            const mat = obj.material;
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else mat?.dispose();
          }
        });
      });
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, [count]);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "min(520px, 70vh)",
        minHeight: "320px",
        border: "2.5px solid #0A0A0A",
        borderRadius: "2px",
        overflow: "hidden",
      }}
      role="img"
      aria-label="Interactive 3D diagram of PostgreSQL TOAST out-of-line storage"
    />
  );
}

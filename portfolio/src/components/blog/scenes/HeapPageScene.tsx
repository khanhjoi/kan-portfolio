"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function disposeObject(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      const m = obj.material;
      if (Array.isArray(m)) m.forEach((x) => x.dispose());
      else m?.dispose();
    } else if (obj instanceof THREE.Line || obj instanceof THREE.LineSegments) {
      obj.geometry?.dispose();
      const m = obj.material as THREE.Material | THREE.Material[];
      if (Array.isArray(m)) m.forEach((x) => x.dispose());
      else m?.dispose();
    }
  });
}

export type HeapPageSceneProps = {
  /** 0 = generous free space, 1 = corridor nearly consumed */
  fillRatio?: number;
};

export default function HeapPageScene({ fillRatio = 0.28 }: HeapPageSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fillRef = useRef(fillRatio);
  fillRef.current = fillRatio;

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 320);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf2ede4);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 200);
    camera.position.set(7.2, 6.5, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 2.2, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 0.45);
    sun.position.set(6, 14, 8);
    scene.add(sun);

    const ink = 0x0a0a0a;
    const cream = 0xf2ede4;
    const edgeMat = new THREE.LineBasicMaterial({ color: ink });

    const pageDepth = 0.35;
    const pageW = 8;
    const pageH = 5;
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(pageW, pageH, pageDepth),
      new THREE.MeshStandardMaterial({ color: cream, roughness: 0.55, metalness: 0.05 })
    );
    slab.position.set(0, pageH / 2, 0);
    scene.add(slab);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(pageW, pageH, pageDepth)),
      edgeMat
    );
    edges.position.copy(slab.position);
    scene.add(edges);

    const header = new THREE.Mesh(
      new THREE.BoxGeometry(pageW * 0.42, 0.55, pageDepth * 0.9),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.4 })
    );
    header.position.set(-pageW * 0.22, pageH - 0.55, pageDepth * 0.6);
    scene.add(header);

    const itemColors = [0xe53935, 0x1e88e5, 0x43a047];
    const itemLabels = ["ItemId 1", "ItemId 3", "ItemId 2"];
    const itemMeshes: THREE.Mesh[] = [];
    const tupleMeshes: THREE.Mesh[] = [];

    const rowY = pageH - 1.35;
    const slots = [-2.2, 0, 2.2];
    slots.forEach((x, i) => {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.55, 0.45),
        new THREE.MeshStandardMaterial({ color: itemColors[i], roughness: 0.35 })
      );
      cube.position.set(x, rowY, pageDepth * 1.1);
      cube.userData.label = itemLabels[i];
      scene.add(cube);
      itemMeshes.push(cube);

      const tuple = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.75, 0.45),
        new THREE.MeshStandardMaterial({ color: itemColors[i], roughness: 0.35, opacity: 0.92, transparent: true })
      );
      const tupleX = [-2.4 + i * 0.5, 1.6 - i * 1.1, -0.4][i];
      tuple.position.set(tupleX, 1.05 + i * 0.08, pageDepth * 1.1);
      scene.add(tuple);
      tupleMeshes.push(tuple);
    });

    const freeGeom = new THREE.BoxGeometry(pageW * 0.72, 1.65, pageDepth * 0.5);
    const freeMat = new THREE.MeshStandardMaterial({
      color: cream,
      transparent: true,
      opacity: 0.35,
      roughness: 0.9,
    });
    const freeSpace = new THREE.Mesh(freeGeom, freeMat);
    freeSpace.position.set(0.3, (pageH / 2) - 0.25, pageDepth * 0.85);
    scene.add(freeSpace);
    const freeEdges = new THREE.LineSegments(new THREE.EdgesGeometry(freeGeom), new THREE.LineDashedMaterial({
      color: ink,
      dashSize: 0.22,
      gapSize: 0.14,
    }));
    freeEdges.computeLineDistances();
    freeEdges.position.copy(freeSpace.position);
    scene.add(freeEdges);

    const special = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.05, pageDepth * 0.9),
      new THREE.MeshStandardMaterial({ color: 0xbdbdbd, roughness: 0.45 })
    );
    special.position.set(pageW / 2 - 1.15, 1.05, pageDepth * 0.9);
    scene.add(special);

    itemMeshes.forEach((slot, i) => {
      const a = new THREE.Vector3().copy(slot.position);
      const b = new THREE.Vector3().copy(tupleMeshes[i].position);
      a.z += 0.1;
      b.z += 0.1;
      const geom = new THREE.BufferGeometry().setFromPoints([a, b]);
      const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.55 }));
      scene.add(line);
    });

    const baseFreeY = 1;
    let frame = 0;
    let t0 = performance.now();
    const loop = () => {
      frame = requestAnimationFrame(loop);
      const t = (performance.now() - t0) / 1000;
      const breathe = 1 + Math.sin(t * 1.4) * 0.04;
      const fr = Math.min(1, Math.max(0, fillRef.current));
      const squeeze = 1 - fr * 0.62;
      freeSpace.scale.set(breathe, breathe * squeeze * baseFreeY, 1);
      freeEdges.scale.copy(freeSpace.scale);

      const stress = fr;
      itemMeshes.forEach((m, i) => {
        const mat = m.material as THREE.MeshStandardMaterial;
        const wobble = 1 + Math.sin(t * (2.6 + stress * 2) + i * 1.1) * (0.02 + stress * 0.07);
        m.scale.setScalar(wobble);
        mat.emissive.setHex(0xff2800);
        mat.emissiveIntensity = stress * (0.08 + Math.sin(t * 3.5 + i) * 0.045);
      });
      tupleMeshes.forEach((m, i) => {
        const mat = m.material as THREE.MeshStandardMaterial;
        const wobble = 1 + Math.sin(t * 2.1 + stress * 1.4 + i * 0.9) * (0.015 + stress * 0.05);
        m.scale.setScalar(wobble);
        mat.emissive.setHex(0x111111);
        mat.emissiveIntensity = stress * (0.06 + Math.sin(t * 2.8 + i) * 0.035);
      });

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
      disposeObject(scene);
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, []);

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
      aria-label="Interactive 3D diagram of a PostgreSQL heap page layout"
    />
  );
}

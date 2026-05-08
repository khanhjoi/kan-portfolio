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

export type BufferFlowMode = "auto" | "hit" | "miss";

export type SharedBuffersSceneProps = {
  flowMode?: BufferFlowMode;
};

export default function SharedBuffersScene({ flowMode = "auto" }: SharedBuffersSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const modeRef = useRef(flowMode);
  modeRef.current = flowMode;

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 320);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf2ede4);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 200);
    camera.position.set(-2, 7.5, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(4, 3.5, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.82));
    const dl = new THREE.DirectionalLight(0xffffff, 0.55);
    dl.position.set(-6, 14, 10);
    scene.add(dl);

    const ink = 0x0a0a0a;

    const client = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.6, 1),
      new THREE.MeshStandardMaterial({ color: 0x81c784, roughness: 0.42 })
    );
    client.position.set(-9, 4.5, 0);
    scene.add(client);

    const serverShell = new THREE.Mesh(
      new THREE.BoxGeometry(14, 8.5, 4),
      new THREE.MeshStandardMaterial({
        color: 0xe0e0e0,
        transparent: true,
        opacity: 0.22,
        roughness: 0.55,
        metalness: 0.08,
      })
    );
    serverShell.position.set(4.5, 4.5, 0);
    scene.add(serverShell);

    const serverEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(14, 8.5, 4)),
      new THREE.LineBasicMaterial({ color: ink })
    );
    serverEdges.position.copy(serverShell.position);
    scene.add(serverEdges);

    const sharedBuffers = new THREE.Mesh(
      new THREE.BoxGeometry(11, 1.8, 2.6),
      new THREE.MeshStandardMaterial({ color: 0x42a5f5, roughness: 0.38 })
    );
    sharedBuffers.position.set(4.5, 7.8, 0);
    scene.add(sharedBuffers);

    const logicPlane = new THREE.Mesh(
      new THREE.BoxGeometry(11, 3.2, 2.4),
      new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.55 })
    );
    logicPlane.position.set(4.5, 4.3, 0);
    scene.add(logicPlane);

    const bgWriter = new THREE.Mesh(
      new THREE.BoxGeometry(11, 0.9, 2.4),
      new THREE.MeshStandardMaterial({ color: 0xbdbdbd, roughness: 0.45 })
    );
    bgWriter.position.set(4.5, 2.25, 0);
    scene.add(bgWriter);

    const wal = new THREE.Mesh(
      new THREE.BoxGeometry(11, 0.85, 2.4),
      new THREE.MeshStandardMaterial({ color: 0xff7043, roughness: 0.4 })
    );
    wal.position.set(4.5, 1.05, 0);
    scene.add(wal);

    const disk = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.2, 0.85, 40),
      new THREE.MeshStandardMaterial({ color: 0x9e9e9e, roughness: 0.35, metalness: 0.25 })
    );
    disk.rotation.z = Math.PI / 2;
    disk.position.set(17.5, 3.8, 0);
    scene.add(disk);

    const diskEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.CylinderGeometry(2.2, 2.2, 0.85, 40)),
      new THREE.LineBasicMaterial({ color: ink })
    );
    diskEdges.rotation.copy(disk.rotation);
    diskEdges.position.copy(disk.position);
    scene.add(diskEdges);

    const packetGeom = new THREE.SphereGeometry(0.28, 24, 24);
    const packetHitMat = new THREE.MeshStandardMaterial({ color: 0x43a047, emissive: 0x1b5e20, emissiveIntensity: 0.25 });
    const packetMissMat = new THREE.MeshStandardMaterial({ color: 0xff9800, emissive: 0xe65100, emissiveIntensity: 0.2 });
    const packet = new THREE.Mesh(packetGeom, packetMissMat);
    scene.add(packet);

    const clientPos = client.position.clone().add(new THREE.Vector3(1.2, 0, 0));
    const bufferEntry = sharedBuffers.position.clone().add(new THREE.Vector3(-4, -0.9, 1.4));
    const bufferExit = sharedBuffers.position.clone().add(new THREE.Vector3(3.2, -1.1, -1.3));
    const diskSlot = disk.position.clone().add(new THREE.Vector3(-2.4, 0.9, 0));

    const curveHit = new THREE.CatmullRomCurve3([
      clientPos,
      clientPos.clone().lerp(bufferEntry, 0.35),
      bufferEntry,
      bufferEntry.clone().lerp(clientPos, 0.38),
      clientPos,
    ]);

    const curveMissOut = new THREE.CatmullRomCurve3([
      clientPos,
      clientPos.clone().lerp(bufferEntry, 0.28),
      bufferEntry,
      diskSlot,
    ]);

    const curveMissBack = new THREE.CatmullRomCurve3([
      diskSlot,
      diskSlot.clone().lerp(bufferExit, 0.45),
      bufferExit,
      clientPos,
    ]);

    let frame = 0;
    let t0 = performance.now();
    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      const now = (performance.now() - t0) / 1000;
      const cycle = now % 14;
      const mode = modeRef.current;
      let hitPhase = cycle < 7;
      if (mode === "hit") hitPhase = true;
      if (mode === "miss") hitPhase = false;

      packet.material = hitPhase ? packetHitMat : packetMissMat;

      let u = 0;
      if (hitPhase) {
        const span = mode === "auto" ? 7 : 14;
        u = (now % span) / span;
        if (u >= 1) u = 0.999;
        packet.position.copy(curveHit.getPoint(u));
      } else {
        const sub = mode === "auto" ? cycle - 7 : (now % 7);
        if (sub < 3.5) {
          u = sub / 3.5;
          packet.position.copy(curveMissOut.getPoint(Math.min(1, u)));
        } else {
          u = (sub - 3.5) / 3.5;
          packet.position.copy(curveMissBack.getPoint(Math.min(1, u)));
        }
      }

      serverShell.rotation.y = Math.sin(now * 0.35) * 0.02;
      serverEdges.rotation.copy(serverShell.rotation);
      bgWriter.position.y = 2.25 + Math.sin(now * 1.7) * 0.04;

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
      packetGeom.dispose();
      packetHitMat.dispose();
      packetMissMat.dispose();
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
      aria-label="Interactive 3D diagram of PostgreSQL shared buffers, disk, and query flow"
    />
  );
}

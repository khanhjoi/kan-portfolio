"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const INK = 0x0a0a0a;
const ACCENT = 0xff2800;
const HIGHLIGHT = 0xffe500;
const PAPER = 0xf2ede4;

type NodeDef = {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  kind: "gateway" | "service" | "database";
};

const NODES: NodeDef[] = [
  { id: "gateway", label: "Gateway", x: -2.35, y: 0.05, z: 0.55, kind: "gateway" },
  { id: "users", label: "Users", x: -0.78, y: 0.22, z: 0.1, kind: "service" },
  { id: "orders", label: "Orders", x: 0.78, y: -0.08, z: -0.15, kind: "service" },
  { id: "db", label: "Postgres", x: 2.35, y: 0.12, z: -0.55, kind: "database" },
];

const LABEL_POSITIONS: Record<string, string> = {
  gateway: "14%",
  users: "36%",
  orders: "58%",
  db: "82%",
};

export default function BlogThreeBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / Math.max(height, 1), 0.1, 100);
    camera.position.set(0.2, 0.85, 5.4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.72));
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
    keyLight.position.set(-3, 4, 6);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffe8cc, 0.35);
    fillLight.position.set(4, -2, 2);
    scene.add(fillLight);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    const trackGeometry = (geometry: THREE.BufferGeometry) => {
      geometries.push(geometry);
      return geometry;
    };

    const trackMaterial = (material: THREE.Material) => {
      materials.push(material);
      return material;
    };

    const pipeline = new THREE.Group();
    scene.add(pipeline);

    const nodeMeshes: THREE.Mesh[] = [];
    const nodePositions: THREE.Vector3[] = [];

    const addSolidNode = (
      geometry: THREE.BufferGeometry,
      fill: number,
      position: THREE.Vector3,
      emissive = 0x000000
    ) => {
      const mesh = new THREE.Mesh(
        trackGeometry(geometry),
        trackMaterial(
          new THREE.MeshStandardMaterial({
            color: fill,
            roughness: 0.45,
            metalness: 0.08,
            emissive,
            emissiveIntensity: 0.15,
          })
        )
      );
      mesh.position.copy(position);

      const outline = new THREE.LineSegments(
        trackGeometry(new THREE.EdgesGeometry(geometry)),
        trackMaterial(new THREE.LineBasicMaterial({ color: INK }))
      );
      mesh.add(outline);
      pipeline.add(mesh);
      return mesh;
    };

    NODES.forEach((node) => {
      const position = new THREE.Vector3(node.x, node.y, node.z);
      nodePositions.push(position);

      if (node.kind === "database") {
        nodeMeshes.push(
          addSolidNode(new THREE.CylinderGeometry(0.28, 0.28, 0.55, 18), INK, position)
        );
        return;
      }

      const size = node.kind === "gateway" ? 0.58 : 0.5;
      const fill = node.kind === "gateway" ? ACCENT : node.id === "orders" ? HIGHLIGHT : PAPER;
      nodeMeshes.push(addSolidNode(new THREE.BoxGeometry(size, size, size), fill, position));
    });

    for (let i = 0; i < nodePositions.length - 1; i++) {
      const start = nodePositions[i].clone();
      const end = nodePositions[i + 1].clone();
      const direction = end.clone().sub(start).normalize();
      start.add(direction.clone().multiplyScalar(0.34));
      end.sub(direction.clone().multiplyScalar(0.34));

      const mid = start.clone().lerp(end, 0.5);
      mid.y += 0.18;

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(24);
      const line = new THREE.Line(
        trackGeometry(new THREE.BufferGeometry().setFromPoints(points)),
        trackMaterial(
          new THREE.LineDashedMaterial({
            color: INK,
            dashSize: 0.1,
            gapSize: 0.07,
            transparent: true,
            opacity: 0.5,
          })
        )
      );
      line.computeLineDistances();
      pipeline.add(line);
    }

    const requestDot = new THREE.Mesh(
      trackGeometry(new THREE.SphereGeometry(0.11, 16, 16)),
      trackMaterial(
        new THREE.MeshStandardMaterial({
          color: ACCENT,
          emissive: ACCENT,
          emissiveIntensity: 0.45,
          roughness: 0.25,
          metalness: 0.2,
        })
      )
    );
    pipeline.add(requestDot);

    const pathCurves = nodePositions.slice(0, -1).map((start, index) => {
      const end = nodePositions[index + 1];
      const a = start.clone();
      const b = end.clone();
      const direction = b.clone().sub(a).normalize();
      a.add(direction.clone().multiplyScalar(0.34));
      b.sub(direction.clone().multiplyScalar(0.34));
      const mid = a.clone().lerp(b, 0.5);
      mid.y += 0.18;
      return new THREE.QuadraticBezierCurve3(a, mid, b);
    });

    let frameId = 0;
    let progress = 0;

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      const time = performance.now() * 0.001;

      pipeline.rotation.y = Math.sin(time * 0.35) * 0.28;
      pipeline.rotation.x = Math.sin(time * 0.25) * 0.08;

      progress = (progress + 0.0026) % pathCurves.length;
      const segment = Math.floor(progress);
      const localT = progress - segment;
      const curve = pathCurves[segment];
      requestDot.position.copy(curve.getPoint(localT));

      nodeMeshes.forEach((mesh, index) => {
        const active = segment === index || (segment + 1 === index && localT > 0.45);
        const scale = active ? 1.08 : 1;
        mesh.scale.setScalar(scale);

        const material = mesh.material as THREE.MeshStandardMaterial;
        if (active) {
          material.emissive.setHex(index === 0 ? ACCENT : index === 2 ? HIGHLIGHT : 0x222222);
          material.emissiveIntensity = index === 0 || index === 2 ? 0.28 : 0.12;
        } else {
          material.emissive.setHex(0x000000);
          material.emissiveIntensity = 0.15;
        }
      });

      requestDot.rotation.y += 0.04;
      renderer.render(scene, camera);
    };
    tick();

    const onResize = () => {
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    onResize();

    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "min(380px, 52vw)",
        minHeight: "240px",
        border: "2.5px solid #0A0A0A",
        backgroundColor: "rgba(242, 237, 228, 0.65)",
        position: "relative",
      }}
      aria-hidden
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "14%",
          pointerEvents: "none",
        }}
      >
        {NODES.map((node) => (
          <span
            key={node.id}
            style={{
              position: "absolute",
              left: LABEL_POSITIONS[node.id],
              transform: "translateX(-50%)",
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 700,
              fontFamily: "'Space Mono', monospace",
              color: node.kind === "gateway" ? "#FF2800" : "#0A0A0A",
              whiteSpace: "nowrap",
            }}
          >
            {node.label}
          </span>
        ))}
      </div>

      <p
        style={{
          position: "absolute",
          left: "50%",
          top: "12%",
          transform: "translateX(-50%)",
          margin: 0,
          fontSize: "9px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          fontFamily: "'Space Mono', monospace",
          color: "#0A0A0A",
          opacity: 0.65,
        }}
      >
        Request flow →
      </p>
    </div>
  );
}

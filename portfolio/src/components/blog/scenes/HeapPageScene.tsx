"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function disposeObject(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      const material = obj.material;
      if (Array.isArray(material)) material.forEach((item) => item.dispose());
      else material?.dispose();
    } else if (obj instanceof THREE.Line || obj instanceof THREE.LineSegments) {
      obj.geometry?.dispose();
      const material = obj.material as THREE.Material | THREE.Material[];
      if (Array.isArray(material)) material.forEach((item) => item.dispose());
      else material?.dispose();
    }
  });
}

export type HeapPageAction = "insert" | "read" | "delete" | "update";

type HeapActionMeta = {
  label: string;
  accent: string;
  summary: string;
  steps: string[];
  readout: { label: string; value: string }[];
};

export const HEAP_ACTION_META: Record<HeapPageAction, HeapActionMeta> = {
  insert: {
    label: "Insert",
    accent: "#FFE500",
    summary:
      "FSM picks a page with room, WAL is written first, then PostgreSQL appends a 4-byte ItemId and tuple bytes into the page and leaves the buffer dirty.",
    steps: [
      "FSM points the insert at a page with enough free space.",
      "WAL records the change before page bytes are modified in memory.",
      "A new ItemId points at the freshly written tuple and the page becomes dirty.",
    ],
    readout: [
      { label: "Flow", value: "FSM -> buffer pool -> heap page" },
      { label: "Inside page", value: "new ItemId + new tuple bytes" },
      { label: "Result", value: "dirty buffer newer than disk" },
    ],
  },
  read: {
    label: "Read",
    accent: "#7DD3FC",
    summary:
      "The buffer manager checks memory first. On a miss the page is pulled from disk into a buffer slot, then the executor follows the ItemId pointer to the tuple bytes.",
    steps: [
      "Locate the block and item offset for the target row.",
      "Check the buffer hash table first; this loop alternates hit and miss behavior.",
      "Use the ItemId array to jump to the tuple start and length inside the page.",
    ],
    readout: [
      { label: "Flow", value: "buffer hit or disk -> buffer -> tuple" },
      { label: "Inside page", value: "ItemId tells executor where bytes live" },
      { label: "Result", value: "page is pinned while in use" },
    ],
  },
  delete: {
    label: "Delete",
    accent: "#FF6B6B",
    summary:
      "PostgreSQL marks the tuple version with xmax instead of erasing it immediately. Other snapshots may still see the row until the deleting transaction commits.",
    steps: [
      "WAL captures the delete before the in-memory page changes.",
      "The tuple header gets xmax = deleting transaction ID.",
      "The bytes stay on the page until commit and later cleanup decide they are dead.",
    ],
    readout: [
      { label: "Flow", value: "WAL -> buffer pool -> tuple header" },
      { label: "Inside page", value: "xmax marks the row version deleted" },
      { label: "Result", value: "space is not reclaimed immediately" },
    ],
  },
  update: {
    label: "Update",
    accent: "#FB923C",
    summary:
      "An update is modeled as delete plus insert: the old tuple version gets xmax, a new version is written into free space, and a HOT chain can keep indexes pointing at the head.",
    steps: [
      "Mark the old tuple version obsolete with xmax.",
      "Insert a new version into free space, ideally on the same page.",
      "If no indexed column changed and the new row fits, HOT chains old to new without touching indexes.",
    ],
    readout: [
      { label: "Flow", value: "WAL -> old tuple -> new tuple version" },
      { label: "Inside page", value: "ctid / HOT chain links versions" },
      { label: "Result", value: "old row stays visible to older snapshots" },
    ],
  },
};

const TOOLTIPS: Record<string, { title: string; body: string }> = {
  FSM: {
    title: "Free Space Map (FSM)",
    body: "A compact structure that tracks roughly how much free space each heap page has. Inserts consult it to avoid scanning every page in the table file.",
  },
  "Buffer Pool": {
    title: "Buffer Pool",
    body: "Shared memory cache for database pages. A page must be in a buffer before PostgreSQL can inspect or modify its bytes.",
  },
  WAL: {
    title: "Write-Ahead Log (WAL)",
    body: "Durability log written before dirty page bytes are flushed. If the server crashes, replaying WAL reconstructs the newest committed state.",
  },
  "Heap File on Disk": {
    title: "Heap File on Disk",
    body: "Persistent relation storage made of fixed-size pages. A read miss copies a page from disk into a buffer slot before the executor can use it.",
  },
  "Heap Page": {
    title: "Heap Page",
    body: "An 8 KiB PostgreSQL heap page. The header and ItemId directory grow from the front; tuple bytes grow backward from the end of the free corridor.",
  },
  "Dirty Buffer": {
    title: "Dirty Buffer",
    body: "A page in memory whose bytes are newer than the version on disk. It stays dirty until background flush or checkpoint writes it out.",
  },
  PageHeaderData: {
    title: "PageHeaderData (24 bytes)",
    body: "Stores pd_lsn, checksum, flags, pd_lower, pd_upper, pd_special, page size/version, and pd_prune_xid. It is the control panel for the rest of the page.",
  },
  "ItemId Array": {
    title: "ItemIdData Array (4 bytes each)",
    body: "Line pointers that store where each tuple begins and how long it is. Executors look here first instead of searching raw tuple bytes.",
  },
  "ItemId 1": {
    title: "ItemId slot 1",
    body: "Points at the first tuple. Slot numbers are stable logical row locators inside a page even if tuple bytes move during compaction.",
  },
  "ItemId 3": {
    title: "ItemId slot 3",
    body: "Points at the second tuple. Updates and HOT chains often keep row identity anchored to line pointers rather than to a raw byte offset.",
  },
  "ItemId 2": {
    title: "ItemId slot 2",
    body: "Points at the third tuple. The executor uses the slot to jump straight to tuple bytes after locating the page.",
  },
  "New ItemId": {
    title: "New ItemId",
    body: "Insertions add a fresh 4-byte line pointer here. The pointer carries enough metadata to find the tuple bytes that were just written into free space.",
  },
  "Free Space": {
    title: "Free Space",
    body: "The corridor between pd_lower and pd_upper. ItemIds consume it from the front while tuple bodies consume it from the back.",
  },
  "Item Tuple 1": {
    title: "Item Tuple 1",
    body: "A regular heap tuple version with xmin/xmax metadata in its header. Reads and updates resolve visibility rules against these transaction IDs.",
  },
  "Item Tuple 2": {
    title: "Item Tuple 2",
    body: "Used here as the target for delete/update animations. In PostgreSQL, setting xmax marks this version deleted or superseded without instantly removing its bytes.",
  },
  "Item Tuple 3": {
    title: "Item Tuple 3",
    body: "Another stable tuple referenced by its line pointer. Reads follow the pointer rather than scanning the whole page body.",
  },
  "New Tuple Version": {
    title: "New Tuple Version",
    body: "Represents bytes written into free space for either a brand-new row or a newer row version created by UPDATE.",
  },
  "HOT Chain": {
    title: "HOT Chain",
    body: "Heap-Only Tuple chain. When an UPDATE stays on the same page and leaves indexed columns unchanged, indexes keep pointing at the chain head while the executor follows ctid links.",
  },
  "Special Space": {
    title: "Special Space",
    body: "Heap pages usually leave this empty, but index access methods such as B-tree store method-specific metadata here.",
  },
};

type HeapPageSceneProps = {
  actionMode?: HeapPageAction;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeInOut(value: number) {
  return value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
}

function pulseWindow(phase: number, start: number, end: number) {
  if (phase < start || phase > end) return 0;
  const local = (phase - start) / (end - start);
  return Math.sin(local * Math.PI);
}

function mixTowards(mesh: THREE.Mesh, hex: number, amount: number) {
  const material = mesh.material as THREE.MeshStandardMaterial;
  const baseColor = new THREE.Color(mesh.userData.baseColor as number);
  material.color.copy(baseColor).lerp(new THREE.Color(hex), clamp01(amount));
}

function routePoint(route: THREE.Vector3[], progress: number) {
  if (route.length === 0) return new THREE.Vector3();
  if (route.length === 1) return route[0].clone();
  const scaled = clamp01(progress) * (route.length - 1);
  const idx = Math.min(route.length - 2, Math.floor(scaled));
  const local = scaled - idx;
  return route[idx].clone().lerp(route[idx + 1], local);
}

export default function HeapPageScene({ actionMode = "insert" }: HeapPageSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<HeapPageAction>(actionMode);
  modeRef.current = actionMode;

  const [tooltip, setTooltip] = useState<{ title: string; body: string } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 320);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf2ede4);

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 200);
    camera.position.set(0.2, 0.4, 24);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = "grab";

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.target.set(0.8, 0, 0);
    controls.minDistance = 16;
    controls.maxDistance = 34;
    controls.maxPolarAngle = Math.PI / 2;

    scene.add(new THREE.AmbientLight(0xffffff, 0.96));
    const sun = new THREE.DirectionalLight(0xffffff, 0.62);
    sun.position.set(8, 14, 10);
    scene.add(sun);

    const ink = 0x0a0a0a;
    const hoverables: THREE.Mesh[] = [];
    const resettableMeshes: THREE.Mesh[] = [];
    const hoveredMeshRef = { current: null as THREE.Mesh | null };

    function rememberBase(mesh: THREE.Mesh, color: number, opacity: number, position: THREE.Vector3) {
      mesh.userData.baseColor = color;
      mesh.userData.baseOpacity = opacity;
      mesh.userData.basePosition = position.clone();
      hoverables.push(mesh);
      resettableMeshes.push(mesh);
    }

    function edgeMaterial() {
      return new THREE.LineBasicMaterial({ color: ink });
    }

    function makeBlock(
      label: string,
      cx: number,
      cy: number,
      cz: number,
      w: number,
      h: number,
      d: number,
      color: number,
      opacity = 1
    ) {
      const geometry = new THREE.BoxGeometry(w, h, d);
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.42,
        metalness: 0.02,
        transparent: opacity < 1,
        opacity,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(cx, cy, cz);
      mesh.userData.label = label;
      rememberBase(mesh, color, opacity, mesh.position);
      scene.add(mesh);

      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edgeMaterial());
      edges.position.copy(mesh.position);
      scene.add(edges);

      return { mesh, edges };
    }

    function resetMesh(mesh: THREE.Mesh) {
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.color.setHex(mesh.userData.baseColor as number);
      material.opacity = mesh.userData.baseOpacity as number;
      material.transparent = material.opacity < 1;
      material.emissive.setHex(0x000000);
      material.emissiveIntensity = 0;
      mesh.position.copy(mesh.userData.basePosition as THREE.Vector3);
      mesh.scale.set(1, 1, 1);
      mesh.visible = material.opacity > 0.001;
    }

    function glow(mesh: THREE.Mesh, color: number, intensity: number) {
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissive.setHex(color);
      material.emissiveIntensity = intensity;
    }

    function setOpacity(mesh: THREE.Mesh, opacity: number) {
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = opacity;
      material.transparent = opacity < 1;
      mesh.visible = opacity > 0.01;
    }

    function setLineState(line: THREE.Line, opacity: number, visible = true) {
      const material = line.material as THREE.LineDashedMaterial | THREE.LineBasicMaterial;
      material.transparent = opacity < 1;
      material.opacity = opacity;
      line.visible = visible && opacity > 0.01;
    }

    const moduleZ = 0.4;
    const { mesh: fsm } = makeBlock("FSM", -8.3, 4.2, moduleZ, 2.5, 1.4, 0.6, 0xfff0a6);
    const { mesh: bufferPool } = makeBlock("Buffer Pool", -3.9, 4.2, moduleZ, 3.5, 1.6, 0.7, 0xdaf5e5);
    const { mesh: disk } = makeBlock("Heap File on Disk", -8.3, -0.2, moduleZ, 2.7, 2.9, 0.7, 0xe0e0e0);
    const { mesh: wal } = makeBlock("WAL", -8.3, -4.2, moduleZ, 2.7, 1.4, 0.7, 0xffd7d2);

    const pageCenterX = 2.8;
    const pageCenterY = -0.1;
    const pageW = 11.8;
    const pageH = 8.8;
    const pageD = 0.42;
    const pageGeo = new THREE.BoxGeometry(pageW, pageH, pageD);
    const pageMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const page = new THREE.Mesh(pageGeo, pageMat);
    page.position.set(pageCenterX, pageCenterY, 0.2);
    page.userData.label = "Heap Page";
    rememberBase(page, 0xffffff, 1, page.position);
    scene.add(page);
    const pageEdge = new THREE.LineSegments(new THREE.EdgesGeometry(pageGeo), edgeMaterial());
    pageEdge.position.copy(page.position);
    scene.add(pageEdge);

    const { mesh: dirtyBadge } = makeBlock("Dirty Buffer", pageCenterX + 4.7, pageCenterY + 3.35, 0.6, 0.58, 0.58, 0.18, 0xff2800, 0.15);

    const px = (value: number) => pageCenterX + value;
    const py = (value: number) => pageCenterY + value;
    const baseZ = page.position.z + pageD / 2;

    const { mesh: header } = makeBlock("PageHeaderData", px(-2.1), py(2.9), baseZ + 0.12, 6.4, 1.55, 0.18, 0xe8e2d4);
    const { mesh: itemArray } = makeBlock("ItemId Array", px(3.1), py(2.9), baseZ + 0.12, 3.6, 1.55, 0.18, 0xf5f1e8);

    const slotColors = [0xe53935, 0x43a047, 0x1e88e5];
    const slotLabels = ["ItemId 1", "ItemId 3", "ItemId 2"] as const;
    const slotXs = [px(1.85), px(2.65), px(3.45)];
    const slotBlocks = slotXs.map((x, index) =>
      makeBlock(slotLabels[index], x, py(2.9), baseZ + 0.35, 0.68, 0.68, 0.18, slotColors[index])
    );
    const slotMeshes = slotBlocks.map((item) => item.mesh);

    const { mesh: newSlot } = makeBlock("New ItemId", px(4.25), py(2.9), baseZ + 0.35, 0.68, 0.68, 0.18, 0xffc857, 0);

    const freeDepth = 0.12;
    const freeGeo = new THREE.BoxGeometry(10.4, 1.75, freeDepth);
    const freeMat = new THREE.MeshStandardMaterial({
      color: 0xfafaf4,
      transparent: true,
      opacity: 0.5,
      roughness: 0.92,
    });
    const freeMesh = new THREE.Mesh(freeGeo, freeMat);
    freeMesh.position.set(px(0), py(0.95), baseZ + freeDepth / 2);
    freeMesh.userData.label = "Free Space";
    rememberBase(freeMesh, 0xfafaf4, 0.5, freeMesh.position);
    scene.add(freeMesh);

    const freeDash = new THREE.LineSegments(
      new THREE.EdgesGeometry(freeGeo),
      new THREE.LineDashedMaterial({ color: 0x5e5e5e, dashSize: 0.28, gapSize: 0.16, transparent: true, opacity: 0.85 })
    );
    freeDash.computeLineDistances();
    freeDash.position.copy(freeMesh.position);
    scene.add(freeDash);

    const itemsFrameGeo = new THREE.BoxGeometry(7.1, 3.75, 0.14);
    const itemsFrame = new THREE.Mesh(itemsFrameGeo, new THREE.MeshStandardMaterial({ color: 0xf2ede4, roughness: 0.6 }));
    itemsFrame.position.set(px(-1.5), py(-2.05), baseZ + 0.07);
    scene.add(itemsFrame);
    const itemsFrameEdge = new THREE.LineSegments(new THREE.EdgesGeometry(itemsFrameGeo), edgeMaterial());
    itemsFrameEdge.position.copy(itemsFrame.position);
    scene.add(itemsFrameEdge);

    const tupleLabels = ["Item Tuple 1", "Item Tuple 2", "Item Tuple 3"] as const;
    const tupleYs = [py(-1.2), py(-2.05), py(-2.9)];
    const tupleBlocks = tupleYs.map((y, index) =>
      makeBlock(tupleLabels[index], px(-1.5), y, baseZ + 0.33, 6.35, 0.66, 0.18, slotColors[index])
    );
    const tupleMeshes = tupleBlocks.map((item) => item.mesh);

    const { mesh: newTuple } = makeBlock("New Tuple Version", px(0.4), py(-0.28), baseZ + 0.4, 3.4, 0.66, 0.18, 0xffc857, 0);
    const { mesh: hotChainAnchor } = makeBlock("HOT Chain", px(0.42), py(-0.28), baseZ + 0.17, 3.45, 0.12, 0.02, 0xfb923c, 0);
    setOpacity(hotChainAnchor, 0);

    const { mesh: specialSpace } = makeBlock("Special Space", px(3.75), py(-2.0), baseZ + 0.14, 2.75, 3.75, 0.18, 0xe0dbd0);

    const connectorLines: THREE.Line[] = [];
    const connectorMaterials: THREE.LineDashedMaterial[] = [];
    const lineZ = baseZ + 0.65;

    slotMeshes.forEach((slot, index) => {
      const tuple = tupleMeshes[index];
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(slot.position.x, slot.position.y - 0.32, lineZ),
        new THREE.Vector3(slot.position.x - 0.35 - index * 0.2, py(0.55), lineZ),
        new THREE.Vector3(slot.position.x - 0.8 - index * 0.35, py(-0.55), lineZ),
        new THREE.Vector3(tuple.position.x + 3.1, tuple.position.y, lineZ),
      ]);
      const points = curve.getPoints(48);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineDashedMaterial({
        color: slotColors[index],
        dashSize: 0.18,
        gapSize: 0.1,
        transparent: true,
        opacity: 0.26,
      });
      const line = new THREE.Line(geometry, material);
      line.computeLineDistances();
      connectorLines.push(line);
      connectorMaterials.push(material);
      scene.add(line);
    });

    const newLineMaterial = new THREE.LineDashedMaterial({
      color: 0xffc857,
      dashSize: 0.18,
      gapSize: 0.1,
      transparent: true,
      opacity: 0,
    });
    const newLineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(newSlot.position.x, newSlot.position.y - 0.32, lineZ),
      new THREE.Vector3(newSlot.position.x - 0.55, py(0.6), lineZ),
      new THREE.Vector3(newTuple.position.x + 1.7, newTuple.position.y + 0.2, lineZ),
      new THREE.Vector3(newTuple.position.x + 1.2, newTuple.position.y, lineZ),
    ]);
    const newLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(newLineCurve.getPoints(48)), newLineMaterial);
    newLine.computeLineDistances();
    newLine.visible = false;
    scene.add(newLine);

    const hotLineMaterial = new THREE.LineDashedMaterial({
      color: 0xfb923c,
      dashSize: 0.18,
      gapSize: 0.1,
      transparent: true,
      opacity: 0,
    });
    const hotLineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(tupleMeshes[1].position.x + 1.4, tupleMeshes[1].position.y, lineZ),
      new THREE.Vector3(px(-0.3), py(-1.0), lineZ),
      new THREE.Vector3(px(0.5), py(-0.55), lineZ),
      new THREE.Vector3(newTuple.position.x - 1.6, newTuple.position.y, lineZ),
    ]);
    const hotLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(hotLineCurve.getPoints(48)), hotLineMaterial);
    hotLine.computeLineDistances();
    hotLine.visible = false;
    scene.add(hotLine);

    const packet = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xffe500, emissive: 0xffe500, emissiveIntensity: 0.3 })
    );
    packet.visible = false;
    scene.add(packet);

    const insertRoute = [fsm.position.clone(), bufferPool.position.clone(), page.position.clone(), newTuple.position.clone()];
    const readMissRoute = [disk.position.clone(), bufferPool.position.clone(), slotMeshes[2].position.clone(), tupleMeshes[2].position.clone()];
    const readHitRoute = [bufferPool.position.clone(), slotMeshes[2].position.clone(), tupleMeshes[2].position.clone()];
    const deleteRoute = [wal.position.clone(), bufferPool.position.clone(), tupleMeshes[1].position.clone()];
    const updateRoute = [wal.position.clone(), bufferPool.position.clone(), tupleMeshes[1].position.clone(), newTuple.position.clone()];

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let lastLabel = "";

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(hoverables, false);
      const label = hits.length > 0 ? (hits[0].object.userData.label as string) : "";

      if (label !== lastLabel) {
        lastLabel = label;
        hoveredMeshRef.current = hits.length > 0 ? (hits[0].object as THREE.Mesh) : null;
        renderer.domElement.style.cursor = label ? "pointer" : "grab";
        setTooltip(label ? (TOOLTIPS[label] ?? null) : null);
      }

      if (label) {
        setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
      }
    };

    const onMouseLeave = () => {
      hoveredMeshRef.current = null;
      lastLabel = "";
      renderer.domElement.style.cursor = "grab";
      setTooltip(null);
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseleave", onMouseLeave);

    let frame = 0;
    const t0 = performance.now();

    const loop = () => {
      frame = requestAnimationFrame(loop);
      const elapsed = (performance.now() - t0) / 1000;
      const mode = modeRef.current;

      resettableMeshes.forEach(resetMesh);
      connectorMaterials.forEach((material) => {
        material.opacity = 0.26;
      });
      connectorLines.forEach((line, index) => setLineState(line, connectorMaterials[index].opacity, true));
      setLineState(newLine, 0, false);
      setLineState(hotLine, 0, false);
      freeMesh.scale.y = 1 + Math.sin(elapsed * 1.2) * 0.015;
      freeDash.scale.y = freeMesh.scale.y;
      packet.visible = false;
      dirtyBadge.visible = false;
      setOpacity(newSlot, 0);
      setOpacity(newTuple, 0);
      setOpacity(hotChainAnchor, 0);

      if (mode === "insert") {
        const phase = (elapsed % 8) / 8;
        const route = routePoint(insertRoute, clamp01((phase - 0.04) / 0.68));
        const fsmPulse = pulseWindow(phase, 0.02, 0.24);
        const walPulse = pulseWindow(phase, 0.18, 0.42);
        const bufferPulse = pulseWindow(phase, 0.28, 0.56);
        const appearSlot = easeInOut(clamp01((phase - 0.56) / 0.12));
        const appearTuple = easeInOut(clamp01((phase - 0.64) / 0.18));
        packet.visible = true;
        packet.position.copy(route);
        (packet.material as THREE.MeshStandardMaterial).color.setHex(0xffe500);
        (packet.material as THREE.MeshStandardMaterial).emissive.setHex(0xffe500);

        glow(fsm, 0xffe500, 0.12 + fsmPulse * 0.34);
        glow(wal, 0xff7a00, walPulse * 0.3);
        glow(bufferPool, 0xffe500, 0.08 + bufferPulse * 0.32);
        glow(itemArray, 0xffe500, appearSlot * 0.14);
        freeMesh.scale.y = 0.84 + Math.sin(elapsed * 1.6) * 0.025;
        freeDash.scale.y = freeMesh.scale.y;
        dirtyBadge.visible = phase > 0.52;
        setOpacity(dirtyBadge, phase > 0.52 ? 0.92 : 0.12);
        glow(dirtyBadge, 0xff2800, 0.22 + Math.sin(elapsed * 6) * 0.08);

        setOpacity(newSlot, appearSlot);
        setOpacity(newTuple, appearTuple);
        newTuple.scale.x = 0.7 + appearTuple * 0.3;
        newTuple.scale.y = 0.8 + appearTuple * 0.2;
        setLineState(newLine, appearTuple * 0.75, appearTuple > 0.02);
      } else if (mode === "read") {
        const cycleLength = 7;
        const phase = (elapsed % cycleLength) / cycleLength;
        const missCycle = Math.floor(elapsed / cycleLength) % 2 === 0;
        const route = routePoint(missCycle ? readMissRoute : readHitRoute, clamp01((phase - 0.06) / 0.74));
        packet.visible = true;
        packet.position.copy(route);
        (packet.material as THREE.MeshStandardMaterial).color.setHex(0x4fc3f7);
        (packet.material as THREE.MeshStandardMaterial).emissive.setHex(0x4fc3f7);
        glow(bufferPool, 0x4fc3f7, 0.18 + Math.sin(elapsed * 4) * 0.08);
        if (missCycle) glow(disk, 0x4fc3f7, 0.16 + pulseWindow(phase, 0.02, 0.36) * 0.22);
        glow(slotMeshes[2], 0x4fc3f7, 0.1 + pulseWindow(phase, 0.46, 0.76) * 0.3);
        glow(tupleMeshes[2], 0x4fc3f7, 0.14 + pulseWindow(phase, 0.56, 0.88) * 0.28);
        connectorMaterials[2].opacity = 0.42 + pulseWindow(phase, 0.46, 0.88) * 0.3;
      } else if (mode === "delete") {
        const phase = (elapsed % 7.5) / 7.5;
        const route = routePoint(deleteRoute, clamp01((phase - 0.08) / 0.56));
        const deadness = easeInOut(clamp01((phase - 0.42) / 0.26));
        const target = tupleMeshes[1];
        packet.visible = true;
        packet.position.copy(route);
        (packet.material as THREE.MeshStandardMaterial).color.setHex(0xff6b6b);
        (packet.material as THREE.MeshStandardMaterial).emissive.setHex(0xff6b6b);
        glow(wal, 0xff6b6b, 0.12 + pulseWindow(phase, 0.02, 0.28) * 0.34);
        glow(bufferPool, 0xff6b6b, 0.08 + pulseWindow(phase, 0.18, 0.5) * 0.24);
        dirtyBadge.visible = phase > 0.28;
        setOpacity(dirtyBadge, phase > 0.28 ? 0.92 : 0.12);
        glow(dirtyBadge, 0xff2800, 0.24 + Math.sin(elapsed * 7) * 0.08);
        mixTowards(target, 0x8b8b8b, deadness * 0.82);
        setOpacity(target, 1 - deadness * 0.58);
        glow(target, 0xff6b6b, 0.1 + deadness * 0.28);
        glow(slotMeshes[1], 0xff6b6b, 0.08 + deadness * 0.24);
        connectorMaterials[1].opacity = 0.24 + deadness * 0.16;
      } else {
        const phase = (elapsed % 9) / 9;
        const route = routePoint(updateRoute, clamp01((phase - 0.06) / 0.66));
        const oldDeadness = easeInOut(clamp01((phase - 0.28) / 0.18));
        const newTupleAppear = easeInOut(clamp01((phase - 0.5) / 0.22));
        const target = tupleMeshes[1];
        packet.visible = true;
        packet.position.copy(route);
        (packet.material as THREE.MeshStandardMaterial).color.setHex(0xfb923c);
        (packet.material as THREE.MeshStandardMaterial).emissive.setHex(0xfb923c);
        glow(wal, 0xfb923c, 0.12 + pulseWindow(phase, 0.02, 0.28) * 0.34);
        glow(bufferPool, 0xfb923c, 0.08 + pulseWindow(phase, 0.18, 0.48) * 0.26);
        dirtyBadge.visible = phase > 0.24;
        setOpacity(dirtyBadge, phase > 0.24 ? 0.92 : 0.12);
        glow(dirtyBadge, 0xff2800, 0.24 + Math.sin(elapsed * 7) * 0.08);
        mixTowards(target, 0x7f7f7f, oldDeadness * 0.74);
        setOpacity(target, 1 - oldDeadness * 0.42);
        glow(target, 0xff7a00, 0.12 + oldDeadness * 0.22);
        glow(slotMeshes[1], 0xff7a00, 0.08 + oldDeadness * 0.2);
        setOpacity(newTuple, newTupleAppear * 0.95);
        setOpacity(hotChainAnchor, newTupleAppear * 0.7);
        newTuple.position.set(px(0.55), py(-0.35), baseZ + 0.4);
        newTuple.scale.x = 0.72 + newTupleAppear * 0.28;
        newTuple.scale.y = 0.85 + newTupleAppear * 0.15;
        mixTowards(newTuple, 0xfb923c, 0.5);
        setLineState(hotLine, newTupleAppear * 0.82, newTupleAppear > 0.02);
      }

      if (hoveredMeshRef.current) {
        glow(hoveredMeshRef.current, 0xffffff, 0.22);
      }

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
    const observer = new ResizeObserver(onResize);
    observer.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseleave", onMouseLeave);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      disposeObject(scene);
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, []);

  const meta = HEAP_ACTION_META[actionMode];
  const containerWidth = containerRef.current?.clientWidth ?? 400;
  const flipLeft = tooltipPos.x + 310 > containerWidth;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "min(560px, 74vh)",
        minHeight: "360px",
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          border: "2.5px solid #0A0A0A",
          borderRadius: "2px",
          overflow: "hidden",
        }}
        role="img"
        aria-label={`Interactive 3D diagram showing how PostgreSQL ${meta.label.toLowerCase()} works inside a heap page`}
      />

      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: "min(220px, calc(100% - 24px))",
          backgroundColor: "rgba(10, 10, 10, 0.76)",
          color: "#F2EDE4",
          border: `2px solid ${meta.accent}`,
          boxShadow: `3px 3px 0 ${meta.accent}`,
          padding: "10px 12px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            fontWeight: "bold",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontFamily: "'Space Mono', monospace",
            color: meta.accent,
            marginBottom: "6px",
          }}
        >
          Heap page flow - {meta.label}
        </div>
        <p style={{ margin: 0, fontSize: "11px", lineHeight: 1.55, opacity: 0.9 }}>{meta.summary}</p>
        <div
          style={{
            marginTop: "8px",
            fontSize: "10px",
            lineHeight: 1.55,
            fontFamily: "'Space Mono', monospace",
            opacity: 0.82,
          }}
        >
          Focus: {meta.readout[1]?.value}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "9px",
          fontFamily: "'Space Mono', monospace",
          color: "#8A8A8A",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          pointerEvents: "none",
          backgroundColor: "rgba(242, 237, 228, 0.86)",
          padding: "4px 10px",
          whiteSpace: "nowrap",
        }}
      >
        hover structures - drag to orbit
      </div>

      {tooltip ? (
        <div
          style={{
            position: "absolute",
            left: flipLeft ? tooltipPos.x - 296 : tooltipPos.x + 16,
            top: Math.max(10, tooltipPos.y - 18),
            width: "280px",
            backgroundColor: "#0A0A0A",
            color: "#F2EDE4",
            border: `2px solid ${meta.accent}`,
            padding: "12px 14px",
            fontFamily: "'Space Mono', monospace",
            fontSize: "11px",
            lineHeight: 1.65,
            pointerEvents: "none",
            zIndex: 20,
            boxShadow: `4px 4px 0 ${meta.accent}`,
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: "11px",
              marginBottom: "8px",
              color: meta.accent,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              borderBottom: `1px solid ${meta.accent}55`,
              paddingBottom: "6px",
            }}
          >
            {tooltip.title}
          </div>
          <div style={{ opacity: 0.88 }}>{tooltip.body}</div>
        </div>
      ) : null}
    </div>
  );
}

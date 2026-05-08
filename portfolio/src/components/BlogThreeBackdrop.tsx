"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function BlogThreeBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / Math.max(height, 1), 0.1, 100);
    camera.position.z = 3.6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const outer = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.12, 1),
      new THREE.MeshBasicMaterial({ color: 0xff2800, wireframe: true })
    );
    scene.add(outer);

    const inner = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.52, 0.52),
      new THREE.MeshBasicMaterial({ color: 0x0a0a0a, wireframe: true })
    );
    scene.add(inner);

    let frameId = 0;
    const tick = () => {
      frameId = requestAnimationFrame(tick);
      outer.rotation.x += 0.0035;
      outer.rotation.y += 0.0065;
      inner.rotation.x -= 0.0055;
      inner.rotation.y += 0.0045;
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
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      outer.geometry.dispose();
      inner.geometry.dispose();
      (outer.material as THREE.Material).dispose();
      (inner.material as THREE.Material).dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "min(380px, 52vw)",
        minHeight: "240px",
        border: "2.5px solid #0A0A0A",
        backgroundColor: "rgba(242, 237, 228, 0.65)",
        position: "relative",
      }}
      aria-hidden
    />
  );
}

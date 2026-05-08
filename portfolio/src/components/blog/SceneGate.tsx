"use client";

import type { ReactNode } from "react";

type SceneGateProps = {
  active: boolean;
  onUnlock: () => void;
  /** Short label for the placeholder (e.g. “Heap page”) */
  label: string;
  children: ReactNode;
};

export default function SceneGate({ active, onUnlock, label, children }: SceneGateProps) {
  if (!active) {
    return (
      <div
        style={{
          width: "100%",
          height: "min(520px, 70vh)",
          minHeight: "320px",
          border: "2.5px dashed #0A0A0A",
          borderRadius: "2px",
          backgroundColor: "rgba(255, 229, 0, 0.08)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: "bold",
            fontFamily: "'Space Mono', monospace",
            color: "#FF2800",
            margin: 0,
          }}
        >
          3D diagram · {label}
        </p>
        <p style={{ fontSize: "13px", lineHeight: 1.65, maxWidth: "360px", margin: 0, opacity: 0.85 }}>
          Load the interactive WebGL figure when you&apos;re ready — saves GPU until you scroll here or tap below.
        </p>
        <button
          type="button"
          onClick={onUnlock}
          style={{
            padding: "12px 22px",
            fontSize: "11px",
            fontWeight: "bold",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontFamily: "'Space Mono', monospace",
            border: "2.5px solid #0A0A0A",
            backgroundColor: "#FFE500",
            color: "#0A0A0A",
            cursor: "pointer",
          }}
        >
          Load 3D diagram
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

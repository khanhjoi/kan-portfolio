"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";

type CollapsiblePanelProps = {
  summary: ReactNode;
  children: ReactNode;
  /** Initial open state */
  defaultOpen?: boolean;
  style?: CSSProperties;
  /** Extra class for globals.css hooks */
  className?: string;
};

export default function CollapsiblePanel({
  summary,
  children,
  defaultOpen = false,
  style,
  className = "blog-collapsible-panel",
}: CollapsiblePanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      open={open}
      className={className}
      style={{ ...style }}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary
        style={{
          cursor: "pointer",
          fontSize: "11px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: "bold",
          fontFamily: "'Space Mono', monospace",
          padding: "12px 14px",
          listStyle: "none",
        }}
      >
        {summary}
      </summary>
      <div style={{ padding: "0 14px 14px" }}>{children}</div>
    </details>
  );
}

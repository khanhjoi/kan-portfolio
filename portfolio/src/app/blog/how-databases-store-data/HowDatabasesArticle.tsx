"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useMemo, useRef, useState } from "react";
import CollapsiblePanel from "@/components/blog/CollapsiblePanel";
import SceneGate from "@/components/blog/SceneGate";
import { useLazyMountScene } from "@/components/blog/useLazyMountScene";
import HeapPageScene, { HEAP_ACTION_META, type HeapPageAction } from "@/components/blog/scenes/HeapPageScene";
import {
  articleIntro,
  articleSections,
  furtherReading,
  type ArticleSection,
  type PagePart,
  type RowOperationGuide,
} from "@/content/how-databases-store-data";

const prose: CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.78,
  color: "#0A0A0A",
};

const h2: CSSProperties = {
  fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
  fontSize: "clamp(2rem, 4vw, 3rem)",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "-0.02em",
  marginTop: "0",
  marginBottom: "18px",
  borderBottom: "2.5px solid #0A0A0A",
  paddingBottom: "12px",
};

const ink = "#0A0A0A";
const red = "#FF2800";

function SectionSidebar({
  section,
  statsPanel,
}: {
  section: ArticleSection;
  statsPanel: React.ReactNode;
}) {
  return (
    <aside
      style={{
        position: "sticky",
        top: "88px",
        alignSelf: "start",
        border: "2.5px solid #0A0A0A",
        backgroundColor: "rgba(255, 255, 255, 0.55)",
        padding: "18px 16px 20px",
        boxShadow: "6px 6px 0 #FFE500",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontWeight: "bold",
          color: red,
          marginBottom: "12px",
          fontFamily: "'Space Mono', monospace",
        }}
      >
        Live readout
      </p>
      <div style={{ marginBottom: "8px" }}>{statsPanel}</div>

      <CollapsiblePanel
        defaultOpen={false}
        summary={
          <span>
            Open research notes · <span style={{ color: red }}>{section.shortLabel}</span>
          </span>
        }
      >
        <h3
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.25rem",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            marginBottom: "12px",
            lineHeight: 1.05,
          }}
        >
          {section.sidebar.headline}
        </h3>

        <div style={{ ...prose, fontSize: "13px", marginBottom: "14px" }}>
          {section.sidebar.modelNotes.map((note) => (
            <p key={note.slice(0, 48)} style={{ marginBottom: "10px", opacity: 0.92 }}>
              {note}
            </p>
          ))}
        </div>

        <ul style={{ ...prose, fontSize: "13px", paddingLeft: "18px", marginBottom: "14px" }}>
          {section.sidebar.bullets.map((b) => (
            <li key={b.slice(0, 40)} style={{ marginBottom: "8px" }}>
              {b}
            </li>
          ))}
        </ul>

        {section.sidebar.references?.length ? (
          <div>
            <p
              style={{
                fontSize: "10px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: "bold",
                marginBottom: "8px",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              References
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {section.sidebar.references.map((ref) => (
                <li key={ref.href} style={{ marginBottom: "8px" }}>
                  <a href={ref.href} style={{ color: red, fontSize: "12px", wordBreak: "break-word" }}>
                    {ref.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CollapsiblePanel>
    </aside>
  );
}

function PartExplainer({ part }: { part: PagePart }) {
  return (
    <div
      style={{
        border: "2px solid #0A0A0A",
        padding: "14px 16px",
        marginBottom: "12px",
        backgroundColor: "rgba(255, 255, 255, 0.4)",
      }}
    >
      <h4
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "11px",
          fontWeight: "bold",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          margin: "0 0 8px",
          color: red,
        }}
      >
        {part.title}
        {part.sceneLabel ? (
          <span style={{ color: ink, fontWeight: 400, marginLeft: "8px", opacity: 0.65 }}>
            — hover “{part.sceneLabel}” in the figure
          </span>
        ) : null}
      </h4>
      <p style={{ ...prose, fontSize: "13px", margin: 0, opacity: 0.9 }}>{part.body}</p>
    </div>
  );
}

function OperationExplainer({ op, active }: { op: RowOperationGuide; active: boolean }) {
  const meta = HEAP_ACTION_META[op.id];
  return (
    <div
      id={`op-${op.id}`}
      style={{
        border: `2.5px solid ${active ? meta.accent : ink}`,
        padding: "16px 18px",
        marginBottom: "14px",
        backgroundColor: active ? "rgba(255, 229, 0, 0.12)" : "rgba(255, 255, 255, 0.35)",
        boxShadow: active ? `4px 4px 0 ${meta.accent}` : "none",
      }}
    >
      <h4
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "1.35rem",
          fontWeight: 900,
          textTransform: "uppercase",
          margin: "0 0 10px",
          color: active ? red : ink,
        }}
      >
        {op.title}
      </h4>
      <p style={{ ...prose, fontSize: "13px", marginBottom: "10px", opacity: 0.9 }}>{op.summary}</p>
      <ol style={{ ...prose, fontSize: "12px", paddingLeft: "20px", margin: 0 }}>
        {op.steps.map((step) => (
          <li key={step} style={{ marginBottom: "6px" }}>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

function HeapActionToggle({
  value,
  onChange,
}: {
  value: HeapPageAction;
  onChange: (value: HeapPageAction) => void;
}) {
  const actions: HeapPageAction[] = ["insert", "read", "delete", "update"];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px", marginBottom: "10px" }}>
      {actions.map((action) => {
        const meta = HEAP_ACTION_META[action];
        const active = value === action;
        return (
          <button
            key={action}
            type="button"
            onClick={() => onChange(action)}
            style={{
              padding: "10px 12px",
              fontSize: "10px",
              fontWeight: "bold",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontFamily: "'Space Mono', monospace",
              border: `2px solid ${ink}`,
              backgroundColor: active ? ink : "transparent",
              color: active ? meta.accent : ink,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}

export default function HowDatabasesArticle() {
  const [heapAction, setHeapAction] = useState<HeapPageAction>("insert");

  const heapSectionRef = useRef<HTMLElement>(null);
  const heapMount = useLazyMountScene(heapSectionRef);

  const sectionsById = useMemo(() => {
    const m = new Map<string, ArticleSection>();
    articleSections.forEach((s) => m.set(s.id, s));
    return m;
  }, []);

  const heapActionMeta = HEAP_ACTION_META[heapAction];
  const heapSection = sectionsById.get("heap-page");

  return (
    <main className="article-main" style={{ backgroundColor: "#F2EDE4", color: ink, minHeight: "100vh" }}>
      <article style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Link
          href="/blog"
          style={{
            fontSize: "11px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: red,
            textDecoration: "none",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          ← Blog index
        </Link>

        <p
          style={{
            marginTop: "28px",
            fontSize: "11px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: red,
            fontWeight: "bold",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          PostgreSQL internals · Visualization
        </p>

        <h1
          style={{
            fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
            fontSize: "clamp(2.8rem, 7vw, 4.2rem)",
            fontWeight: 900,
            textTransform: "uppercase",
            lineHeight: 0.95,
            marginTop: "12px",
            marginBottom: "16px",
          }}
        >
          How databases actually store data internally
        </h1>

        {articleIntro.paragraphs.map((p) => (
          <p key={p.slice(0, 40)} style={{ ...prose, opacity: 0.88, marginBottom: "18px", maxWidth: "820px" }}>
            {p}
          </p>
        ))}

        <p style={{ ...prose, fontSize: "13px", opacity: 0.75, marginBottom: "48px", maxWidth: "820px" }}>
          The figure loads when you scroll near it (or tap <strong style={{ fontWeight: 700 }}>Load 3D diagram</strong>). Drag to orbit;
          hover labeled blocks for definitions. Use the four operation buttons to match the animation with the written steps below.
        </p>

        {heapSection ? (
          <section ref={heapSectionRef} style={{ marginBottom: "72px" }} aria-labelledby="sec-heap">
            <div className="blog-section-layout">
              <div>
                <h2 id="sec-heap" style={{ ...h2 }}>
                  {heapSection.title}
                </h2>
                {heapSection.intro.map((para) => (
                  <p key={para.slice(0, 36)} style={{ ...prose, marginBottom: "16px" }}>
                    {para}
                  </p>
                ))}

                <SceneGate active={heapMount.active} onUnlock={heapMount.unlock} label={heapSection.shortLabel}>
                  <HeapPageScene actionMode={heapAction} />
                </SceneGate>

                <CollapsiblePanel
                  defaultOpen
                  summary="Animation controls · row operations"
                  style={{ marginTop: "14px", border: "2px solid #0A0A0A", backgroundColor: "rgba(255, 229, 0, 0.15)" }}
                  className="blog-collapsible-panel blog-controls-panel"
                >
                  <HeapActionToggle value={heapAction} onChange={setHeapAction} />
                  <p style={{ ...prose, fontSize: "13px", marginBottom: 0, opacity: 0.86 }}>
                    {heapActionMeta.summary}
                  </p>
                </CollapsiblePanel>

                <p style={{ ...prose, fontSize: "13px", opacity: 0.72, marginTop: "14px" }}>
                  {heapSection.figureCaption}
                </p>

                <CollapsiblePanel
                  defaultOpen={false}
                  summary="Parts of one heap page"
                  style={{ marginTop: "14px" }}
                  className="blog-collapsible-panel"
                >
                  <p style={{ ...prose, fontSize: "13px", marginBottom: "16px", opacity: 0.85 }}>
                    These regions match the classic PostgreSQL page diagram and the 3D model. External modules (FSM, buffer pool, WAL, disk)
                    sit beside the page because row operations reach them before bytes change inside the slab.
                  </p>
                  {heapSection.pageParts.map((part) => (
                    <PartExplainer key={part.id} part={part} />
                  ))}
                </CollapsiblePanel>

                <CollapsiblePanel
                  defaultOpen={false}
                  summary="How a row is read or modified through the page"
                  style={{ marginTop: "12px" }}
                  className="blog-collapsible-panel"
                >
                  <p style={{ ...prose, fontSize: "13px", marginBottom: "16px", opacity: 0.85 }}>
                    Based on the research notes for PostgreSQL heap storage: each operation below is what the animation is trying to show.
                    The highlighted card matches the active button above.
                  </p>
                  {heapSection.rowOperations.map((op) => (
                    <OperationExplainer key={op.id} op={op} active={heapAction === op.id} />
                  ))}
                </CollapsiblePanel>
              </div>

              <SectionSidebar
                section={heapSection}
                statsPanel={
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "12px",
                      lineHeight: 1.55,
                      borderLeft: `3px solid ${red}`,
                      paddingLeft: "12px",
                    }}
                  >
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ opacity: 0.65 }}>Selected flow · </span>
                      <strong>{heapActionMeta.label}</strong>
                    </div>
                    {heapActionMeta.readout.map((row) => (
                      <div key={row.label} style={{ marginBottom: "6px" }}>
                        <span style={{ opacity: 0.65 }}>{row.label} · </span>
                        <strong>{row.value}</strong>
                      </div>
                    ))}
                    <div style={{ marginTop: "8px", fontSize: "11px", opacity: 0.75 }}>
                      Read mode alternates cache hit and cache miss so you can compare both buffer paths.
                    </div>
                  </div>
                }
              />
            </div>
          </section>
        ) : null}

        <h2 style={{ ...h2, marginTop: "56px" }}>What to study next</h2>
        <ul style={{ ...prose, paddingLeft: "22px", marginBottom: "36px", maxWidth: "820px" }}>
          {furtherReading.map((item) => (
            <li key={item.href} style={{ marginBottom: "10px" }}>
              <a href={item.href} style={{ color: red }}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <Link
          href="/blog"
          style={{
            fontSize: "11px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            border: "2.5px solid #0A0A0A",
            padding: "12px 22px",
            textDecoration: "none",
            color: ink,
            fontFamily: "'Space Mono', monospace",
            display: "inline-block",
          }}
        >
          Back to blog index
        </Link>
      </article>
    </main>
  );
}

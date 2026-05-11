"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useMemo, useRef, useState } from "react";
import CollapsiblePanel from "@/components/blog/CollapsiblePanel";
import SceneGate from "@/components/blog/SceneGate";
import { useLazyMountScene } from "@/components/blog/useLazyMountScene";
import HeapPageScene, { HEAP_ACTION_META, type HeapPageAction } from "@/components/blog/scenes/HeapPageScene";
import SharedBuffersScene from "@/components/blog/scenes/SharedBuffersScene";
import type { BufferFlowMode } from "@/components/blog/scenes/SharedBuffersScene";
import ToastScene from "@/components/blog/scenes/ToastScene";
import {
  articleIntro,
  articleSections,
  furtherReading,
  type ArticleSection,
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

function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <label style={{ display: "block", marginBottom: "14px", cursor: "pointer" }}>
      <span
        style={{
          fontSize: "10px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          fontWeight: "bold",
          fontFamily: "'Space Mono', monospace",
          display: "block",
          marginBottom: "6px",
        }}
      >
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          accentColor: red,
          height: "6px",
        }}
      />
      {hint ? (
        <span style={{ fontSize: "11px", opacity: 0.72, display: "block", marginTop: "6px" }}>{hint}</span>
      ) : null}
    </label>
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

function ModeToggle({
  value,
  onChange,
}: {
  value: BufferFlowMode;
  onChange: (m: BufferFlowMode) => void;
}) {
  const modes: BufferFlowMode[] = ["auto", "hit", "miss"];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
      {modes.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          style={{
            flex: "1 1 auto",
            minWidth: "72px",
            padding: "8px 10px",
            fontSize: "10px",
            fontWeight: "bold",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontFamily: "'Space Mono', monospace",
            border: `2px solid ${ink}`,
            backgroundColor: value === m ? ink : "transparent",
            color: value === m ? "#FFE500" : ink,
            cursor: "pointer",
          }}
        >
          {m === "auto" ? "Auto demo" : m === "hit" ? "Cache hit" : "Cache miss"}
        </button>
      ))}
    </div>
  );
}

export default function HowDatabasesArticle() {
  const [heapAction, setHeapAction] = useState<HeapPageAction>("insert");
  const [toastChunks, setToastChunks] = useState(4);
  const [bufferMode, setBufferMode] = useState<BufferFlowMode>("auto");

  const heapSectionRef = useRef<HTMLElement>(null);
  const toastSectionRef = useRef<HTMLElement>(null);
  const bufferSectionRef = useRef<HTMLElement>(null);
  const heapMount = useLazyMountScene(heapSectionRef);
  const toastMount = useLazyMountScene(toastSectionRef);
  const bufferMount = useLazyMountScene(bufferSectionRef);

  const sectionsById = useMemo(() => {
    const m = new Map<string, ArticleSection>();
    articleSections.forEach((s) => m.set(s.id, s));
    return m;
  }, []);

  const heapActionMeta = HEAP_ACTION_META[heapAction];

  return (
    <main style={{ backgroundColor: "#F2EDE4", color: ink, minHeight: "100vh", padding: "100px 24px 88px" }}>
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
          Figures load when you scroll near them (or tap <strong style={{ fontWeight: 700 }}>Load 3D diagram</strong>) so the page stays light
          until you need the WebGL scenes. Drag each canvas to orbit; open the yellow research drawer on the right when you want citations
          and model mapping. Collapse <strong style={{ fontWeight: 700 }}>Simulation controls</strong> anytime to focus on reading.
        </p>

        {/* Section 1 */}
        {sectionsById.get("heap-page") ? (
          <section ref={heapSectionRef} style={{ marginBottom: "72px" }} aria-labelledby="sec-heap">
            <div className="blog-section-layout">
              <div>
                <h2 id="sec-heap" style={{ ...h2 }}>
                  {sectionsById.get("heap-page")!.title}
                </h2>
                {sectionsById.get("heap-page")!.intro.map((para) => (
                  <p key={para.slice(0, 36)} style={{ ...prose, marginBottom: "16px" }}>
                    {para}
                  </p>
                ))}

                <SceneGate
                  active={heapMount.active}
                  onUnlock={heapMount.unlock}
                  label={sectionsById.get("heap-page")!.shortLabel}
                >
                  <HeapPageScene actionMode={heapAction} />
                </SceneGate>

                <CollapsiblePanel
                  defaultOpen
                  summary="Simulation controls · Heap page"
                  style={{ marginTop: "14px", border: "2px solid #0A0A0A", backgroundColor: "rgba(255, 229, 0, 0.15)" }}
                  className="blog-collapsible-panel blog-controls-panel"
                >
                  <HeapActionToggle value={heapAction} onChange={setHeapAction} />
                  <p style={{ ...prose, fontSize: "13px", marginBottom: "10px", opacity: 0.86 }}>{heapActionMeta.summary}</p>
                  <ul style={{ ...prose, fontSize: "12px", paddingLeft: "18px", marginBottom: 0 }}>
                    {heapActionMeta.steps.map((step) => (
                      <li key={step} style={{ marginBottom: "6px" }}>
                        {step}
                      </li>
                    ))}
                  </ul>
                </CollapsiblePanel>

                <p style={{ ...prose, fontSize: "13px", opacity: 0.72, marginTop: "14px" }}>
                  {sectionsById.get("heap-page")!.figureCaption}
                </p>
              </div>

              <SectionSidebar
                section={sectionsById.get("heap-page")!}
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
                      The animation loops the selected operation so you can compare what moves outside the page with what changes inside it.
                    </div>
                  </div>
                }
              />
            </div>
          </section>
        ) : null}

        {/* Section 2 */}
        {sectionsById.get("toast") ? (
          <section ref={toastSectionRef} style={{ marginBottom: "72px" }} aria-labelledby="sec-toast">
            <div className="blog-section-layout">
              <div>
                <h2 id="sec-toast" style={{ ...h2 }}>
                  {sectionsById.get("toast")!.title}
                </h2>
                {sectionsById.get("toast")!.intro.map((para) => (
                  <p key={para.slice(0, 36)} style={{ ...prose, marginBottom: "16px" }}>
                    {para}
                  </p>
                ))}

                <SceneGate
                  active={toastMount.active}
                  onUnlock={toastMount.unlock}
                  label={sectionsById.get("toast")!.shortLabel}
                >
                  <ToastScene chunkCount={toastChunks} />
                </SceneGate>

                <CollapsiblePanel
                  defaultOpen
                  summary="Simulation controls · TOAST"
                  style={{ marginTop: "14px", border: "2px solid #0A0A0A", backgroundColor: "rgba(255, 229, 0, 0.15)" }}
                  className="blog-collapsible-panel blog-controls-panel"
                >
                  <ControlSlider
                    label="Toast chunk pages visible"
                    min={2}
                    max={6}
                    step={1}
                    value={toastChunks}
                    onChange={setToastChunks}
                    hint="Each increment adds another pg_toast-style page mesh and arrow — mirroring how wide values fan out."
                  />
                </CollapsiblePanel>

                <p style={{ ...prose, fontSize: "13px", opacity: 0.72, marginTop: "14px" }}>
                  {sectionsById.get("toast")!.figureCaption}
                </p>
              </div>

              <SectionSidebar
                section={sectionsById.get("toast")!}
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
                    <div>
                      <span style={{ opacity: 0.65 }}>Active toast pages · </span>
                      <strong>{toastChunks}</strong>
                    </div>
                    <div style={{ marginTop: "8px", fontSize: "11px", opacity: 0.75 }}>
                      Large payloads usually split until each chunk respects toast storage rules — this slider only changes how many pages
                      you see in the scene.
                    </div>
                  </div>
                }
              />
            </div>
          </section>
        ) : null}

        {/* Section 3 */}
        {sectionsById.get("shared-buffers") ? (
          <section ref={bufferSectionRef} style={{ marginBottom: "72px" }} aria-labelledby="sec-buffers">
            <div className="blog-section-layout">
              <div>
                <h2 id="sec-buffers" style={{ ...h2 }}>
                  {sectionsById.get("shared-buffers")!.title}
                </h2>
                {sectionsById.get("shared-buffers")!.intro.map((para) => (
                  <p key={para.slice(0, 36)} style={{ ...prose, marginBottom: "16px" }}>
                    {para}
                  </p>
                ))}

                <SceneGate
                  active={bufferMount.active}
                  onUnlock={bufferMount.unlock}
                  label={sectionsById.get("shared-buffers")!.shortLabel}
                >
                  <SharedBuffersScene flowMode={bufferMode} />
                </SceneGate>

                <CollapsiblePanel
                  defaultOpen
                  summary="Simulation controls · Shared buffers"
                  style={{ marginTop: "14px", border: "2px solid #0A0A0A", backgroundColor: "rgba(255, 229, 0, 0.15)" }}
                  className="blog-collapsible-panel blog-controls-panel"
                >
                  <p
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      fontFamily: "'Space Mono', monospace",
                      marginBottom: "10px",
                    }}
                  >
                    Query path (updates packet color & orbit)
                  </p>
                  <ModeToggle value={bufferMode} onChange={setBufferMode} />
                  <span style={{ fontSize: "11px", opacity: 0.75, display: "block", marginTop: "10px" }}>
                    Green sphere stays inside shared buffers on hits; orange traces disk IO on misses.
                  </span>
                </CollapsiblePanel>

                <p style={{ ...prose, fontSize: "13px", opacity: 0.72, marginTop: "14px" }}>
                  {sectionsById.get("shared-buffers")!.figureCaption}
                </p>
              </div>

              <SectionSidebar
                section={sectionsById.get("shared-buffers")!}
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
                    <div>
                      <span style={{ opacity: 0.65 }}>Active mode · </span>
                      <strong>
                        {bufferMode === "auto" ? "Alternating demo" : bufferMode === "hit" ? "Locked hit path" : "Locked miss path"}
                      </strong>
                    </div>
                    <div style={{ marginTop: "8px", fontSize: "11px", opacity: 0.75 }}>
                      Toggle matches how you might benchmark buffer-cache residency versus cold reads from disk.
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

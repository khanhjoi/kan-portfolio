"use client";
import { useEffect, useRef } from "react";

export default function Portfolio() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll(".reveal").forEach((el, i) => {
              setTimeout(() => el.classList.add("revealed"), i * 100);
            });
          }
        });
      },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="portfolio"
      style={{
        borderBottom: "3px solid #0A0A0A",
        padding: "100px 0",
        backgroundColor: "#0A0A0A",
        color: "#F2EDE4",
      }}
      ref={ref}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 60px" }}>
        <div className="reveal" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <span
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              color: "#FFE500",
              fontWeight: "bold",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            002 — Portfolio
          </span>
          <div style={{ height: "2px", width: "48px", backgroundColor: "#F2EDE4" }} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "48px",
            alignItems: "center",
          }}
        >
          <div className="reveal">
            <h2
              style={{
                fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                fontSize: "clamp(3rem, 7vw, 6rem)",
                fontWeight: 900,
                textTransform: "uppercase",
                lineHeight: 0.9,
                letterSpacing: "-0.01em",
                marginBottom: "24px",
              }}
            >
              My<br />
              <span style={{ color: "#FF2800" }}>Portfolio</span>
            </h2>
            <p
              style={{
                fontSize: "14px",
                lineHeight: 1.75,
                maxWidth: "520px",
                opacity: 0.92,
                marginBottom: "28px",
              }}
            >
              Case studies, shipped products, and experiments — designed and built end-to-end. Jump into the project grid for depth,
              or open the full archive when you are ready to browse everything in one place.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <a
                href="#projects"
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  border: "2.5px solid #FFE500",
                  padding: "12px 22px",
                  textDecoration: "none",
                  color: "#0A0A0A",
                  backgroundColor: "#FFE500",
                  transition: "all 0.15s",
                  fontFamily: "'Space Mono', monospace",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = "#FF2800";
                  el.style.borderColor = "#FF2800";
                  el.style.color = "#F2EDE4";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = "#FFE500";
                  el.style.borderColor = "#FFE500";
                  el.style.color = "#0A0A0A";
                }}
              >
                View selected work
              </a>
              <a
                href="https://github.com/khanhjoi"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  border: "2.5px solid #F2EDE4",
                  padding: "12px 22px",
                  textDecoration: "none",
                  color: "#F2EDE4",
                  transition: "all 0.15s",
                  fontFamily: "'Space Mono', monospace",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = "#F2EDE4";
                  el.style.color = "#0A0A0A";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = "transparent";
                  el.style.color = "#F2EDE4";
                }}
              >
                Full archive ↗
              </a>
            </div>
          </div>

          <div
            className="reveal"
            style={{
              border: "2.5px solid #F2EDE4",
              padding: "40px 36px",
              backgroundColor: "rgba(242, 237, 228, 0.04)",
              boxShadow: "8px 8px 0 #FFE500",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.28em",
                color: "#FFE500",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              Snapshot
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "18px" }}>
              {[
                { k: "Focus", v: "Product UI, data-heavy apps, polished marketing sites, Microservices" },
                { k: "Stack", v: "Microservices, React, TypeScript, Node.js, Java, Docker, Postgres, CICD" },
                { k: "Principles", v: "Accessibility, performance budgets, maintainable systems" },
              ].map((row) => (
                <li key={row.k}>
                  <span style={{ display: "block", fontSize: "10px", letterSpacing: "0.2em", opacity: 0.65, marginBottom: "6px" }}>
                    {row.k}
                  </span>
                  <span style={{ fontSize: "14px", lineHeight: 1.55 }}>{row.v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

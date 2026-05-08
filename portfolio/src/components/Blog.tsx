"use client";
import { useEffect, useRef } from "react";
import BlogThreeBackdrop from "@/components/BlogThreeBackdrop";

export default function Blog() {
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
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="blog"
      style={{
        borderBottom: "3px solid #0A0A0A",
        padding: "100px 0",
        backgroundColor: "#F2EDE4",
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
              color: "#FF2800",
              fontWeight: "bold",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            005 — Writing
          </span>
          <div style={{ height: "2px", width: "48px", backgroundColor: "#0A0A0A" }} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "40px",
            alignItems: "start",
          }}
        >
          <div className="reveal">
            <h2
              style={{
                fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                fontSize: "clamp(3rem, 7vw, 5.5rem)",
                fontWeight: 900,
                textTransform: "uppercase",
                lineHeight: 0.92,
                letterSpacing: "-0.01em",
                color: "#0A0A0A",
                marginBottom: "20px",
              }}
            >
              Building a<br />
              <span style={{ color: "#FF2800" }}>Blog</span>
            </h2>
            <p style={{ fontSize: "14px", lineHeight: 1.75, maxWidth: "540px", marginBottom: "18px" }}>
              I am assembling a writing space where I go deep on{" "}
              <span style={{ fontWeight: 700 }}>databases</span> — modeling, query patterns, indexing, migrations, and running Postgres
              in production — alongside interactive notes powered by{" "}
              <span style={{ fontWeight: 700 }}>Three.js</span> so ideas stay spatial and tangible, not just prose on a page.
            </p>
            <p style={{ fontSize: "13px", lineHeight: 1.7, maxWidth: "540px", opacity: 0.85, marginBottom: "28px" }}>
              Expect practical breakdowns: schema design trade-offs, observability for slow queries, and lightweight 3D sketches that
              explain concepts worth seeing from more than one angle.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "22px" }}>
              {["Postgres", "SQL", "Three.js", "WebGL", "Next.js"].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    border: "2px solid #0A0A0A",
                    padding: "6px 12px",
                    backgroundColor: tag === "Three.js" ? "#FFE500" : "transparent",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <a
              href="/blog"
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                border: "2.5px solid #0A0A0A",
                padding: "12px 22px",
                textDecoration: "none",
                color: "#0A0A0A",
                transition: "all 0.15s",
                fontFamily: "'Space Mono', monospace",
                display: "inline-block",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = "#0A0A0A";
                el.style.color = "#F2EDE4";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = "transparent";
                el.style.color = "#0A0A0A";
              }}
            >
              Featured post ↗
            </a>
          </div>

          <div className="reveal">
            <BlogThreeBackdrop />
            <p
              style={{
                marginTop: "14px",
                fontSize: "11px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                opacity: 0.72,
              }}
            >
              Live Three.js backdrop — same tech stack as the articles will use for demos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

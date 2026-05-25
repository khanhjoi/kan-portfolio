"use client";
import Link from "next/link";
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
      <div className="site-container">
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
              Research<br />
              <span style={{ color: "#FF2800" }}>Together</span>
            </h2>
            <p style={{ fontSize: "14px", lineHeight: 1.75, maxWidth: "540px", marginBottom: "18px" }}>
              I&apos;m building a small writing space where our group sits down and goes deep on{" "}
              <span style={{ fontWeight: 700 }}>software engineering</span> — the parts you only learn by breaking things, fixing them,
              and arguing about trade-offs. 
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "22px" }}>
              {["Software Engineering", "Research", "Microservices", "Cloud Computing", "AI", "Data Engineering"].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    border: "2px solid #0A0A0A",
                    padding: "6px 12px",
                    backgroundColor: tag === "Research" ? "#FFE500" : "transparent",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
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
              Read our notes ↗
            </Link>
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
              One request hops Gateway → services → Postgres — the pattern behind most microservice stacks.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

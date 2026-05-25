"use client";
import { useEffect, useRef } from "react";

const facts = [
  { label: "Experience", value: "X+ Years" },
  { label: "Projects Shipped", value: "20+" },
  { label: "Focus", value: "React / Next.js" },
  { label: "Location", value: "Your City 📍" },
  { label: "Status", value: "Open to Work ✦" },
];

export default function About() {
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
    <section id="about" style={{
      borderBottom: "3px solid #0A0A0A",
      padding: "100px 0",
      backgroundColor: "#F2EDE4",
    }} ref={ref}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 60px" }}>

        {/* Label */}
        <div className="reveal" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "64px" }}>
          <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3em", color: "#FF2800", fontWeight: "bold", fontFamily: "'Space Mono', monospace" }}>
            001 — About
          </span>
          <div style={{ height: "2px", width: "64px", backgroundColor: "#0A0A0A" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>

          {/* Left */}
          <div className="reveal" style={{
            border: "2.5px solid #0A0A0A", borderRight: "none",
            padding: "56px",
          }}>
            <h2 style={{
              fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
              fontSize: "clamp(3rem, 6vw, 5rem)",
              fontWeight: 900, textTransform: "uppercase",
              lineHeight: 0.9, letterSpacing: "-0.01em",
              marginBottom: "40px", color: "#0A0A0A",
            }}>
              Who<br /><span style={{ color: "#FF2800" }}>Am I?</span>
            </h2>

            <p style={{ fontSize: "13px", lineHeight: 2, color: "#333", marginBottom: "20px", fontFamily: "'Space Mono', monospace" }}>
              I'm a Software Engineer who believes the web should be fast,
              purposeful, and a little bit opinionated. I've been crafting
              digital experiences for <span style={{ backgroundColor: "#FFE500", padding: "0 4px", fontWeight: "bold" }}>2+ years</span>.
            </p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[
                { label: "Let's Talk →", href: "#contact", bg: "transparent", hoverBg: "#FF2800", hoverColor: "white" },
                { label: "Resume ↗", href: "/resume.pdf", bg: "transparent", hoverBg: "#FFE500", hoverColor: "#0A0A0A" },
              ].map(btn => (
                <a key={btn.label} href={btn.href} style={{
                  border: "2.5px solid #0A0A0A", padding: "10px 24px",
                  fontSize: "11px", fontWeight: "bold", textTransform: "uppercase",
                  letterSpacing: "0.15em", textDecoration: "none", color: "#0A0A0A",
                  backgroundColor: btn.bg, transition: "all 0.2s",
                  fontFamily: "'Space Mono', monospace",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = btn.hoverBg; el.style.color = btn.hoverColor; if (btn.hoverBg === "#FF2800") el.style.borderColor = "#FF2800"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = btn.bg; el.style.color = "#0A0A0A"; el.style.borderColor = "#0A0A0A"; }}
                >{btn.label}</a>
              ))}
            </div>
          </div>

          {/* Right — dark */}
          <div className="reveal" style={{
            border: "2.5px solid #0A0A0A", backgroundColor: "#0A0A0A",
            color: "#F2EDE4", padding: "56px",
          }}>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3em", color: "#FF2800", marginBottom: "32px", fontWeight: "bold", fontFamily: "'Space Mono', monospace" }}>
              Quick Facts
            </p>
            {facts.map(({ label, value }) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "18px 0", borderBottom: "1px solid #1E1E1E",
              }}>
                <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#666", fontFamily: "'Space Mono', monospace" }}>{label}</span>
                <span style={{ fontWeight: "bold", fontSize: "13px", fontFamily: "'Space Mono', monospace" }}>{value}</span>
              </div>
            ))}
            <div style={{ marginTop: "40px", display: "flex", gap: "8px" }}>
              <div style={{ height: "4px", width: "48px", backgroundColor: "#FF2800" }} />
              <div style={{ height: "4px", width: "24px", backgroundColor: "#FFE500" }} />
              <div style={{ height: "4px", width: "12px", backgroundColor: "#444" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
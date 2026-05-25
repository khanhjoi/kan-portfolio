"use client";
import { useEffect, useState } from "react";

const roles = ["Software Developer", "UI Craftsman", "Web Developer", "Data Engineer"];

const marqueeItems = [
  "NEXT.JS","★","REACT","★","TAILWIND","★","TYPESCRIPT","★","CSS",
  "★","NODE.JS","★","FIGMA","★","GITHUB","★","DOCKER","★",
  "NEXT.JS","★","REACT","★","TAILWIND","★","SPRING BOOT","★",
  "FRAMER MOTION","★","CSS","★","NODE.JS","★","JAVA","★",
];

export default function Hero() {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const target = roles[index];
    let i = displayed.length;
    if (typing) {
      if (i < target.length) {
        const t = setTimeout(() => setDisplayed(target.slice(0, i + 1)), 65);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setTyping(false), 1800);
        return () => clearTimeout(t);
      }
    } else {
      if (i > 0) {
        const t = setTimeout(() => setDisplayed(target.slice(0, i - 1)), 35);
        return () => clearTimeout(t);
      } else {
        setIndex((p) => (p + 1) % roles.length);
        setTyping(true);
      }
    }
  }, [displayed, typing, index]);

  return (
    <section
      id="hero"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderBottom: "3px solid #0A0A0A",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#F2EDE4",
      }}
    >
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04,
        backgroundImage: "linear-gradient(#0A0A0A 1px, transparent 1px), linear-gradient(90deg, #0A0A0A 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }} />

      {/* Content */}
      <div style={{
        maxWidth: "1280px",
        width: "100%",
        margin: "0 auto",
        padding: "120px 60px 80px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
      }}>

        {/* Available badge */}
        <div className="anim-fade-up delay-100" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          border: "2.5px solid #0A0A0A", padding: "8px 16px",
          fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase",
          fontWeight: "bold", marginBottom: "48px", backgroundColor: "#FFE500",
          width: "fit-content", fontFamily: "'Space Mono', monospace",
        }}>
          <span style={{
            width: "8px", height: "8px", borderRadius: "50%",
            backgroundColor: "#0A0A0A", display: "inline-block",
          }} />
          Available for work
        </div>

        {/* Name lines */}
        <h1 className="anim-slide-left delay-200" style={{
          fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
          fontSize: "clamp(5rem, 14vw, 12rem)",
          lineHeight: 0.9,
          fontWeight: 900,
          textTransform: "uppercase",
          marginBottom: "4px",
          color: "#0A0A0A",
          letterSpacing: "-0.01em",
        }}>
          Khanh
        </h1>
        <h1 className="anim-slide-left delay-300" style={{
          fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
          fontSize: "clamp(5rem, 14vw, 12rem)",
          lineHeight: 0.9,
          fontWeight: 900,
          textTransform: "uppercase",
          color: "#FF2800",
          marginBottom: "40px",
          letterSpacing: "-0.01em",
        }}>
          Nguyen
        </h1>

        {/* Role typewriter */}
        <div className="anim-fade-up delay-400" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          backgroundColor: "#0A0A0A", color: "#FFE500",
          border: "2.5px solid #0A0A0A", padding: "12px 20px",
          marginBottom: "32px", width: "fit-content",
        }}>
          <span style={{ color: "#FF2800", fontSize: "14px", fontFamily: "'Space Mono', monospace" }}>// </span>
          <span style={{
            fontSize: "clamp(14px, 2vw, 18px)", fontWeight: "bold",
            letterSpacing: "0.05em", fontFamily: "'Space Mono', monospace",
            minWidth: "220px",
          }}>
            {displayed}
            <span style={{ color: "#FF2800" }}>|</span>
          </span>
        </div>

        {/* Description */}
        <p className="anim-fade-up delay-500" style={{
          maxWidth: "520px", fontSize: "14px", lineHeight: 1.9,
          marginBottom: "44px", borderLeft: "3px solid #FF2800",
          paddingLeft: "20px", color: "#333",
          fontFamily: "'Space Mono', monospace",
        }}>
          I build fast, accessible, and brutally honest web interfaces.<br />
          No fluff. Just clean code and strong opinions about the web.
        </p>

        {/* CTAs */}
        <div className="anim-fade-up delay-600" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <a href="#projects" style={{
            border: "2.5px solid #0A0A0A", padding: "14px 36px",
            fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.15em",
            fontSize: "12px", backgroundColor: "#0A0A0A", color: "#F2EDE4",
            textDecoration: "none", transition: "background 0.2s, border-color 0.2s",
            fontFamily: "'Space Mono', monospace", display: "inline-block",
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#FF2800"; el.style.borderColor = "#FF2800"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#0A0A0A"; el.style.borderColor = "#0A0A0A"; }}
          >
            See My Work →
          </a>
          <a href="#contact" style={{
            border: "2.5px solid #0A0A0A", padding: "14px 36px",
            fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.15em",
            fontSize: "12px", backgroundColor: "transparent", color: "#0A0A0A",
            textDecoration: "none", transition: "background 0.2s",
            fontFamily: "'Space Mono', monospace", display: "inline-block",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#FFE500"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
          >
            Get In Touch
          </a>
        </div>

        {/* Ghost number */}
        <div style={{
          position: "absolute", right: "60px", bottom: "0",
          fontSize: "clamp(8rem, 20vw, 18rem)", fontWeight: 900, color: "#0A0A0A",
          opacity: 0.04, lineHeight: 1, userSelect: "none", pointerEvents: "none",
          fontFamily: "'Bebas Neue', sans-serif",
        }}>01</div>

        {/* Dot grid */}
        <div style={{
          position: "absolute", right: "64px", top: "130px",
          display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px",
          opacity: 0.15,
        }}>
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#0A0A0A" }} />
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: "32px", left: "60px",
          display: "flex", alignItems: "center", gap: "12px",
          fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.25em",
          color: "#8A8A8A", fontFamily: "'Space Mono', monospace",
        }}>
          <div style={{ width: "32px", height: "1px", backgroundColor: "#8A8A8A" }} />
          Scroll
        </div>
      </div>

      {/* Marquee strip */}
      <div style={{
        borderTop: "3px solid #0A0A0A", backgroundColor: "#FF2800",
        color: "#F2EDE4", padding: "12px 0", overflow: "hidden", flexShrink: 0,
      }}>
        <div className="marquee-track">
          {marqueeItems.map((item, i) => (
            <span key={i} style={{
              fontSize: "11px", fontWeight: "bold", textTransform: "uppercase",
              letterSpacing: "0.2em", padding: "0 24px", whiteSpace: "nowrap",
              fontFamily: "'Space Mono', monospace",
            }}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
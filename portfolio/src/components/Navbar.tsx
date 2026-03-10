"use client";
import { useState, useEffect } from "react";

const links = ["About", "Projects", "Skills", "Contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    links.forEach((l) => {
      const el = document.getElementById(l.toLowerCase());
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      backgroundColor: scrolled ? "#F2EDE4" : "transparent",
      borderBottom: scrolled ? "2.5px solid #0A0A0A" : "2.5px solid transparent",
      boxShadow: scrolled ? "0 4px 0 #0A0A0A" : "none",
      transition: "all 0.3s",
    }}>
      <div style={{
        maxWidth: "1280px", margin: "0 auto",
        padding: "0 60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "64px",
      }}>
        {/* Logo */}
        <a href="#hero" style={{
          fontSize: "20px", fontWeight: 900, textTransform: "uppercase",
          letterSpacing: "-0.03em", textDecoration: "none", color: "#0A0A0A",
          fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
          transition: "color 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#FF2800"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#0A0A0A"}
        >
          YN<span style={{ color: "#FF2800" }}>.</span>
        </a>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              style={{
                display: "block", padding: "6px 16px",
                fontSize: "11px", fontWeight: "bold", textTransform: "uppercase",
                letterSpacing: "0.18em", textDecoration: "none",
                backgroundColor: active === link.toLowerCase() ? "#0A0A0A" : "transparent",
                color: active === link.toLowerCase() ? "#FFE500" : "#0A0A0A",
                border: "2px solid transparent",
                transition: "all 0.15s",
                fontFamily: "'Space Mono', monospace",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                if (active !== link.toLowerCase()) {
                  el.style.backgroundColor = "#0A0A0A";
                  el.style.color = "#F2EDE4";
                }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                if (active !== link.toLowerCase()) {
                  el.style.backgroundColor = "transparent";
                  el.style.color = "#0A0A0A";
                }
              }}
            >
              {link}
            </a>
          ))}

          {/* Resume */}
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" style={{
            display: "block", padding: "6px 16px", marginLeft: "12px",
            fontSize: "11px", fontWeight: "bold", textTransform: "uppercase",
            letterSpacing: "0.18em", textDecoration: "none",
            border: "2.5px solid #0A0A0A", color: "#0A0A0A",
            transition: "all 0.15s", fontFamily: "'Space Mono', monospace",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = "#FF2800";
            el.style.borderColor = "#FF2800";
            el.style.color = "white";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = "transparent";
            el.style.borderColor = "#0A0A0A";
            el.style.color = "#0A0A0A";
          }}
          >
            Resume ↗
          </a>
        </div>
      </div>
    </nav>
  );
}
"use client";
import { useEffect, useRef } from "react";

const socials = [
  { label: "Email", handle: "you@email.com", href: "mailto:you@email.com" },
  { label: "GitHub", handle: "github.com/you", href: "https://github.com/you" },
  { label: "LinkedIn", handle: "linkedin.com/in/you", href: "https://linkedin.com/in/you" },
  { label: "Twitter / X", handle: "@yourhandle", href: "https://x.com/yourhandle" },
];

export default function Contact() {
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
    <section id="contact" style={{
      padding: "100px 0 80px",
      backgroundColor: "#F2EDE4",
    }} ref={ref}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 60px" }}>

        {/* Label */}
        <div className="reveal" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3em", color: "#FF2800", fontWeight: "bold", fontFamily: "'Space Mono', monospace" }}>
            004 — Connect
          </span>
          <div style={{ height: "2px", width: "48px", backgroundColor: "#0A0A0A" }} />
        </div>

        {/* Big heading */}
        <h2 className="reveal" style={{
          fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
          fontSize: "clamp(4rem, 12vw, 11rem)",
          fontWeight: 900, textTransform: "uppercase",
          lineHeight: 0.85, letterSpacing: "-0.02em",
          marginBottom: "32px", color: "#0A0A0A",
        }}>
          Let's<br />
          <span style={{ color: "#FF2800" }}>Build</span><br />
          Together<span style={{ color: "#FF2800" }}>.</span>
        </h2>

        {/* Subtitle */}
        <p className="reveal" style={{
          maxWidth: "480px", fontSize: "13px", lineHeight: 2,
          color: "#444", marginBottom: "64px",
          borderLeft: "3px solid #FF2800", paddingLeft: "20px",
          fontFamily: "'Space Mono', monospace",
        }}>
          Open to freelance projects, full-time roles, or just a good chat
          about the web. I reply within 24 hours.
        </p>

        {/* Social cards */}
        <div className="reveal" style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0", marginBottom: "48px",
        }}>
          {socials.map((s, i) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              style={{
                display: "block", textDecoration: "none", color: "#0A0A0A",
                border: "2.5px solid #0A0A0A",
                borderRight: i < socials.length - 1 ? "none" : "2.5px solid #0A0A0A",
                padding: "36px 32px",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = "#FF2800";
                el.style.color = "#F2EDE4";
                const sub = el.querySelector(".social-label") as HTMLElement;
                if (sub) sub.style.color = "rgba(255,255,255,0.6)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = "transparent";
                el.style.color = "#0A0A0A";
                const sub = el.querySelector(".social-label") as HTMLElement;
                if (sub) sub.style.color = "#8A8A8A";
              }}
            >
              <p className="social-label" style={{
                fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.3em",
                color: "#8A8A8A", marginBottom: "12px", fontWeight: "bold",
                fontFamily: "'Space Mono', monospace", transition: "color 0.2s",
              }}>
                {s.label}
              </p>
              <p style={{
                fontWeight: "bold", fontSize: "12px",
                fontFamily: "'Space Mono', monospace",
                wordBreak: "break-all",
              }}>
                → {s.handle}
              </p>
            </a>
          ))}
        </div>

        {/* Big CTA email block */}
        <div className="reveal" style={{
          border: "2.5px solid #0A0A0A", backgroundColor: "#0A0A0A",
          color: "#F2EDE4", padding: "48px 56px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: "32px",
          marginBottom: "64px",
        }}>
          <div>
            <p style={{
              fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.3em",
              color: "#555", marginBottom: "10px", fontFamily: "'Space Mono', monospace",
            }}>
              Preferred contact
            </p>
            <a href="mailto:you@email.com" style={{
              fontSize: "clamp(1.2rem, 3vw, 2rem)", fontWeight: "bold",
              color: "#F2EDE4", textDecoration: "none",
              fontFamily: "'Space Mono', monospace", transition: "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#FFE500"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#F2EDE4"}
            >
              you@email.com
            </a>
          </div>
          <a href="mailto:you@email.com" style={{
            border: "2.5px solid #F2EDE4", padding: "14px 36px",
            fontSize: "11px", fontWeight: "bold", textTransform: "uppercase",
            letterSpacing: "0.18em", textDecoration: "none", color: "#F2EDE4",
            transition: "all 0.2s", fontFamily: "'Space Mono', monospace",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = "#FF2800";
            el.style.borderColor = "#FF2800";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = "transparent";
            el.style.borderColor = "#F2EDE4";
          }}
          >
            Say Hello →
          </a>
        </div>

        {/* Footer */}
        <div className="reveal" style={{
          borderTop: "2.5px solid #0A0A0A", paddingTop: "32px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "16px",
        }}>
          <span style={{
            fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em",
            color: "#8A8A8A", fontFamily: "'Space Mono', monospace",
          }}>
            © {new Date().getFullYear()} Your Name — All rights reserved
          </span>
          <span style={{
            fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em",
            color: "#8A8A8A", fontFamily: "'Space Mono', monospace",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            Built with
            <span style={{ color: "#FF2800", fontWeight: "bold" }}>Next.js</span>
            +
            <span style={{ color: "#FF2800", fontWeight: "bold" }}>Tailwind CSS</span>
          </span>
        </div>

      </div>
    </section>
  );
}
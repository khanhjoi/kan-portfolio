"use client";
import { useEffect, useRef, useState } from "react";

const skillGroups = [
  {
    category: "Core",
    color: "#FF2800",
    items: [
      { name: "HTML5 / CSS3", level: 98 },
      { name: "JavaScript ES6+", level: 95 },
      { name: "TypeScript", level: 88 },
    ],
  },
  {
    category: "Frameworks",
    color: "#0A0A0A",
    items: [
      { name: "React", level: 95 },
      { name: "Next.js", level: 90 },
      { name: "Vue.js", level: 65 },
    ],
  },
  {
    category: "Styling",
    color: "#FF2800",
    items: [
      { name: "Tailwind CSS", level: 95 },
      { name: "SCSS / Modules", level: 88 },
      { name: "Framer Motion", level: 80 },
    ],
  },
  {
    category: "Tools",
    color: "#0A0A0A",
    items: [
      { name: "Git / GitHub", level: 90 },
      { name: "Figma", level: 82 },
      { name: "Vercel / CI-CD", level: 85 },
    ],
  },
];

const techBadges = [
  "React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion",
  "Node.js", "Git", "Figma", "Vercel", "Vite", "SCSS", "REST APIs",
  "GraphQL", "Storybook", "Jest", "Zod",
];

export default function Skills() {
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setAnimate(true);
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
    <section id="skills" style={{
      borderBottom: "3px solid #0A0A0A",
      padding: "100px 0",
      backgroundColor: "#F2EDE4",
    }} ref={ref}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 60px" }}>

        {/* Label */}
        <div className="reveal" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3em", color: "#FF2800", fontWeight: "bold", fontFamily: "'Space Mono', monospace" }}>
            004 — Toolkit
          </span>
          <div style={{ height: "2px", width: "48px", backgroundColor: "#0A0A0A" }} />
        </div>

        <h2 className="reveal" style={{
          fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
          fontSize: "clamp(3rem, 7vw, 6rem)",
          fontWeight: 900, textTransform: "uppercase",
          lineHeight: 0.9, letterSpacing: "-0.01em",
          marginBottom: "64px", color: "#0A0A0A",
        }}>
          Skills &<br /><span style={{ color: "#FF2800" }}>Technologies</span>
        </h2>

        {/* 4-col skill bars */}
        <div className="reveal" style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0", marginBottom: "48px",
        }}>
          {skillGroups.map((group, gi) => (
            <div key={group.category} style={{
              border: "2.5px solid #0A0A0A",
              borderRight: gi < skillGroups.length - 1 ? "none" : "2.5px solid #0A0A0A",
              padding: "40px 32px",
            }}>
              {/* Category header */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}>
                <div style={{ width: "8px", height: "8px", backgroundColor: group.color, flexShrink: 0 }} />
                <span style={{
                  fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.25em",
                  fontWeight: "bold", fontFamily: "'Space Mono', monospace",
                }}>{group.category}</span>
              </div>

              {/* Skill bars */}
              {group.items.map((item, ii) => (
                <div key={item.name} style={{ marginBottom: ii < group.items.length - 1 ? "24px" : "0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Space Mono', monospace" }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: "11px", color: "#8A8A8A", fontFamily: "'Space Mono', monospace" }}>
                      {item.level}%
                    </span>
                  </div>
                  <div style={{
                    height: "6px", backgroundColor: "#E5E0D8",
                    border: "1px solid #C8C0B4", overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: animate ? `${item.level}%` : "0%",
                      backgroundColor: group.color,
                      transition: `width 1.2s cubic-bezier(0.22, 1, 0.36, 1)`,
                      transitionDelay: `${gi * 100 + ii * 120}ms`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Also worked with */}
        <div className="reveal" style={{
          border: "2.5px solid #0A0A0A", padding: "40px 48px",
        }}>
          <p style={{
            fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.3em",
            color: "#8A8A8A", marginBottom: "24px", fontWeight: "bold",
            fontFamily: "'Space Mono', monospace",
          }}>
            Also worked with
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {techBadges.map((tech) => (
              <span key={tech} style={{
                fontSize: "10px", fontWeight: "bold", textTransform: "uppercase",
                letterSpacing: "0.15em", border: "2px solid #0A0A0A",
                padding: "6px 14px", cursor: "default",
                fontFamily: "'Space Mono', monospace", transition: "all 0.15s",
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#0A0A0A"; el.style.color = "#FFE500"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "transparent"; el.style.color = "#0A0A0A"; }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
"use client";
import { useEffect, useRef, type MouseEvent } from "react";

import { resumePdfHref } from "@/lib/site";

const RESUME_HREF = resumePdfHref();

const projects = [
  {
    num: "01",
    title: "Blueprint (HRM)",
    desc: "Human Resource Management platform for CLV — core system for staff records and internal HR workflows. Refactored legacy code and shipped features such as certificate management.",
    tags: ["Spring Boot", "Oracle", "Webix"],
    year: "2025",
  },
  {
    num: "02",
    title: "AMS",
    desc: "Asset Management System for IT/HR/account assets (devices, AI tools, licenses). NestJS backend with queue-based email processing; Next.js frontend with ongoing legacy modernization.",
    tags: ["NestJS", "Next.js", "PostgreSQL"],
    year: "2025",
  },
  {
    num: "03",
    title: "Shipping Route Mgmt",
    desc: "Microservices platform with NestJS services (API Gateway, User Service) and a Next.js UI. gRPC, Kafka, and REST between services; Redis caching; reusable NPM libraries cut duplication ~30%.",
    tags: ["NestJS", "Kafka", "gRPC"],
    year: "2024",
  },
  {
    num: "04",
    title: "CPS",
    desc: "Internal consultant platform — NestJS clean architecture with GraphQL APIs on PostgreSQL; Next.js UI with Tailwind and Ant Design. Maintenance and cross-module bug fixes.",
    tags: ["GraphQL", "NestJS", "Next.js"],
    year: "2025",
  },
];

export default function Projects() {
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
      { threshold: 0.08 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="projects" style={{
      borderBottom: "3px solid #0A0A0A",
      padding: "100px 0",
      backgroundColor: "#F2EDE4",
    }} ref={ref}>
      <div className="site-container">

        {/* Header */}
        <div className="reveal" style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          borderBottom: "2.5px solid #0A0A0A", paddingBottom: "32px", marginBottom: "64px",
          flexWrap: "wrap", gap: "24px",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3em", color: "#FF2800", fontWeight: "bold", fontFamily: "'Space Mono', monospace" }}>
                003 — Work
              </span>
              <div style={{ height: "2px", width: "48px", backgroundColor: "#0A0A0A" }} />
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
              fontSize: "clamp(3rem, 7vw, 6rem)",
              fontWeight: 900, textTransform: "uppercase",
              lineHeight: 0.9, letterSpacing: "-0.01em", color: "#0A0A0A",
            }}>
              Selected<br /><span style={{ color: "#FF2800" }}>Projects</span>
            </h2>
          </div>
          <a
            href={RESUME_HREF}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "11px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              border: "2.5px solid #0A0A0A",
              padding: "10px 20px",
              textDecoration: "none",
              color: "#0A0A0A",
              transition: "all 0.15s",
              fontFamily: "'Space Mono', monospace",
              alignSelf: "flex-end",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.backgroundColor = "#FFE500";
              el.style.color = "#0A0A0A";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.backgroundColor = "transparent";
              el.style.color = "#0A0A0A";
            }}
          >
            Resume ↗
          </a>
        </div>

        {/* Project grid — 2x2 */}
        <div className="projects-grid">
          {projects.map((p, i) => {
            const isLeft = i % 2 === 0;
            const isTop = i < 2;
            const cardStyle = {
              display: "block" as const,
              textDecoration: "none",
              color: "#0A0A0A",
              border: "2.5px solid #0A0A0A",
              borderRight: isLeft ? "none" : "2.5px solid #0A0A0A",
              borderBottom: isTop ? "none" : "2.5px solid #0A0A0A",
              padding: "48px",
              position: "relative" as const,
              overflow: "hidden" as const,
              transition: "all 0.3s",
              transitionDelay: `${i * 80}ms`,
              cursor: "default",
            };

            const onCardEnter = (e: MouseEvent<HTMLElement>) => {
              const el = e.currentTarget;
              el.style.backgroundColor = "#0A0A0A";
              el.style.color = "#F2EDE4";
              const num = el.querySelector(".proj-num") as HTMLElement;
              const tags = el.querySelectorAll(".proj-tag") as NodeListOf<HTMLElement>;
              const desc = el.querySelector(".proj-desc") as HTMLElement;
              if (num) num.style.color = "#FF2800";
              if (desc) desc.style.color = "#999";
              tags.forEach((t) => {
                t.style.borderColor = "#444";
                t.style.color = "#777";
              });
            };

            const onCardLeave = (e: MouseEvent<HTMLElement>) => {
              const el = e.currentTarget;
              el.style.backgroundColor = "transparent";
              el.style.color = "#0A0A0A";
              const num = el.querySelector(".proj-num") as HTMLElement;
              const tags = el.querySelectorAll(".proj-tag") as NodeListOf<HTMLElement>;
              const desc = el.querySelector(".proj-desc") as HTMLElement;
              if (num) num.style.color = "#0A0A0A";
              if (desc) desc.style.color = "#444";
              tags.forEach((t) => {
                t.style.borderColor = "#0A0A0A";
                t.style.color = "#0A0A0A";
              });
            };

            return (
              <article
                key={p.num}
                className="reveal project-card"
                style={cardStyle}
                onMouseEnter={onCardEnter}
                onMouseLeave={onCardLeave}
              >
                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <span className="proj-num" style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "5rem", lineHeight: 1, fontWeight: 900,
                    opacity: 0.1, color: "#0A0A0A", transition: "color 0.3s",
                  }}>{p.num}</span>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                    <span style={{ fontSize: "11px", color: "#8A8A8A", textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "'Space Mono', monospace" }}>{p.year}</span>
                    <span style={{ fontSize: "20px", opacity: 0, transition: "opacity 0.3s" }} className="proj-arrow">↗</span>
                  </div>
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                  fontWeight: 900, textTransform: "uppercase",
                  letterSpacing: "-0.01em", marginBottom: "12px",
                }}>
                  {p.title}
                </h3>

                {/* Desc */}
                <p className="proj-desc" style={{
                  fontSize: "13px", lineHeight: 1.8, color: "#444",
                  marginBottom: "24px", fontFamily: "'Space Mono', monospace",
                  transition: "color 0.3s",
                }}>
                  {p.desc}
                </p>

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {p.tags.map(tag => (
                    <span key={tag} className="proj-tag" style={{
                      fontSize: "10px", fontWeight: "bold", textTransform: "uppercase",
                      letterSpacing: "0.15em", border: "2px solid #0A0A0A",
                      padding: "3px 10px", fontFamily: "'Space Mono', monospace",
                      transition: "all 0.3s",
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
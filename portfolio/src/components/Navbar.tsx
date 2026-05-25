"use client";
import { useState, useEffect, type CSSProperties, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { homeSectionHref, resumePdfHref, withBasePath } from "@/lib/site";

const links = ["About", "Portfolio", "Projects", "Skills", "Blog", "Contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/" || pathname === "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!onHome) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    links.forEach((l) => {
      const el = document.getElementById(l.toLowerCase());
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [onHome]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navHref = (link: string) => {
    const id = link.toLowerCase();
    if (id === "blog" && !onHome) return withBasePath("/blog");
    if (onHome) return `#${id}`;
    return homeSectionHref(id);
  };

  const linkStyle = (link: string): CSSProperties => ({
    display: "block",
    padding: "6px 16px",
    fontSize: "11px",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    textDecoration: "none",
    backgroundColor: onHome && active === link.toLowerCase() ? "#0A0A0A" : "transparent",
    color: onHome && active === link.toLowerCase() ? "#FFE500" : "#0A0A0A",
    border: "2px solid transparent",
    transition: "all 0.15s",
    fontFamily: "'Space Mono', monospace",
  });

  const onLinkEnter = (e: MouseEvent<HTMLAnchorElement>, link: string) => {
    const el = e.currentTarget;
    if (!(onHome && active === link.toLowerCase())) {
      el.style.backgroundColor = "#0A0A0A";
      el.style.color = "#F2EDE4";
    }
  };

  const onLinkLeave = (e: MouseEvent<HTMLAnchorElement>, link: string) => {
    const el = e.currentTarget;
    if (!(onHome && active === link.toLowerCase())) {
      el.style.backgroundColor = "transparent";
      el.style.color = "#0A0A0A";
    }
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: scrolled ? "#F2EDE4" : "transparent",
        borderBottom: scrolled ? "2.5px solid #0A0A0A" : "2.5px solid transparent",
        boxShadow: scrolled ? "0 4px 0 #0A0A0A" : "none",
        transition: "all 0.3s",
      }}
    >
      <div className="nav-inner">
        <a
          href={withBasePath("/")}
          style={{
            fontSize: "20px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "-0.03em",
            textDecoration: "none",
            color: "#0A0A0A",
            fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
            transition: "color 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#FF2800")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#0A0A0A")}
        >
          YN<span style={{ color: "#FF2800" }}>.</span>
        </a>

        <div className="nav-links">
          {links.map((link) => (
            <a
              key={link}
              href={navHref(link)}
              style={linkStyle(link)}
              onMouseEnter={(e) => onLinkEnter(e, link)}
              onMouseLeave={(e) => onLinkLeave(e, link)}
            >
              {link}
            </a>
          ))}
          <a
            href={resumePdfHref()}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: "6px 16px",
              marginLeft: "12px",
              fontSize: "11px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              textDecoration: "none",
              border: "2.5px solid #0A0A0A",
              color: "#0A0A0A",
              transition: "all 0.15s",
              fontFamily: "'Space Mono', monospace",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.backgroundColor = "#FF2800";
              el.style.borderColor = "#FF2800";
              el.style.color = "white";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.backgroundColor = "transparent";
              el.style.borderColor = "#0A0A0A";
              el.style.color = "#0A0A0A";
            }}
          >
            Resume ↗
          </a>
        </div>

        <button
          type="button"
          className="nav-menu-btn"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      <div className={`nav-drawer${menuOpen ? " open" : ""}`}>
        {links.map((link) => (
          <a
            key={link}
            href={navHref(link)}
            style={{ ...linkStyle(link), width: "100%" }}
            onMouseEnter={(e) => onLinkEnter(e, link)}
            onMouseLeave={(e) => onLinkLeave(e, link)}
          >
            {link}
          </a>
        ))}
        <a
          href={resumePdfHref()}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...linkStyle("resume"), width: "fit-content" }}
        >
          Resume ↗
        </a>
      </div>
    </nav>
  );
}

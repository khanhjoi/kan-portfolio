import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — Database internals & Three.js",
  description: "Long-form notes on PostgreSQL storage with interactive Three.js diagrams.",
};

type Post = {
  slug: string;
  title: string;
  dek: string;
  tag: string;
};

const posts: Post[] = [
  {
    slug: "/blog/how-databases-store-data",
    title: "How databases actually store data internally",
    dek: "Heap pages, ItemId directories, TOAST overflow tables, and shared_buffers — each with an interactive Three.js figure you can orbit.",
    tag: "PostgreSQL",
  },
];

export default function BlogPage() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#F2EDE4", color: "#0A0A0A", padding: "120px 24px 80px" }}>
      <div style={{ maxWidth: "820px", margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            fontSize: "11px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "#FF2800",
            textDecoration: "none",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          ← Home
        </Link>

        <p
          style={{
            marginTop: "28px",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.28em",
            color: "#FF2800",
            fontWeight: "bold",
            marginBottom: "16px",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          Blog
        </p>

        <h1
          style={{
            fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
            fontSize: "clamp(2.5rem, 8vw, 4rem)",
            fontWeight: 900,
            textTransform: "uppercase",
            lineHeight: 0.95,
            marginBottom: "20px",
          }}
        >
          Writing &amp; diagrams
        </h1>

        <p style={{ fontSize: "15px", lineHeight: 1.75, marginBottom: "48px", maxWidth: "640px" }}>
          Essays that pair plain-language database internals with Three.js scenes so you can rotate the architecture instead of squinting at
          flat slides.
        </p>

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "28px" }}>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={post.slug}
                style={{
                  display: "block",
                  border: "2.5px solid #0A0A0A",
                  padding: "28px 28px 26px",
                  textDecoration: "none",
                  color: "#0A0A0A",
                  backgroundColor: "rgba(255, 255, 255, 0.35)",
                  boxShadow: "6px 6px 0 #FFE500",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    color: "#FF2800",
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {post.tag}
                </span>
                <h2
                  style={{
                    fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                    fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    marginTop: "12px",
                    marginBottom: "12px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {post.title}
                </h2>
                <p style={{ fontSize: "14px", lineHeight: 1.7, opacity: 0.88, margin: 0 }}>{post.dek}</p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "18px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  Read article →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export type DocLink = { label: string; href: string };

export type ArticleSection = {
  id: string;
  title: string;
  /** Short label for sidebar / controls */
  shortLabel: string;
  intro: string[];
  figureCaption: string;
  sidebar: {
    headline: string;
    /** Short notes tying the research document to the 3D model */
    modelNotes: string[];
    bullets: string[];
    references?: DocLink[];
  };
};

export const articleIntro = {
  paragraphs: [
    `Practical databases do not keep tables as cozy rectangles in RAM. They chop rows into fixed-size pages on disk, pin metadata at the front of each page, and reuse the middle as a flexible corridor for new pointers and new tuples. When a single attribute balloons past what a page can carry, PostgreSQL TOASTs it — storing fragments elsewhere and leaving a compact pointer behind. Finally, almost every read touches shared_buffers first: an in-memory mirror of those disk pages with its own rules for hits, misses, and background flushing.`,
    `Use the controls beside each figure — they drive the animation and update the live readout so you can relate bytes-on-page behavior to the moving geometry. The right column holds condensed notes from the PostgreSQL docs and typical textbook explanations for each scene.`,
  ],
};

export const articleSections: ArticleSection[] = [
  {
    id: "heap-page",
    title: "1 · Heap page anatomy",
    shortLabel: "Heap page",
    intro: [
      `A regular PostgreSQL heap page begins with PageHeaderData — roughly two dozen bytes describing checksums, free-space boundaries (pd_lower, pd_upper), where special sections begin, and bookkeeping such as the prune horizon. Immediately after comes the ItemId array: lightweight slots that store offset and length pairs pointing at tuple versions stored deeper in the page.`,
      `New ItemIds claim space from the top of the free corridor while fresh tuple payloads grow upward from the bottom; the gap in the middle is literally the page's breathing room. Index-only scans and HOT chains complicate the story, but the mental model is stable: header → directory → free space → tuples → optional special area.`,
    ],
    figureCaption:
      "Figure A — exaggerated slab layout with colored ItemId slots mapping to tuple fragments; the dashed middle band shrinks as inserts consume free space.",
    sidebar: {
      headline: "Research ↔ model",
      modelNotes: [
        "The cream slab is one 8 KiB-class heap page (conceptually). Dark strip ≈ PageHeaderData; colored cubes ≈ ItemId slots; lower boxes ≈ heap tuples.",
        "Dragging “Insert pressure” pulls pd_lower and pd_upper toward each other in real life — here we compress the dashed free-space prism so you can see the squeeze.",
      ],
      bullets: [
        "pd_lower / pd_upper bracket the free-space corridor between the ItemId directory and tuple storage.",
        "ItemIds can be allocated out of order versus physical tuple order — lines show logical pointer→tuple mapping.",
        "Special space (grey block) often holds index-specific data on index pages; on heap pages it may be unused.",
      ],
      references: [
        { label: "PostgreSQL — Database Page Layout", href: "https://www.postgresql.org/docs/current/storage-page-layout.html" },
      ],
    },
  },
  {
    id: "toast",
    title: "2 · TOAST — when values overflow the page",
    shortLabel: "TOAST",
    intro: [
      `PostgreSQL's default 8 KiB page cannot absorb multi-kilobyte text or binary payloads alongside everything else a row needs. The TOAST (The Oversized-Attribute Storage Technique) subsystem intercepts qualifying columns, slices them into chunks stored inside auxiliary pg_toast_* tables, and replaces the inline datum with a compact pointer marked as toasted on the heap tuple.`,
      `Compression and “extended” storage strategies add nuance, yet the cartoon stays accurate: your oversized novel becomes fragments distributed across dedicated toast pages while the main heap row retains something tiny enough to keep OLTP workloads predictable.`,
    ],
    figureCaption:
      "Figure B — heap row keeps a TOAST pointer (orange); wireframe chunks sit on separate toast pages; arrows stress indirection.",
    sidebar: {
      headline: "Research ↔ model",
      modelNotes: [
        "Left stack ≈ main relation heap page with small pointer datum instead of full payload.",
        "Right tower ≈ pg_toast table pages — each green slab holds one compressed chunk of the oversized attribute.",
        "Increase “Toast chunks” to see more overflow pages — PostgreSQL splits variable-length data until chunks fit its page rules.",
      ],
      bullets: [
        "TOAST kicks in when inline storage would break page size limits or configured thresholds.",
        "Chunk rows are ordinary heap tuples in the toast table referenced from the main row.",
        "Reads may fetch multiple toast pages and stitch the value back together transparently.",
      ],
      references: [
        { label: "PostgreSQL — TOAST", href: "https://www.postgresql.org/docs/current/storage-toast.html" },
      ],
    },
  },
  {
    id: "shared-buffers",
    title: "3 · Shared buffers & the path of a page",
    shortLabel: "Shared buffers",
    intro: [
      `When a session asks for data, the buffer manager checks whether the relevant disk page already resides inside shared_buffers. A hit returns immediately; a miss schedules disk IO, installs the fetched block into the cache, and only then hands tuples back to the executor. Background writers quietly push dirty buffers toward disk so checkpoints stay cheap, while WAL guarantees durability before those flushed pages land permanently.`,
      `Choose a query path below — cache-hit orbit (green packet returning quickly) versus miss cycle (orange packet visits disk). “Auto demo” alternates both so you can compare pacing.`,
    ],
    figureCaption:
      "Figure C — stylized flow from client through shared_buffers toward disk; packet color reflects cache outcome.",
    sidebar: {
      headline: "Research ↔ model",
      modelNotes: [
        "Blue slab ≈ shared_buffers — first place buffer tags resolve before touching storage.",
        "Grey hull ≈ postmaster address space; orange strip ≈ WAL stream beneath writers.",
        "Cylinder ≈ tablespace files on disk — misses arc out to it; hits never leave the blue band.",
      ],
      bullets: [
        "Buffer manager uses a clock/eviction policy family — hits increment usage counts so hot pages linger.",
        "Background writer spreads dirty writes so checkpoints avoid spikes.",
        "WAL records logical changes before dirty data files must reflect them durably.",
      ],
      references: [
        { label: "PostgreSQL — Shared Buffer Manager", href: "https://www.postgresql.org/docs/current/storage-buffer-manager.html" },
      ],
    },
  },
];

export const furtherReading: DocLink[] = [
  { label: "Database Page Layout", href: "https://www.postgresql.org/docs/current/storage-page-layout.html" },
  { label: "TOAST", href: "https://www.postgresql.org/docs/current/storage-toast.html" },
  { label: "Shared Buffer Manager", href: "https://www.postgresql.org/docs/current/storage-buffer-manager.html" },
];

export type DocLink = { label: string; href: string };

export type PagePart = {
  id: string;
  title: string;
  /** Maps to hover label in HeapPageScene when applicable */
  sceneLabel?: string;
  body: string;
};

export type RowOperationGuide = {
  id: "insert" | "read" | "delete" | "update";
  title: string;
  summary: string;
  steps: string[];
};

export type ArticleSection = {
  id: string;
  title: string;
  shortLabel: string;
  intro: string[];
  figureCaption: string;
  /** Static anatomy of one heap page (matches the diagram / 3D model) */
  pageParts: PagePart[];
  /** How PostgreSQL reads or modifies a row through the page */
  rowOperations: RowOperationGuide[];
  sidebar: {
    headline: string;
    modelNotes: string[];
    bullets: string[];
    references?: DocLink[];
  };
};

export const articleIntro = {
  paragraphs: [
    `PostgreSQL does not store a table as one big blob in RAM. It chops data into fixed-size pages on disk (typically 8 KiB), loads those pages into shared_buffers when needed, and uses a small header plus a line-pointer directory to find row versions inside each page.`,
    `This article focuses on one heap page: what each region means, and how insert, read, delete, and update actually move through FSM, WAL, the buffer pool, and the bytes on the page. Use the four buttons under the figure to switch animations; hover blocks in the 3D scene for field-level detail.`,
  ],
};

export const articleSections: ArticleSection[] = [
  {
    id: "heap-page",
    title: "Heap page anatomy",
    shortLabel: "Heap page",
    intro: [
      `A heap page is the basic storage unit for ordinary table rows. Byte 0 starts with PageHeaderData (24 bytes): checksum, flags, pd_lower, pd_upper, pd_special, page size/version, and pd_prune_xid. Those pointers bracket the free corridor and tell PostgreSQL where the ItemId array ends and where tuple storage begins.`,
      `Right after the header comes the ItemIdData array. Each slot is 4 bytes (offset, length, flags) and points at a tuple stored lower on the page. New ItemIds grow downward from the header; new tuple bodies grow upward from the bottom — the dashed free space in the middle is what shrinks as the page fills.`,
    ],
    figureCaption:
      "Interactive figure — pick Insert, Read, Delete, or Update. Hover page regions; drag to orbit.",
    pageParts: [
      {
        id: "page-header",
        title: "PageHeaderData (24 bytes)",
        sceneLabel: "PageHeaderData",
        body: `Fixed metadata at the start of every page. Key fields: pd_lsn (last WAL position that touched this page), pd_checksum, pd_flags, pd_lower (start of free space / end of ItemId array), pd_upper (start of tuple storage from the bottom), pd_special (start of special area at page end), pd_pagesize_version, and pd_prune_xid (oldest XMAX not yet pruned on this page). Inserts and updates advance pd_lower and pd_upper toward each other as the free corridor shrinks.`,
      },
      {
        id: "itemid-array",
        title: "ItemIdData array (4 bytes per slot)",
        sceneLabel: "ItemId Array",
        body: `An array of line pointers immediately after the header. Each ItemId stores lp_off (byte offset of the tuple), lp_len (length), and lp_flags (normal, dead, redirect, etc.). The executor uses slot numbers — not raw byte scans — to jump to row versions. Slots can be allocated out of order versus physical tuple order; dashed lines in the model show logical pointer → tuple mapping.`,
      },
      {
        id: "itemid-slots",
        title: "ItemId slots (1, 2, 3…)",
        sceneLabel: "ItemId 1",
        body: `Individual 4-byte directory entries. A row's ctid is (block_number, item_number): item_number is the ItemId slot, not a byte offset. VACUUM can mark a slot LP_DEAD while tuple bytes remain until space is reclaimed. HOT updates keep the same slot as chain head so indexes need not change when the new version stays on the same page.`,
      },
      {
        id: "free-space",
        title: "Free space",
        sceneLabel: "Free Space",
        body: `Unallocated bytes between pd_lower and pd_upper. New ItemIds consume space from the top of this corridor; new tuples consume space from the bottom. The Free Space Map (FSM) tracks approximate free space per page so inserts can skip full pages without scanning the whole table file.`,
      },
      {
        id: "items-tuples",
        title: "Items (heap tuples)",
        sceneLabel: "Item Tuple 1",
        body: `Actual row versions stored from pd_upper upward. Each tuple begins with HeapTupleHeaderData: xmin (inserting transaction), xmax (deleting transaction or 0), ctid (pointer to newer version if any), infomask flags, and t_hoff. Attribute data follows with alignment rules from pg_type. Multiple versions of the "same" row can coexist on one page during MVCC.`,
      },
      {
        id: "special-space",
        title: "Special space",
        sceneLabel: "Special Space",
        body: `Bytes from pd_special to the end of the page. On heap pages pd_special usually equals page size, so this region is empty. Index pages use it for access-method data (for example B-tree sibling links and level flags).`,
      },
      {
        id: "fsm",
        title: "FSM (Free Space Map)",
        sceneLabel: "FSM",
        body: `Separate auxiliary structure (not drawn inside the page bytes). Before insert, PostgreSQL consults the FSM to find a heap page with enough free space. If none exists, it extends the relation file with a new page.`,
      },
      {
        id: "buffer-pool",
        title: "Buffer pool (shared_buffers)",
        sceneLabel: "Buffer Pool",
        body: `Shared memory cache of page frames. A page must be loaded into a buffer before the backend can read or modify its bytes. While in use the buffer is pinned so eviction cannot drop it mid-operation.`,
      },
      {
        id: "wal",
        title: "WAL (Write-Ahead Log)",
        sceneLabel: "WAL",
        body: `Append-only log of changes. For inserts, updates, and deletes, PostgreSQL records WAL before the in-memory page is considered durably changed. Crash recovery replays WAL to bring data files back to a consistent state.`,
      },
      {
        id: "disk",
        title: "Heap file on disk",
        sceneLabel: "Heap File on Disk",
        body: `Table data lives in relation fork files as a sequence of fixed-size pages. On a buffer cache miss, the storage manager reads the page from disk into a buffer slot; on a hit the page is already in memory.`,
      },
      {
        id: "dirty-buffer",
        title: "Dirty buffer",
        sceneLabel: "Dirty Buffer",
        body: `After a modifying operation, the in-memory copy of the page is newer than what is on disk until a background writer or checkpoint flushes it. WAL must already contain the change before the dirty page can be written safely.`,
      },
    ],
    rowOperations: [
      {
        id: "insert",
        title: "How a row is inserted",
        summary:
          "Find space with the FSM, load the page into the buffer pool, write WAL first, then add a 4-byte ItemId and tuple bytes inside the page and mark the buffer dirty.",
        steps: [
          "Check the FSM for a page with enough free space; if none, allocate a new page in the table file.",
          "Load the target page into the buffer pool if it is not already cached.",
          "Write the change to WAL before modifying page bytes in memory.",
          "Append a new 4-byte ItemId pointing at the new tuple in the items area; tuple storage grows into free space from the bottom.",
          "Mark the buffer dirty — memory is now ahead of disk until flush.",
        ],
      },
      {
        id: "read",
        title: "How a row is read",
        summary:
          "Locate the page and ItemId, resolve the page through the buffer manager (hit or miss), then follow the line pointer to the tuple bytes.",
        steps: [
          "Identify the target page (block) and line pointer (offset) for the row.",
          "Buffer check: search shared_buffers. Cache hit — page is already in memory; pin it so it is not evicted during the read.",
          "Cache miss — read the page from disk into a buffer slot, then continue.",
          "Inside the page, use the ItemId array: offset and length tell the executor exactly where the tuple starts and ends.",
          "Apply MVCC visibility rules (xmin / xmax) to decide whether this version is visible to the current snapshot.",
        ],
      },
      {
        id: "delete",
        title: "How a row is deleted",
        summary:
          "PostgreSQL does not instantly erase tuple bytes. It sets xmax on the tuple header; the row becomes dead only after commit and once no active transaction still needs the old version.",
        steps: [
          "Record the delete in WAL, then load or pin the page in the buffer pool.",
          "Set xmax on the tuple header to the deleting transaction ID (XID).",
          "Until the transaction commits, other sessions may still see the row under their snapshot.",
          "After commit, the version is dead for new snapshots; VACUUM later reclaims space and may mark ItemIds LP_DEAD.",
          "Physical bytes often remain until vacuum/compaction — delete is logical first, physical cleanup later.",
        ],
      },
      {
        id: "update",
        title: "How a row is updated",
        summary:
          "In PostgreSQL an update is delete-then-insert at the storage layer: mark the old version with xmax, write a new version into free space, and optionally chain versions with ctid (HOT on the same page without touching indexes).",
        steps: [
          "Write WAL, then mark the old tuple version with xmax (same MVCC story as delete).",
          "Insert a new tuple version into available free space — ideally on the same heap page.",
          "Update the old tuple's ctid to point at the new version, forming a version chain.",
          "HOT (Heap-Only Tuple): if indexed columns are unchanged and the new row fits on the same page, indexes keep pointing at the chain head and the executor follows in-page links.",
          "If the new version does not fit or indexed keys change, a non-HOT update may touch indexes and/or another page.",
        ],
      },
    ],
    sidebar: {
      headline: "Research ↔ 3D model",
      modelNotes: [
        "Cream slab = one heap page. Tan strip = PageHeaderData; framed area = ItemId array; dashed box = free space; colored bars = tuples; grey block = special space.",
        "Floating blocks left of the page = FSM, buffer pool, WAL, and on-disk heap file — the path a row takes before bytes change inside the page.",
        "Insert / Read / Delete / Update buttons drive the yellow packet and which regions glow; Read alternates cache hit vs cache miss.",
      ],
      bullets: [
        "pd_lower / pd_upper define the free corridor — the animation shrinks it on insert/update.",
        "Every tuple carries xmin (creator) and xmax (deleter); visibility is snapshot-based, not immediate physical delete.",
        "Dirty buffer badge = page in memory is newer than disk until checkpoint or background write.",
      ],
      references: [
        {
          label: "Research notes — How databases store data internally",
          href: "https://www.notion.so/How-Databases-Actually-Store-Data-Internally-And-basic-main-components-349708504782806a9812d3cfb88dd07d?source=copy_link",
        },
        {
          label: "PostgreSQL — Database Page Layout",
          href: "https://www.postgresql.org/docs/current/storage-page-layout.html",
        },
      ],
    },
  },
];

export const furtherReading: DocLink[] = [
  {
    label: "Research notes — How databases store data internally",
    href: "https://www.notion.so/How-Databases-Actually-Store-Data-Internally-And-basic-main-components-349708504782806a9812d3cfb88dd07d?source=copy_link",
  },
  { label: "PostgreSQL — Database Page Layout", href: "https://www.postgresql.org/docs/current/storage-page-layout.html" },
  { label: "PostgreSQL — Heap Storage", href: "https://www.postgresql.org/docs/current/storage-page-layout.html#HEAP-STORAGE" },
  { label: "PostgreSQL — Shared Buffer Manager", href: "https://www.postgresql.org/docs/current/storage-buffer-manager.html" },
];

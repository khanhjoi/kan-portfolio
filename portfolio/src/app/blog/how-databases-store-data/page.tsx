import type { Metadata } from "next";
import HowDatabasesArticle from "./HowDatabasesArticle";

export const metadata: Metadata = {
  title: "How PostgreSQL Stores Rows Inside Heap Pages",
  description:
    "Heap page anatomy, ItemId pointers, FSM, WAL, buffer pool, and insert/read/delete/update — explained with an interactive Three.js diagram.",
};

export default function HowDatabasesStoreDataPage() {
  return <HowDatabasesArticle />;
}

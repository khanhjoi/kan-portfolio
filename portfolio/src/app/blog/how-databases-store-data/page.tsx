import type { Metadata } from "next";
import HowDatabasesArticle from "./HowDatabasesArticle";

export const metadata: Metadata = {
  title: "How PostgreSQL Stores Rows Inside Pages (and Where TOAST Fits)",
  description:
    "Heap pages, ItemId pointers, TOAST out-of-line storage, and the shared buffer cache — explained with interactive Three.js diagrams.",
};

export default function HowDatabasesStoreDataPage() {
  return <HowDatabasesArticle />;
}

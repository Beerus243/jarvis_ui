"use client";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BrainCircuit,
  Clock3,
  Database,
  Search,
  Sparkles,
} from "lucide-react";
import { isMockMode } from "@/lib/store/jarvis-store";
import type { MemoryEntry } from "@/lib/jarvis/types";
import { PageHeading } from "@/components/layout/page-heading";
import { cn } from "@/lib/utils";
const categories = [
  "Recent",
  "Long-term",
  "Preferences",
  "Projects",
  "People",
  "Habits",
  "Facts",
];
export function MemoryPage() {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [category, setCategory] = useState("Recent");
  const [query, setQuery] = useState("");
  useEffect(() => {
    let cancelled = false;
    if (isMockMode)
      void import("@/lib/mock/data").then((data) => {
        if (!cancelled) setEntries(data.mockMemories);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const filtered = entries.filter(
    (e) =>
      (category === "Recent" ||
        category === "Long-term" ||
        e.category === category) &&
      `${e.title} ${e.content} ${e.tags.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <div className="page-container">
      <PageHeading
        eyebrow="CONTEXT THAT STAYS WITH YOU"
        title="Memory"
        description="Your preferences, projects and useful context, thoughtfully organized."
      >
        <span className="subtle-badge">
          <Database size={13} />
          {entries.length} entries
        </span>
      </PageHeading>
      <div className="memory-notice">
        <Sparkles size={17} />
        <span>
          {isMockMode
            ? "Demonstration library. These are sample entries, not memories retrieved from your Python Core."
            : "Persistent Core memory is not connected in this version. No demo entries are shown."}
        </span>
      </div>
      <div className="list-toolbar">
        <div className="filter-tabs" aria-label="Memory categories">
          {categories.map((c) => (
            <button
              key={c}
              aria-pressed={c === category}
              className={cn(c === category && "selected")}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="search-input">
          <Search size={15} />
          <input
            aria-label="Search memories"
            placeholder="Search memory…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="memory-grid">
        {filtered.map((entry) => (
          <article className="panel memory-card" key={entry.id}>
            <div className="memory-card-top">
              <span>
                <BrainCircuit size={15} />
                {entry.category}
              </span>
              <ArrowUpRight size={16} />
            </div>
            <h2>{entry.title}</h2>
            <p>{entry.content}</p>
            <div className="memory-tags">
              {entry.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <div className="memory-date">
              <Clock3 size={12} />
              Updated {entry.updatedAt}
              <span>DEMO</span>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-page">
          <BrainCircuit size={32} />
          <h2>No matching memories</h2>
          <p>
            {isMockMode
              ? "Try another category or search term."
              : "Memory will be available when a Core memory adapter is implemented."}
          </p>
        </div>
      )}
    </div>
  );
}

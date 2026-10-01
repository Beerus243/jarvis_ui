"use client";
import { useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ListTodo,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useJarvisStore } from "@/lib/store/jarvis-store";
import { PageHeading } from "@/components/layout/page-heading";
import { TaskDetails } from "@/components/jarvis/task-panel";
import { cn } from "@/lib/utils";
const filters = [
  "All tasks",
  "Active",
  "Scheduled",
  "Waiting",
  "Paused",
  "Completed",
  "Failed",
  "Cancelled",
];
export function TasksPage() {
  const tasks = useJarvisStore((s) => s.tasks);
  const [filter, setFilter] = useState("All tasks");
  const [query, setQuery] = useState("");
  const filtered = tasks.filter(
    (t) =>
      (filter === "All tasks" ||
        t.status ===
          (filter === "Active" ? "running" : filter.toLowerCase())) &&
      t.title.toLowerCase().includes(query.toLowerCase()),
  );
  const stats = [
    {
      icon: ListTodo,
      label: "In progress",
      value: tasks.filter((t) => t.status === "running").length,
    },
    {
      icon: Clock3,
      label: "Scheduled",
      value: tasks.filter((t) => t.status === "scheduled").length,
    },
    {
      icon: CheckCircle2,
      label: "Completed",
      value: tasks.filter((t) => t.status === "completed").length,
    },
    {
      icon: ShieldAlert,
      label: "Awaiting approval",
      value: tasks.filter((t) => t.status === "waiting").length,
    },
  ];
  return (
    <div className="page-container">
      <PageHeading
        eyebrow="FROM INTENT TO OUTCOME"
        title="Your tasks"
        description="Track what’s happening, what’s next, and what’s already taken care of."
      />
      <div className="stat-grid">
        {stats.map(({ icon: Icon, label, value }) => (
          <div className="stat-card" key={label}>
            <span>
              <Icon size={16} />
              {label}
            </span>
            <strong>{value.toString().padStart(2, "0")}</strong>
          </div>
        ))}
      </div>
      <div className="list-toolbar">
        <div className="filter-tabs" aria-label="Task status">
          {filters.map((f) => (
            <button
              key={f}
              className={cn(filter === f && "selected")}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="search-input">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks…"
            aria-label="Search tasks"
          />
        </label>
      </div>
      <div className="task-grid">
        {filtered.map((task) => (
          <section className="panel task-card" key={task.id}>
            <TaskDetails task={task} />
          </section>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-page">
          <ListTodo size={32} />
          <h2>No tasks here</h2>
          <p>Try a different filter or start a command from the dashboard.</p>
        </div>
      )}
    </div>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AudioLines,
  Blocks,
  ChevronsLeft,
  ChevronsRight,
  CircleHelp,
  Command,
  Cpu,
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useSettingsStore } from "@/lib/store/settings-store";
import { isMockMode, useJarvisStore } from "@/lib/store/jarvis-store";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Conversation", icon: MessageSquare },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/agents", label: "Agents", icon: Blocks },
  { href: "/memory", label: "Memory", icon: Sparkles },
  { href: "/system", label: "System", icon: Cpu },
];
export function Sidebar() {
  const pathname = usePathname();
  const compact = useSettingsStore((s) => s.compact);
  const set = useSettingsStore((s) => s.set);
  const name = useSettingsStore((s) => s.name);
  const activeTasks = useJarvisStore(
    (s) =>
      s.tasks.filter((t) => t.status === "running" || t.status === "waiting")
        .length,
  );
  return (
    <aside className={cn("sidebar", compact && "sidebar-compact")}>
      <Link href="/" className="brand" aria-label="JARVIS dashboard">
        <Logo />
        <span className="sidebar-text">
          JARVIS<span className="brand-version">PERSONAL INTELLIGENCE</span>
        </span>
      </Link>
      <div className="navigation-label sidebar-text">WORKSPACE</div>
      <nav aria-label="Main navigation">
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={label}
            aria-current={pathname === href ? "page" : undefined}
            className={cn("nav-link", pathname === href && "nav-active")}
          >
            <Icon size={18} strokeWidth={1.7} />
            <span className="sidebar-text">{label}</span>
            {href === "/tasks" && activeTasks > 0 && (
              <span className="nav-count sidebar-text">{activeTasks}</span>
            )}
            {pathname === href && (
              <span className="nav-active-dot sidebar-text" />
            )}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="local-card sidebar-text">
          <div className="local-card-icon">
            <ShieldCheck size={17} />
            <span>
              {isMockMode
                ? "A safe place to explore"
                : "Your personal workspace"}
            </span>
          </div>
          <p>
            {isMockMode
              ? "Demo mode is active. Your system stays untouched."
              : "Connected directly to your configured JARVIS Core."}
          </p>
          <div className="local-card-label">
            <span className="status-dot" />
            {isMockMode ? "SIMULATED ENVIRONMENT" : "CORE CONNECTION"}
          </div>
        </div>
        <Link
          href="/settings"
          title="Settings"
          className={cn("nav-link", pathname === "/settings" && "nav-active")}
          aria-current={pathname === "/settings" ? "page" : undefined}
        >
          <Settings2 size={18} />
          <span className="sidebar-text">Settings</span>
        </Link>
        <Link href="/settings#about" title="About JARVIS" className="nav-link">
          <CircleHelp size={18} />
          <span className="sidebar-text">About JARVIS</span>
          <span className="sidebar-text help-version">v1.0</span>
        </Link>
        <div className="profile">
          <div className="avatar">{name.slice(0, 2).toUpperCase()}</div>
          <div className="profile-info sidebar-text">
            <strong>{name || "You"}</strong>
            <span>Personal workspace</span>
          </div>
          <button
            className="icon-button collapse-button"
            onClick={() => set({ compact: !compact })}
            aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
          >
            {compact ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>
      </div>
      <div className="sidebar-mini-footer sidebar-text">
        <AudioLines size={12} />
        <span>ALWAYS ONE COMMAND AWAY</span>
        <Command size={11} />
      </div>
    </aside>
  );
}

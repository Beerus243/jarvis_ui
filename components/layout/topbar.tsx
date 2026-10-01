"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  AudioLines,
  Bell,
  Blocks,
  CheckCheck,
  ChevronRight,
  Command,
  Cpu,
  House,
  ListTodo,
  Menu,
  MessageSquare,
  Radio,
  Settings2,
  Sparkles,
} from "lucide-react";
import { isMockMode, useJarvisStore } from "@/lib/store/jarvis-store";
import { timeLabel } from "@/lib/utils";
import { Logo } from "./logo";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
const names: Record<string, string> = {
  "/": "Accueil",
  "/chat": "Conversation",
  "/tasks": "Tasks",
  "/agents": "Agents",
  "/memory": "Memory",
  "/system": "System",
  "/settings": "Settings",
};
const navigation = [
  { href: "/", label: "Accueil", icon: House },
  { href: "/chat", label: "Conversation", icon: MessageSquare },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/agents", label: "Agents", icon: Blocks },
  { href: "/memory", label: "Memory", icon: Sparkles },
  { href: "/system", label: "System", icon: Cpu },
  { href: "/settings", label: "Settings", icon: Settings2 },
];
export function Topbar() {
  const pathname = usePathname();
  const connection = useJarvisStore((s) => s.connection);
  const notifications = useJarvisStore((s) => s.notifications);
  const markRead = useJarvisStore((s) => s.markNotificationsRead);
  const [clock, setClock] = useState("—:—");
  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    tick();
    const timer = setInterval(tick, 1000 * 30);
    return () => clearInterval(timer);
  }, []);
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <Link href="/" className="topbar-home-link" aria-label="JARVIS home">
          <Logo small />
          <span>JARVIS</span>
        </Link>
        <Command size={14} />
        <span>Workspace</span>
        <ChevronRight size={13} />
        <strong>{names[pathname] ?? "JARVIS"}</strong>
      </div>
      <div className="topbar-right">
        {isMockMode && <span className="demo-label">DEMO MODE</span>}
        <StatusBadge status={connection === "connected" ? "online" : "offline"}>
          <Radio size={12} />
          <span>
            {connection === "connected"
              ? isMockMode
                ? "Demo Core online"
                : "Core connected"
              : connection}
          </span>
        </StatusBadge>
        <span className="topbar-divider" />
        <time className="clock">{clock}</time>
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Bell size={17} />
              {notifications.some((n) => !n.read) && (
                <span className="notification-dot" />
              )}
            </button>
          </DialogTrigger>
          <DialogContent className="notification-dialog">
            <DialogHeader>
              <DialogTitle>Notifications</DialogTitle>
              <DialogDescription>
                Updates from your workspace.
              </DialogDescription>
            </DialogHeader>
            <button className="text-button" onClick={markRead}>
              <CheckCheck size={14} />
              Mark all as read
            </button>
            <div className="notification-list">
              {notifications.length === 0 ? (
                <p className="empty-state">You’re all caught up.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="notification-item">
                    <span className={`event-dot event-${n.kind}`} />
                    <div>
                      <strong>{n.title}</strong>
                      <p>{n.message}</p>
                      <time>{timeLabel(n.timestamp)}</time>
                    </div>
                    {!n.read && <span className="unread-label">NEW</span>}
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="icon-button menu-button"
              aria-label="Open navigation menu"
              title="Open navigation menu"
            >
              <Menu size={19} />
            </button>
          </DialogTrigger>
          <DialogContent className="navigation-dialog">
            <DialogHeader>
              <DialogTitle>Workspace</DialogTitle>
              <DialogDescription>Navigate your JARVIS workspace.</DialogDescription>
            </DialogHeader>
            <nav className="menu-navigation" aria-label="Main navigation">
              {navigation.map(({ href, label, icon: Icon }) => (
                <DialogClose asChild key={href}>
                  <Link
                    href={href}
                    aria-current={pathname === href ? "page" : undefined}
                    className={pathname === href ? "menu-link menu-link-active" : "menu-link"}
                  >
                    <Icon size={17} />
                    <span>{label}</span>
                    {pathname === href && <span className="menu-current">CURRENT</span>}
                    {href === "/chat" && <AudioLines className="menu-voice-icon" size={14} />}
                  </Link>
                </DialogClose>
              ))}
            </nav>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}

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
  "/tasks": "Tâches",
  "/agents": "Agents",
  "/memory": "Mémoire",
  "/system": "Système",
  "/settings": "Paramètres",
};
const navigation = [
  { href: "/", label: "Accueil", icon: House },
  { href: "/chat", label: "Conversation", icon: MessageSquare },
  { href: "/tasks", label: "Tâches", icon: ListTodo },
  { href: "/agents", label: "Agents", icon: Blocks },
  { href: "/memory", label: "Mémoire", icon: Sparkles },
  { href: "/system", label: "Système", icon: Cpu },
  { href: "/settings", label: "Paramètres", icon: Settings2 },
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
        <span>Espace de travail</span>
        <ChevronRight size={13} />
        <strong>{names[pathname] ?? "JARVIS"}</strong>
      </div>
      <div className="topbar-right">
        {isMockMode && <span className="demo-label">MODE DÉMO</span>}
        <StatusBadge status={connection === "connected" ? "online" : "offline"}>
          <Radio size={12} />
          <span>
            {connection === "connected"
              ? isMockMode
                ? "Cœur de démo en ligne"
                : "Cœur connecté"
              : connection === "connecting"
                ? "Connexion"
                : "Hors ligne"}
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
                Mises à jour de votre espace de travail.
              </DialogDescription>
            </DialogHeader>
            <button className="text-button" onClick={markRead}>
              <CheckCheck size={14} />
              Tout marquer comme lu
            </button>
            <div className="notification-list">
              {notifications.length === 0 ? (
                <p className="empty-state">Vous êtes à jour.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="notification-item">
                    <span className={`event-dot event-${n.kind}`} />
                    <div>
                      <strong>{n.title}</strong>
                      <p>{n.message}</p>
                      <time>{timeLabel(n.timestamp)}</time>
                    </div>
                    {!n.read && <span className="unread-label">NOUVEAU</span>}
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
              aria-label="Ouvrir le menu de navigation"
              title="Ouvrir le menu de navigation"
            >
              <Menu size={19} />
            </button>
          </DialogTrigger>
          <DialogContent className="navigation-dialog !top-[58px] !left-auto !right-[18px] !translate-x-0 !translate-y-0">
            <DialogHeader>
              <DialogTitle>Espace de travail</DialogTitle>
              <DialogDescription>Parcourez votre espace JARVIS.</DialogDescription>
            </DialogHeader>
            <nav className="menu-navigation" aria-label="Navigation principale">
              {navigation.map(({ href, label, icon: Icon }) => (
                <DialogClose asChild key={href}>
                  <Link
                    href={href}
                    aria-current={pathname === href ? "page" : undefined}
                    className={pathname === href ? "menu-link menu-link-active" : "menu-link"}
                  >
                    <Icon size={17} />
                    <span>{label}</span>
                    {pathname === href && <span className="menu-current">ACTUEL</span>}
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

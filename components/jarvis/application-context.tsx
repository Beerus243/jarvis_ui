"use client";
import { AppWindow, Code2, Globe, Music2, Terminal } from "lucide-react";
import { isMockMode, useJarvisStore } from "@/lib/store/jarvis-store";
import { Panel } from "@/components/ui/panel";
const icons = {
  vscode: Code2,
  chrome: Globe,
  terminal: Terminal,
  spotify: Music2,
};
export function ApplicationContext() {
  const apps = useJarvisStore((s) => s.system?.applications);
  return (
    <Panel
      title="Applications"
      icon={AppWindow}
      href="/system"
      className="applications-panel"
    >
      <div className="application-list">
        {!apps?.length && (
          <p className="empty-state">No application context available.</p>
        )}
        {apps
          ?.filter((a) => a.id !== "spotify")
          .map((app) => {
            const Icon = icons[app.id as keyof typeof icons] ?? AppWindow;
            return (
              <div className="application-row" key={app.id}>
                <span className={`application-icon app-${app.id}`}>
                  <Icon size={17} />
                </span>
                <div>
                  <strong>{app.name}</strong>
                  <span>{app.detail}</span>
                </div>
                <span
                  className={`application-status ${app.status === "active" ? "success-text" : ""}`}
                >
                  {app.status}
                </span>
              </div>
            );
          })}
      </div>
    </Panel>
  );
}
export function MusicContext() {
  const app = useJarvisStore((s) =>
    s.system?.applications.find((a) => a.id === "spotify"),
  );
  if (!app) return null;
  return (
    <div className="music-panel">
      <div className="music-top">
        <span>
          <Music2 size={12} />
          {app.status === "playing"
            ? `NOW PLAYING${isMockMode ? " · DEMO" : ""}`
            : `SPOTIFY · ${app.status.toUpperCase()}`}
        </span>
        <span className="music-waves" aria-hidden="true">
          {[6, 11, 8, 14, 5].map((h, i) => (
            <i key={i} style={{ height: app.status === "playing" ? h : 3 }} />
          ))}
        </span>
      </div>
      <div className="music-track">
        <div className="album-art">
          <span />
          <span />
          <span />
        </div>
        <div>
          <strong>{app.detail.split(" · ")[0]}</strong>
          <span>{app.detail.split(" · ")[1]}</span>
        </div>
        <Music2 size={15} />
      </div>
    </div>
  );
}

"use client";
import { Cpu, HardDrive, MemoryStick, PlugZap, Radio } from "lucide-react";
import { isMockMode, useJarvisStore } from "@/lib/store/jarvis-store";
import { PageHeading } from "@/components/layout/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { SystemContext } from "@/components/jarvis/system-context";
import {
  ApplicationContext,
  MusicContext,
} from "@/components/jarvis/application-context";
import { ActivityFeed } from "@/components/jarvis/activity-feed";
export function SystemPage() {
  const system = useJarvisStore((s) => s.system);
  const connection = useJarvisStore((s) => s.connection);
  const metrics = [
    {
      icon: Cpu,
      title: "CPU utilization",
      value: system?.cpu,
      detail: "Current processor load",
    },
    {
      icon: MemoryStick,
      title: "Memory usage",
      value: system?.ram,
      detail:
        system?.ram != null && system.ramTotal != null
          ? `${((system.ram * system.ramTotal) / 100).toFixed(1)} GB of ${system.ramTotal} GB`
          : "Awaiting telemetry",
    },
    {
      icon: HardDrive,
      title: "Storage used",
      value: system?.storage,
      detail: "Primary system drive",
    },
  ];
  return (
    <div className="page-container">
      <PageHeading
        eyebrow="AWARE OF YOUR ENVIRONMENT"
        title="System"
        description="A live view of the context your assistant can work with."
      >
        <StatusBadge status={connection === "connected" ? "online" : "offline"}>
          {connection}
        </StatusBadge>
      </PageHeading>
      <div className="system-stat-grid">
        {metrics.map(({ icon: Icon, title, value, detail }) => (
          <div className="panel system-stat" key={title}>
            <span>
              <Icon size={17} />
              {title}
            </span>
            <strong>
              {value ?? "—"}
              <small>%</small>
            </strong>
            <div className="metric-track">
              <span style={{ width: `${value ?? 0}%` }} />
            </div>
            <p>
              {detail}
              {isMockMode && <span>DEMO DATA</span>}
            </p>
          </div>
        ))}
      </div>
      <section className="connection-panel panel">
        <div className="connection-icon">
          <PlugZap size={23} />
        </div>
        <div>
          <h2>
            {isMockMode ? "Simulated JARVIS Core" : "Python Core connection"}
          </h2>
          <p>
            {isMockMode
              ? "Deterministic local simulation · no Python process required"
              : (process.env.NEXT_PUBLIC_JARVIS_WS_URL ??
                "ws://localhost:8765/ws")}
          </p>
        </div>
        <div className="connection-facts">
          <span>
            <Radio size={13} />
            {system?.latency != null
              ? `${system.latency} ms${isMockMode ? " · demo" : ""}`
              : "No latency data"}
          </span>
          <span>{system?.version ?? "Version unknown"}</span>
        </div>
      </section>
      <div className="system-detail-grid">
        <SystemContext />
        <div className="system-apps">
          <ApplicationContext />
          <MusicContext />
        </div>
        <ActivityFeed expanded systemOnly />
      </div>
    </div>
  );
}

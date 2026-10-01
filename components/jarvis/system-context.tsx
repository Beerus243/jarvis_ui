"use client";
import { AudioLines, Cpu, HardDrive, Mic, Monitor, Wifi } from "lucide-react";
import { useJarvisStore } from "@/lib/store/jarvis-store";
import { Panel } from "@/components/ui/panel";
export function MetricBar({
  label,
  value,
  suffix = "%",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="metric">
      <div>
        <span>{label}</span>
        <strong>
          {value}
          <small>{suffix}</small>
        </strong>
      </div>
      <div className="metric-track">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
export function SystemContext() {
  const system = useJarvisStore((s) => s.system);
  const connected = useJarvisStore((s) => s.connection === "connected");
  const listening = useJarvisStore((s) => s.state === "listening");
  return (
    <Panel
      title="System overview"
      icon={Cpu}
      href="/system"
      className="system-panel"
    >
      {system ? (
        <>
          <div className="system-health">
            <span className="health-icon">
              <ShieldIcon />
            </span>
            <div>
              <strong>
                {connected
                  ? `Systems ${system.network ? "operational" : "limited"}`
                  : "Last known system state"}
              </strong>
              <span>
                {connected
                  ? "Workspace telemetry"
                  : "Core disconnected · values may be stale"}
              </span>
            </div>
            <span className="status-dot" />
          </div>
          <div className="system-metrics">
            <MetricBar label="CPU usage" value={system.cpu} />
            <MetricBar
              label={`Memory · ${system.ramTotal} GB`}
              value={system.ram}
            />
            <MetricBar label="Storage" value={system.storage} />
          </div>
          <div className="system-facts">
            <div>
              <span>
                <Wifi size={14} />
                Network
              </span>
              <strong
                className={system.network ? "success-text" : "warning-text"}
              >
                {system.network ? "Connected" : "Offline"}
              </strong>
            </div>
            <div>
              <span>
                <Mic size={14} />
                Microphone
              </span>
              <strong>
                {listening || system.microphone ? "Listening" : "Standby"}
              </strong>
            </div>
            <div>
              <span>
                <AudioLines size={14} />
                Audio output
              </span>
              <strong>{system.audio ? "Enabled" : "Muted"}</strong>
            </div>
            <div>
              <span>
                <Monitor size={14} />
                Active window
              </span>
              <strong>
                {system.window === "Visual Studio Code"
                  ? "VS Code"
                  : system.window}
              </strong>
            </div>
          </div>
        </>
      ) : (
        <p className="empty-state">
          Telemetry unavailable until the Core connects.
        </p>
      )}
    </Panel>
  );
}
function ShieldIcon() {
  return <HardDrive size={17} />;
}

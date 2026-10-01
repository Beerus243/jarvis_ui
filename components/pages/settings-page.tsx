"use client";
import { useState } from "react";
import {
  AudioLines,
  Bell,
  Cable,
  ChevronRight,
  CircleHelp,
  Fingerprint,
  Palette,
  Play,
  Settings2,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/layout/page-heading";
import { useSettingsStore } from "@/lib/store/settings-store";
import { isMockMode, useJarvisStore } from "@/lib/store/jarvis-store";
import { useGateway } from "@/lib/jarvis/gateway-provider";
import { cn } from "@/lib/utils";
const sections = [
  { id: "general", name: "General", icon: Settings2 },
  { id: "voice", name: "Voice", icon: AudioLines },
  { id: "appearance", name: "Appearance", icon: Palette },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "privacy", name: "Privacy", icon: Fingerprint },
  { id: "automation", name: "Automation", icon: Workflow },
  { id: "security", name: "Security", icon: ShieldCheck },
  { id: "connections", name: "Connections", icon: Cable },
  { id: "about", name: "About", icon: CircleHelp },
];
function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="setting-row">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function SettingsPage() {
  const settings = useSettingsStore();
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const state = useJarvisStore((s) => s.state);
  const connection = useJarvisStore((s) => s.connection);
  const send = useGateway();
  const [active, setActive] = useState("general");
  return (
    <div className="page-container">
      <PageHeading
        eyebrow="MAKE YOURSELF AT HOME"
        title="Settings"
        description="Fine-tune your interface. Keep your assistant on your terms."
      />
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          {sections.map(({ id, name, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setActive(id)}
              className={cn(active === id && "selected")}
            >
              <Icon size={16} />
              {name}
              <ChevronRight size={13} />
            </a>
          ))}
        </nav>
        <div className="settings-content">
          <section id="general" className="panel settings-section">
            <h2>General</h2>
            <p className="section-description">
              Preferences are saved in this browser.
            </p>
            <SettingRow
              title="Your name"
              description="How JARVIS greets you in this workspace."
            >
              <form
                className="name-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  settings.set({
                    name: (name ?? settings.name).trim() || "Fabrice",
                  });
                  setSaved(true);
                }}
              >
                <input
                  aria-label="Your name"
                  value={name ?? settings.name}
                  maxLength={40}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSaved(false);
                  }}
                />
                <Button type="submit" size="sm">
                  {saved ? "Saved" : "Save"}
                </Button>
              </form>
            </SettingRow>
          </section>
          <section id="voice" className="panel settings-section">
            <h2>Voice</h2>
            <SettingRow
              title="Voice interaction"
              description={
                isMockMode
                  ? "Enable the simulated microphone button. No audio is recorded."
                  : "Allow the microphone button to request listening from your Core."
              }
            >
              <Switch
                aria-label="Enable voice interaction"
                checked={settings.voiceEnabled}
                onCheckedChange={(voiceEnabled) =>
                  settings.set({ voiceEnabled })
                }
              />
            </SettingRow>
            <div className="settings-info">
              <AudioLines size={17} />
              <p>
                Speech recognition and synthesis belong to the Python Core. The
                UI displays its transcription and audio level events.
              </p>
            </div>
          </section>
          <section id="appearance" className="panel settings-section">
            <h2>Appearance</h2>
            <SettingRow
              title="Interface theme"
              description="Graphite surfaces with a subtle cyan accent."
            >
              <span className="theme-preview">
                <span />
                Midnight
              </span>
            </SettingRow>
            <SettingRow
              title="Reduce motion"
              description="Keep transitions quiet and pause orb animations."
            >
              <Switch
                aria-label="Reduce motion"
                checked={settings.reducedMotion}
                onCheckedChange={(reducedMotion) =>
                  settings.set({ reducedMotion })
                }
              />
            </SettingRow>
            <SettingRow
              title="Compact sidebar"
              description="More room for your workspace, with icon-only navigation."
            >
              <Switch
                aria-label="Compact sidebar"
                checked={settings.compact}
                onCheckedChange={(compact) => settings.set({ compact })}
              />
            </SettingRow>
          </section>
          <section id="notifications" className="panel settings-section">
            <h2>Notifications</h2>
            <SettingRow
              title="Workspace notifications"
              description="Show discreet in-app updates. History stays available in the bell menu."
            >
              <Switch
                aria-label="Workspace notifications"
                checked={settings.notifications}
                onCheckedChange={(notifications) =>
                  settings.set({ notifications })
                }
              />
            </SettingRow>
          </section>
          <section id="privacy" className="panel settings-section">
            <h2>Privacy</h2>
            <SettingRow
              title="Session data"
              description="Conversations and task history live in memory and reset when this page is reloaded."
            >
              <span className="subtle-badge">Session only</span>
            </SettingRow>
            <SettingRow
              title="Local preferences"
              description="Your name and interface preferences are stored in this browser."
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  settings.set({
                    name: "Fabrice",
                    reducedMotion: false,
                    compact: false,
                    notifications: true,
                    voiceEnabled: true,
                  });
                  setName(null);
                  setSaved(false);
                }}
              >
                Reset preferences
              </Button>
            </SettingRow>
            <div className="settings-info">
              <Fingerprint size={17} />
              <p>
                {isMockMode
                  ? "Demo mode does not capture audio, read files, or send commands to your computer."
                  : "Your configured Core controls data processing and retention. Check its privacy configuration separately."}
              </p>
            </div>
          </section>
          <section id="automation" className="panel settings-section">
            <h2>Automation</h2>
            <SettingRow
              title="Flutter environment scenario"
              description="Walk through planning, agent assignment, setup and verification."
            >
              <Button
                variant="outline"
                size="sm"
                disabled={
                  !isMockMode || state !== "idle" || connection !== "connected"
                }
                onClick={() =>
                  send({
                    type: "command.send",
                    text: "Prepare Flutter environment",
                  })
                }
              >
                <Play size={13} />
                Run demo
              </Button>
            </SettingRow>
            <p className="settings-caption">
              Scheduling and automation policies will be supplied by your Python
              Core.
            </p>
          </section>
          <section id="security" className="panel settings-section">
            <h2>Security</h2>
            <SettingRow
              title="Explicit confirmations"
              description="Sensitive requests open a dedicated dialog. No approval is assumed."
            >
              <span className="subtle-badge">
                <ShieldCheck size={13} />
                Required
              </span>
            </SettingRow>
            <SettingRow
              title="Test the approval flow"
              description="Simulate a request to close Spotify."
            >
              <Button
                variant="outline"
                size="sm"
                disabled={
                  !isMockMode || state !== "idle" || connection !== "connected"
                }
                onClick={() =>
                  send({ type: "command.send", text: "Close Spotify" })
                }
              >
                Test confirmation
              </Button>
            </SettingRow>
          </section>
          <section id="connections" className="panel settings-section">
            <h2>Connections</h2>
            <SettingRow
              title="Current adapter"
              description={
                isMockMode
                  ? "Local deterministic demo. No backend connected."
                  : "WebSocket connection to the configured Core."
              }
            >
              <span className="subtle-badge">
                {isMockMode ? "Mock Core" : "WebSocket"}
              </span>
            </SettingRow>
            <SettingRow
              title="Connection status"
              description="The WebSocket adapter reconnects automatically after interruptions."
            >
              <span
                className={
                  connection === "connected" ? "success-text" : "warning-text"
                }
              >
                {connection}
              </span>
            </SettingRow>
            <div className="settings-info">
              <Cable size={17} />
              <p>
                To connect your Python Core, set{" "}
                <code>NEXT_PUBLIC_JARVIS_MODE=websocket</code> and{" "}
                <code>NEXT_PUBLIC_JARVIS_WS_URL</code> in the environment, then
                restart the application. The proposed event contract is
                documented in the project README.
              </p>
            </div>
          </section>
          <section id="about" className="panel settings-section">
            <h2>JARVIS</h2>
            <p className="section-description">
              Personal intelligence. Purposefully designed.
            </p>
            <SettingRow
              title="Desktop Interface"
              description="An independent interface for your personal Python assistant."
            >
              <span className="subtle-badge">Version 1.0.0</span>
            </SettingRow>
            <p className="settings-caption">
              Built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, Motion
              and Zustand.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

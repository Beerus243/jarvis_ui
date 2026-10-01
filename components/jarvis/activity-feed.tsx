"use client";
import {
  Activity,
  AudioLines,
  Blocks,
  Check,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import { useJarvisStore } from "@/lib/store/jarvis-store";
import { timeLabel } from "@/lib/utils";
import { Panel } from "@/components/ui/panel";
const icons = {
  system: Cpu,
  voice: AudioLines,
  task: Check,
  agent: Blocks,
  security: ShieldCheck,
};
export function ActivityFeed({
  expanded = false,
  systemOnly = false,
}: {
  expanded?: boolean;
  systemOnly?: boolean;
}) {
  const activities = useJarvisStore((s) => s.activities);
  const items = (
    systemOnly
      ? activities.filter((a) => a.type === "system" || a.type === "security")
      : activities
  ).slice(0, expanded ? 50 : 4);
  return (
    <Panel
      title={systemOnly ? "System events" : "Activity feed"}
      icon={Activity}
      className="activity-panel"
      action={
        <span className="live-label">
          <span className="status-dot" />
          LIVE
        </span>
      }
    >
      <div className={`activity-list ${expanded ? "activity-expanded" : ""}`}>
        {items.length === 0 && (
          <p className="empty-state">
            Events will appear when the Core connects.
          </p>
        )}
        {items.map((activity) => {
          const Icon = icons[activity.type];
          return (
            <div className="activity-item" key={activity.id}>
              <div className={`activity-icon event-${activity.status}`}>
                <Icon size={13} />
              </div>
              <div className="activity-content">
                <p>{activity.message}</p>
                <span>
                  {activity.type === "system"
                    ? "System"
                    : activity.type === "agent"
                      ? "Agent orchestration"
                      : activity.type === "voice"
                        ? "Voice interface"
                        : activity.type === "security"
                          ? "Security"
                          : "Task execution"}
                </span>
              </div>
              <time>{timeLabel(activity.timestamp)}</time>
            </div>
          );
        })}
      </div>
      {!expanded && (
        <div className="panel-footnote">
          <span className="status-dot" />
          Events from the current session
        </div>
      )}
    </Panel>
  );
}

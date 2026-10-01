"use client";
import { Blocks, Braces, CheckCheck, Globe, Sparkles } from "lucide-react";
import { useJarvisStore } from "@/lib/store/jarvis-store";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
export const agentIcons = {
  environment: Braces,
  research: Globe,
  verification: CheckCheck,
  memory: Sparkles,
};
export function AgentPanel() {
  const agents = useJarvisStore((s) => s.agents);
  return (
    <Panel
      title="Agent network"
      icon={Blocks}
      href="/agents"
      className="agent-panel"
    >
      <div className="agent-list">
        {agents.length === 0 && (
          <p className="empty-state">Waiting for the agent registry.</p>
        )}
        {agents.map((agent) => {
          const Icon =
            agentIcons[agent.id as keyof typeof agentIcons] ?? Blocks;
          return (
            <div className="agent-row" key={agent.id}>
              <div className={`agent-icon agent-icon-${agent.id}`}>
                <Icon size={16} />
              </div>
              <div className="agent-row-copy">
                <strong>{agent.name}</strong>
                <span>
                  {agent.status === "running"
                    ? agent.lastEvent
                    : agent.description.split(" ").slice(0, 3).join(" ")}
                </span>
              </div>
              <StatusBadge status={agent.status}>
                {agent.status === "idle" ? "Standby" : agent.status}
              </StatusBadge>
            </div>
          );
        })}
      </div>
      <div className="panel-footnote">
        <span className="status-dot" />
        {agents.length} agents in your workspace
      </div>
    </Panel>
  );
}

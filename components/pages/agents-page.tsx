"use client";
import { Blocks, ChevronRight, Radio, Zap } from "lucide-react";
import { useJarvisStore } from "@/lib/store/jarvis-store";
import { PageHeading } from "@/components/layout/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { agentIcons } from "@/components/jarvis/agent-panel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
export function AgentsPage() {
  const agents = useJarvisStore((s) => s.agents);
  const activities = useJarvisStore((s) => s.activities);
  const busy = agents.filter(
    (a) => a.status === "running" || a.status === "thinking",
  ).length;
  return (
    <div className="page-container">
      <PageHeading
        eyebrow="SPECIALIZED INTELLIGENCE"
        title="Agent network"
        description="Independent capabilities, working together with a shared purpose."
      >
        <StatusBadge status="online">
          {agents.length} registered · {busy} active
        </StatusBadge>
      </PageHeading>
      <div className="agent-network-banner">
        <div className="network-symbol">
          <Blocks size={30} />
        </div>
        <div>
          <h2>One assistant. A team of specialists.</h2>
          <p>
            JARVIS coordinates the right agent for each task, keeping you in
            control.
          </p>
        </div>
        <Radio size={22} />
      </div>
      <div className="agent-card-grid">
        {agents.map((agent) => {
          const Icon =
            agentIcons[agent.id as keyof typeof agentIcons] ?? Blocks;
          return (
            <section className="panel agent-card" key={agent.id}>
              <div className="agent-card-top">
                <div className={`agent-icon agent-icon-${agent.id}`}>
                  <Icon size={24} />
                </div>
                <StatusBadge status={agent.status} />
              </div>
              <h2>{agent.name}</h2>
              <p>{agent.description}</p>
              <div className="agent-detail-row">
                <span>CURRENT TASK</span>
                <strong>{agent.task ?? "Ready for assignment"}</strong>
              </div>
              <div className="agent-detail-row">
                <span>LAST EVENT</span>
                <strong>{agent.lastEvent}</strong>
              </div>
              <div className="agent-card-bottom">
                <span>
                  <Zap size={13} />
                  {agent.actions} actions
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-button">
                      Inspect agent
                      <ChevronRight size={14} />
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{agent.name}</DialogTitle>
                      <DialogDescription>{agent.description}</DialogDescription>
                    </DialogHeader>
                    <StatusBadge status={agent.status} />
                    <div className="agent-inspection">
                      <p>
                        <span>Current assignment</span>
                        <strong>{agent.task ?? "None"}</strong>
                      </p>
                      <p>
                        <span>Last event</span>
                        <strong>{agent.lastEvent}</strong>
                      </p>
                      <p>
                        <span>Actions reported</span>
                        <strong>{agent.actions}</strong>
                      </p>
                    </div>
                    <h3 className="eyebrow">RECENT ORCHESTRATION EVENTS</h3>
                    <ul className="inspection-events">
                      {activities
                        .filter((a) => a.type === "agent")
                        .slice(0, 5)
                        .map((a) => (
                          <li key={a.id}>{a.message}</li>
                        ))}
                    </ul>
                  </DialogContent>
                </Dialog>
              </div>
            </section>
          );
        })}
      </div>
      {!agents.length && (
        <div className="empty-page">
          <Blocks size={32} />
          <h2>No agents registered</h2>
          <p>Connect your Core to inspect available agents.</p>
        </div>
      )}
    </div>
  );
}

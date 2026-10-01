"use client";
import {
  Check,
  Circle,
  ListTodo,
  LoaderCircle,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { useJarvisStore } from "@/lib/store/jarvis-store";
import { useGateway } from "@/lib/jarvis/gateway-provider";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Task } from "@/lib/jarvis/types";
export function TaskDetails({
  task,
  controls = true,
}: {
  task: Task;
  controls?: boolean;
}) {
  const send = useGateway();
  const state = useJarvisStore((s) => s.state);
  const ready = useJarvisStore((s) => s.connection === "connected");
  return (
    <div className="task-details">
      <div className="task-title-row">
        <h3>{task.title}</h3>
        <StatusBadge status={task.status} />
      </div>
      <div className="progress-label">
        <span>
          {task.status === "scheduled"
            ? "Ready to start"
            : task.status === "completed"
              ? "All steps completed"
              : "Overall progress"}
        </span>
        <strong>
          {task.progress}
          <span>%</span>
        </strong>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={task.title}
        aria-valuenow={task.progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div style={{ width: `${task.progress}%` }} />
      </div>
      <ol className="task-steps">
        {task.steps.map((step, i) => (
          <li key={step.title} className={`step-${step.status}`}>
            {step.status === "completed" ? (
              <Check size={13} />
            ) : step.status === "running" ? (
              <LoaderCircle size={13} className="spin" />
            ) : step.status === "failed" ? (
              <X size={13} />
            ) : (
              <Circle size={11} />
            )}
            <span>{step.title}</span>
            {step.status === "running" && (
              <span className="step-current">IN PROGRESS</span>
            )}
            <span className="sr-only">
              Step {i + 1}: {step.status}
            </span>
          </li>
        ))}
      </ol>
      <div className="task-meta">
        <span>
          <span className="agent-tiny-icon">{task.agent.slice(0, 1)}</span>
          {task.agent}
        </span>
        <span>
          {task.startedAt
            ? new Date(task.startedAt).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "On demand"}
        </span>
      </div>
      {controls && (
        <div className="task-controls">
          {task.status === "running" ? (
            <button
              className="text-button"
              onClick={() => send({ type: "task.cancel", id: task.id })}
              disabled={!ready}
            >
              <X size={13} />
              Cancel task
            </button>
          ) : ["scheduled", "completed", "failed", "cancelled"].includes(
              task.status,
            ) &&
            (task.id === "flutter-demo" || task.id === "research-demo") ? (
            <button
              className="text-button accent-text"
              disabled={state !== "idle" || !ready}
              onClick={() => send({ type: "command.send", text: task.title })}
            >
              {task.status === "scheduled" ? (
                <Play size={12} />
              ) : (
                <RotateCcw size={12} />
              )}
              {task.status === "scheduled" ? "Run scenario" : "Run again"}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
export function TaskPanel() {
  const task = useJarvisStore(
    (s) =>
      s.tasks.find((t) => t.status === "running" || t.status === "waiting") ??
      s.tasks.find((t) => t.id === "flutter-demo") ??
      s.tasks[0],
  );
  return (
    <Panel
      title={task?.status === "running" ? "Active task" : "Workspace task"}
      icon={ListTodo}
      href="/tasks"
      className="task-panel"
    >
      {task ? (
        <TaskDetails task={task} />
      ) : (
        <p className="empty-state">No tasks yet. Start with a command.</p>
      )}
    </Panel>
  );
}

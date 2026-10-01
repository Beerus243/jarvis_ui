"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, Circle, Mic, Square } from "lucide-react";
import { useGateway } from "@/lib/jarvis/gateway-provider";
import { isMockMode, useJarvisStore } from "@/lib/store/jarvis-store";
import { useSettingsStore } from "@/lib/store/settings-store";
import { JarvisOrb } from "@/components/jarvis/jarvis-orb";
import { JarvisStatus } from "@/components/jarvis/jarvis-status";
import type { Task } from "@/lib/jarvis/types";

function TaskMemo({ task, index }: { task: Task; index: number }) {
  const currentStep = task.steps.find((step) => step.status === "running");
  return (
    <motion.article
      className={`task-memo task-memo-${task.status}`}
      initial={{ opacity: 0, y: 10, rotate: index % 2 === 0 ? -1.2 : 1.2 }}
      animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -1.2 : 1.2 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
    >
      <Link href="/tasks" className="task-memo-link" aria-label={`${task.title}, ${task.status}, view tasks`}>
        <span className="memo-kicker">
          <span className={`memo-status-dot memo-status-${task.status}`} />
          {task.status === "running" ? "IN PROGRESS" : task.status.toUpperCase()}
        </span>
        <strong>{task.title}</strong>
        <span className="memo-progress-label">
          <span>{currentStep?.title ?? task.agent}</span>
          <span>{task.progress}%</span>
        </span>
        <span className="memo-progress-track" aria-hidden="true">
          <span style={{ width: `${task.progress}%` }} />
        </span>
        <span className="memo-footer">
          {task.steps.filter((step) => step.status === "completed").length} of {task.steps.length} steps
          <span>OPEN TASK <span aria-hidden="true">↗</span></span>
        </span>
      </Link>
    </motion.article>
  );
}

export function Dashboard() {
  const name = useSettingsStore((s) => s.name);
  const state = useJarvisStore((s) => s.state);
  const connection = useJarvisStore((s) => s.connection);
  const transcription = useJarvisStore((s) => s.transcription);
  const tasks = useJarvisStore((s) => s.tasks);
  const voiceEnabled = useSettingsStore((s) => s.voiceEnabled);
  const send = useGateway();
  const listening = state === "listening";
  const busy = !["idle", "error", "offline"].includes(state);
  const memos = tasks
    .filter((task) => ["running", "waiting", "scheduled"].includes(task.status))
    .sort((a, b) => {
      const priority = { running: 0, waiting: 1, scheduled: 2 };
      return priority[a.status as keyof typeof priority] - priority[b.status as keyof typeof priority];
    })
    .slice(0, 3);

  return (
    <div className="home-dashboard">
      <div className="home-heading">
        <span className="eyebrow">PERSONAL COMMAND SPACE</span>
        <h1>Bonjour, {name || "Fabrice"}</h1>
        <p>{isMockMode ? "Espace de démonstration · aucune action sur votre appareil" : "Votre espace personnel JARVIS"}</p>
      </div>
      <section className="home-stage" aria-label="JARVIS home control">
        <div className="home-hub">
          <div className="home-orb">
            <JarvisOrb />
          </div>
          <JarvisStatus />
          <button
            className={`home-mic ${listening ? "home-mic-listening" : ""}`}
            onClick={() => send({ type: listening ? "voice.stop" : "voice.start" })}
            disabled={connection !== "connected" || !voiceEnabled || (busy && !listening)}
            aria-label={listening ? "Pause listening" : isMockMode ? "Speak to JARVIS" : "Start Core microphone"}
            title={listening ? "Pause listening" : "Speak to JARVIS"}
          >
            {listening ? <Square size={19} fill="currentColor" /> : <Mic size={22} />}
          </button>
          <span className="home-mic-label">{listening ? "PAUSE LISTENING" : "TAP TO SPEAK"}</span>
          {transcription && (
            <p className="home-transcription" aria-live="polite">
              <span>YOU</span>“{transcription}”
            </p>
          )}
        </div>
        <aside className="home-memos" aria-label="Tasks pinned to home">
          <div className="home-memos-heading">
            <span>PINNED TASKS</span>
            <Link href="/tasks">VIEW ALL <span aria-hidden="true">↗</span></Link>
          </div>
          {memos.length > 0 ? (
            memos.map((task, index) => <TaskMemo key={task.id} task={task} index={index} />)
          ) : (
            <div className="home-memo-empty">
              <Check size={15} />
              <span>All clear. No active tasks.</span>
            </div>
          )}
          <div className="home-session-note">
            <span className="status-dot" />
            {connection === "connected" ? (isMockMode ? "DEMO CORE CONNECTED" : "CORE CONNECTED") : "CORE OFFLINE"}
            <Circle size={5} />
            VOICE {voiceEnabled ? "READY" : "PAUSED"}
          </div>
        </aside>
      </section>
    </div>
  );
}

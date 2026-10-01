"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, Circle, Mic, SendHorizonal, Square } from "lucide-react";
import { useState } from "react";
import { isMockMode, useJarvisStore } from "@/lib/store/jarvis-store";
import { useSettingsStore } from "@/lib/store/settings-store";
import { JarvisOrb } from "@/components/jarvis/jarvis-orb";
import { JarvisStatus } from "@/components/jarvis/jarvis-status";
import type { Task } from "@/lib/jarvis/types";
import { useGateway } from "@/lib/jarvis/gateway-provider";
import { useCoreMicrophone } from "@/lib/jarvis/use-core-microphone";

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
  const send = useGateway();
  const transcription = useJarvisStore((s) => s.transcription);
  const tasks = useJarvisStore((s) => s.tasks);
  const voiceEnabled = useSettingsStore((s) => s.voiceEnabled);
  const coreMicrophone = useCoreMicrophone();
  const [command, setCommand] = useState("");
  const coreActive = coreMicrophone.status === "active";
  const coreTransitioning = ["checking", "activating", "deactivating"].includes(coreMicrophone.status);
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
        <span className="eyebrow">ESPACE DE COMMANDE PERSONNEL</span>
        <h1>Bonjour, {name || "Fabrice"}</h1>
        <p>{isMockMode ? "Commandes vocales liées au cœur local · le reste est démonstratif" : "Votre espace personnel JARVIS"}</p>
      </div>
      <section className="home-stage" aria-label="Contrôle principal JARVIS">
        <div className="home-hub">
          <div className="home-orb">
            <JarvisOrb />
          </div>
          <JarvisStatus />
          <button
            className={`home-mic ${coreActive ? "home-mic-listening" : ""}`}
            onClick={() => void coreMicrophone.toggle()}
            disabled={coreTransitioning || (!voiceEnabled && !coreActive)}
            aria-label={coreActive ? "Mettre en pause le microphone JARVIS" : "Relancer le microphone JARVIS"}
            title={coreMicrophone.error ?? (coreActive ? "Mettre en pause le service vocal local" : "Relancer le service vocal local")}
          >
            {coreTransitioning ? <Circle size={19} className="spin" /> : coreActive ? <Square size={19} fill="currentColor" /> : <Mic size={22} />}
          </button>
          <span className="home-mic-label">
            {coreTransitioning ? "CONNEXION AU CŒUR" : coreActive ? "MICROPHONE ACTIF · DITES JARVIS" : coreMicrophone.status === "unavailable" ? "CONTRÔLE DU CŒUR INDISPONIBLE" : "RELANCER LE MICROPHONE"}
          </span>

          <div className="home-command" aria-label="Commande JARVIS">
            <label htmlFor="home-command" className="home-command-label">
              Commande
            </label>
            <div className="home-command-row">
              <input
                id="home-command"
                className="home-command-input"
                type="text"
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                placeholder="Écrivez une commande…"
                aria-label="Écrire une commande pour JARVIS"
              />
              <button
                type="button"
                className="home-command-button"
                onClick={() => {
                  const nextText = command.trim();
                  if (!nextText) return;
                  send({ type: "command.send", text: nextText });
                  setCommand("");
                }}
                aria-label="Envoyer la commande"
              >
                <SendHorizonal size={15} />
              </button>
            </div>
          </div>

          {transcription && (
            <p className="home-transcription" aria-live="polite">
              <span>VOUS</span>“{transcription}”
            </p>
          )}
        </div>
        <aside className="home-memos" aria-label="Tâches épinglées à l'accueil">
          <div className="home-memos-heading">
            <span>TÂCHES ÉPINGLÉES</span>
            <Link href="/tasks">VOIR TOUT <span aria-hidden="true">↗</span></Link>
          </div>
          {memos.length > 0 ? (
            memos.map((task, index) => <TaskMemo key={task.id} task={task} index={index} />)
          ) : (
            <div className="home-memo-empty">
              <Check size={15} />
              <span>Tout est clair. Aucune tâche active.</span>
            </div>
          )}
          <div className="home-session-note">
            <span className="status-dot" />
            {coreMicrophone.status === "active" ? "CŒUR VOCAL ACTIF" : coreMicrophone.status === "inactive" ? "CŒUR VOCAL EN PAUSE" : coreMicrophone.status === "unavailable" ? "CŒUR VOCAL INDISPONIBLE" : "VÉRIFICATION DU CŒUR"}
            <Circle size={5} />
            VOIX {voiceEnabled ? "PRÊTE" : "EN PAUSE"}
          </div>
        </aside>
      </section>
    </div>
  );
}

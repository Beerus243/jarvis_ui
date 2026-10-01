"use client";
import { AnimatePresence, motion } from "motion/react";
import { useJarvisStore } from "@/lib/store/jarvis-store";
import type { JarvisState } from "@/lib/jarvis/types";
const titles: Record<JarvisState, string> = {
  idle: "À votre service.",
  listening: "Je vous écoute.",
  thinking: "Je relie les informations.",
  speaking: "Voici votre mise à jour.",
  executing: "C’est en mouvement.",
  waiting_confirmation: "Vous gardez le contrôle.",
  error: "Reconnexion en cours.",
  offline: "En attente.",
};

const labels: Record<JarvisState, string> = {
  idle: "JARVIS EST PRÊT",
  listening: "ÉCOUTE EN COURS",
  thinking: "RÉFLEXION",
  speaking: "PAROLE",
  executing: "EXÉCUTION",
  waiting_confirmation: "CONFIRMATION REQUISE",
  error: "ERREUR",
  offline: "HORS LIGNE",
};

export function JarvisStatus() {
  const state = useJarvisStore((s) => s.state);
  const detail = useJarvisStore((s) => s.detail);
  return (
    <div className="jarvis-status" aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className={`orb-state-label text-${state}`}>
            <span className="status-dot" />
            {labels[state]}
          </div>
          <h2>{titles[state]}</h2>
          <p>{detail}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

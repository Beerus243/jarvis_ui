"use client";
import { AnimatePresence, motion } from "motion/react";
import { useJarvisStore } from "@/lib/store/jarvis-store";
import type { JarvisState } from "@/lib/jarvis/types";
const titles: Record<JarvisState, string> = {
  idle: "At your service.",
  listening: "I’m listening.",
  thinking: "Connecting the dots.",
  speaking: "Here’s your update.",
  executing: "Consider it in motion.",
  waiting_confirmation: "You’re in control.",
  error: "Let’s reconnect.",
  offline: "Standing by.",
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
            {state === "idle"
              ? "JARVIS IS READY"
              : state === "waiting_confirmation"
                ? "CONFIRMATION REQUIRED"
                : state.replaceAll("_", " ").toUpperCase()}
          </div>
          <h2>{titles[state]}</h2>
          <p>{detail}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

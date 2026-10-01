import { create } from "zustand";
import type { JarvisEvent } from "../jarvis/events";
import type {
  Activity,
  Agent,
  Confirmation,
  ConnectionStatus,
  JarvisState,
  Message,
  Notification,
  SystemContext,
  Task,
} from "../jarvis/types";

export function resolveJarvisMode() {
  const mode = process.env.NEXT_PUBLIC_JARVIS_MODE ?? "websocket";
  return mode === "mock" ? "mock" : "websocket";
}

export const isMockMode = resolveJarvisMode() !== "websocket";
interface JarvisStore {
  state: JarvisState;
  detail: string;
  connection: ConnectionStatus;
  activities: Activity[];
  tasks: Task[];
  agents: Agent[];
  system: SystemContext | null;
  messages: Message[];
  confirmations: Confirmation[];
  notifications: Notification[];
  transcription: string;
  audioLevel: number;
  voiceAvailable: boolean;
  applyEvent: (event: JarvisEvent) => void;
  setConnection: (status: ConnectionStatus) => void;
  markNotificationsRead: () => void;
}
function upsert<T extends { id: string }>(items: T[], item: T) {
  return items.some((x) => x.id === item.id)
    ? items.map((x) => (x.id === item.id ? item : x))
    : [...items, item];
}
export const useJarvisStore = create<JarvisStore>((set) => ({
  state: "offline",
  detail: "Connexion à votre espace de travail…",
  connection: "connecting",
  activities: [],
  tasks: [],
  agents: [],
  system: null,
  messages: [],
  confirmations: [],
  notifications: [],
  transcription: "",
  audioLevel: 0,
  voiceAvailable: isMockMode,
  setConnection: (connection) =>
    set(
      connection === "disconnected"
        ? {
            connection,
            state: "offline",
            detail: "Cœur déconnecté. Tentative de reconnexion…",
            audioLevel: 0,
            confirmations: [],
            voiceAvailable: false,
          }
        : { connection },
    ),
  markNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),
  applyEvent: (event) =>
    set((s) => {
      switch (event.type) {
        case "session.reset":
          return {
            tasks: [],
            agents: [],
            confirmations: [],
            messages: [],
            activities: [],
            notifications: [],
            system: null,
            transcription: "",
            audioLevel: 0,
            voiceAvailable: false,
            state: "idle",
            detail: "Synchronisation du Core…",
          };
        case "session.capabilities":
          return { voiceAvailable: event.voice };
        case "state.changed":
          return { state: event.state, detail: event.detail ?? "" };
        case "activity.created":
          return {
            activities: [
              event.activity,
              ...s.activities.filter((a) => a.id !== event.activity.id),
            ].slice(0, 150),
          };
        case "task.updated":
          return { tasks: upsert(s.tasks, event.task).slice(-100) };
        case "agent.updated":
          return { agents: upsert(s.agents, event.agent) };
        case "system.updated":
          return { system: event.system };
        case "message.updated":
          return { messages: upsert(s.messages, event.message).slice(-200) };
        case "transcription.updated":
          return { transcription: event.text, audioLevel: event.level };
        case "confirmation.required":
          return {
            confirmations: upsert(s.confirmations, event.confirmation),
            state: "waiting_confirmation",
          };
        case "confirmation.resolved":
          return {
            confirmations: s.confirmations.filter((c) => c.id !== event.id),
          };
        case "notification.created":
          return {
            notifications: [
              event.notification,
              ...s.notifications.filter((n) => n.id !== event.notification.id),
            ].slice(0, 50),
          };
      }
    }),
}));

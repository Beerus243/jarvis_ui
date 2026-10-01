import { z } from "zod";

export const jarvisStateSchema = z.enum([
  "idle",
  "listening",
  "thinking",
  "speaking",
  "executing",
  "waiting_confirmation",
  "error",
  "offline",
]);
export type JarvisState = z.infer<typeof jarvisStateSchema>;
export const activitySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  type: z.enum(["system", "voice", "task", "agent", "security"]),
  message: z.string(),
  status: z.enum(["info", "success", "warning", "error"]),
});
export type Activity = z.infer<typeof activitySchema>;
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum([
    "scheduled",
    "running",
    "waiting",
    "completed",
    "failed",
    "cancelled",
  ]),
  progress: z.number().min(0).max(100),
  agent: z.string(),
  startedAt: z.string().nullable(),
  steps: z.array(
    z.object({
      title: z.string(),
      status: z.enum(["pending", "running", "completed", "failed"]),
    }),
  ),
});
export type Task = z.infer<typeof taskSchema>;
export const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum([
    "idle",
    "thinking",
    "running",
    "waiting",
    "completed",
    "failed",
  ]),
  task: z.string().nullable(),
  lastEvent: z.string(),
  actions: z.number().nonnegative(),
});
export type Agent = z.infer<typeof agentSchema>;
export type AgentStatus = Agent["status"];
export const applicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  detail: z.string(),
  status: z.enum(["active", "playing", "paused", "closed"]),
});
export type Application = z.infer<typeof applicationSchema>;
export const systemSchema = z.object({
  cpu: z.number().min(0).max(100),
  ram: z.number().min(0).max(100),
  storage: z.number().min(0).max(100),
  ramTotal: z.number(),
  network: z.boolean(),
  microphone: z.boolean(),
  audio: z.boolean(),
  window: z.string(),
  version: z.string(),
  latency: z.number().nullable(),
  applications: z.array(applicationSchema),
});
export type SystemContext = z.infer<typeof systemSchema>;
export const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "jarvis"]),
  text: z.string(),
  timestamp: z.string(),
  status: z.enum(["sending", "sent", "failed"]),
  tools: z.array(z.string()).default([]),
});
export type Message = z.infer<typeof messageSchema>;
export const confirmationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  target: z.string(),
  taskId: z.string().optional(),
});
export type Confirmation = z.infer<typeof confirmationSchema>;
export const notificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  timestamp: z.string(),
  read: z.boolean(),
  kind: z.enum(["info", "success", "warning", "error"]),
});
export type Notification = z.infer<typeof notificationSchema>;
export type MemoryCategory =
  | "Recent"
  | "Long-term"
  | "Preferences"
  | "Projects"
  | "People"
  | "Habits"
  | "Facts";
export interface MemoryEntry {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  updatedAt: string;
  tags: string[];
}
export type CoreCommand =
  | { type: "command.send"; text: string }
  | { type: "voice.start" }
  | { type: "voice.stop" }
  | { type: "confirmation.respond"; id: string; approved: boolean }
  | { type: "task.cancel"; id: string };
export interface JarvisGateway {
  connect(): void;
  disconnect(): void;
  send(command: CoreCommand): boolean;
}
export type ConnectionStatus = "connecting" | "connected" | "disconnected";

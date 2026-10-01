import { z } from "zod";
import {
  activitySchema,
  agentSchema,
  confirmationSchema,
  jarvisStateSchema,
  messageSchema,
  notificationSchema,
  systemSchema,
  taskSchema,
} from "./types";

export const jarvisEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("state.changed"),
    state: jarvisStateSchema,
    detail: z.string().optional(),
  }),
  z.object({ type: z.literal("activity.created"), activity: activitySchema }),
  z.object({ type: z.literal("task.updated"), task: taskSchema }),
  z.object({ type: z.literal("agent.updated"), agent: agentSchema }),
  z.object({ type: z.literal("system.updated"), system: systemSchema }),
  z.object({ type: z.literal("message.updated"), message: messageSchema }),
  z.object({
    type: z.literal("transcription.updated"),
    text: z.string(),
    level: z.number().min(0).max(1),
  }),
  z.object({
    type: z.literal("confirmation.required"),
    confirmation: confirmationSchema,
  }),
  z.object({ type: z.literal("confirmation.resolved"), id: z.string() }),
  z.object({
    type: z.literal("notification.created"),
    notification: notificationSchema,
  }),
]);
export type JarvisEvent = z.infer<typeof jarvisEventSchema>;
export type EventListener = (event: JarvisEvent) => void;

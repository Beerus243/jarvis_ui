import { test } from "node:test";
import assert from "node:assert/strict";
import { MockCore } from "../lib/mock/mock-core";
import { jarvisEventSchema, type JarvisEvent } from "../lib/jarvis/events";
import { useJarvisStore } from "../lib/store/jarvis-store";

test("rejects malformed Core payloads before reaching the store", () => {
  assert.equal(
    jarvisEventSchema.safeParse({ type: "state.changed", state: "invented" })
      .success,
    false,
  );
  assert.equal(
    jarvisEventSchema.safeParse({
      type: "transcription.updated",
      text: "hello",
      level: 5,
    }).success,
    false,
  );
  assert.equal(
    jarvisEventSchema.safeParse({
      type: "task.updated",
      task: { id: "a", progress: 200 },
    }).success,
    false,
  );
  assert.equal(
    jarvisEventSchema.safeParse({ type: "state.changed", state: "idle" })
      .success,
    true,
  );
});

test("voice scenario transcribes, completes all steps, then returns to idle", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const events: JarvisEvent[] = [];
  const core = new MockCore(
    (e) => events.push(e),
    () => {},
  );
  core.connect();
  events.length = 0;
  assert.equal(core.send({ type: "voice.start" }), true);
  assert.equal(
    core.send({ type: "command.send", text: "another command" }),
    false,
  );
  t.mock.timers.tick(3200);
  assert.ok(
    events.some(
      (e) => e.type === "transcription.updated" && e.text.includes("Flutter"),
    ),
  );
  t.mock.timers.tick(1300);
  for (let i = 0; i < 5; i++) t.mock.timers.tick(1800);
  const tasks = events.filter((e) => e.type === "task.updated");
  assert.equal(tasks.at(-1)?.task.status, "completed");
  assert.equal(tasks.at(-1)?.task.progress, 100);
  assert.ok(tasks.at(-1)?.task.steps.every((s) => s.status === "completed"));
  t.mock.timers.tick(2400);
  assert.deepEqual(
    events.filter((e) => e.type === "state.changed").map((e) => e.state),
    ["listening", "thinking", "executing", "executing", "speaking", "idle"],
  );
  core.disconnect();
});

test("declining confirmation never closes the application; approval executes once", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const events: JarvisEvent[] = [];
  const core = new MockCore(
    (e) => events.push(e),
    () => {},
  );
  core.connect();
  events.length = 0;
  core.send({ type: "command.send", text: "Close Spotify" });
  t.mock.timers.tick(1200);
  const request = events.find((e) => e.type === "confirmation.required");
  assert.ok(request && request.type === "confirmation.required");
  assert.equal(events.filter((e) => e.type === "system.updated").length, 0);
  assert.equal(
    core.send({
      type: "confirmation.respond",
      id: "incorrect",
      approved: true,
    }),
    false,
  );
  core.send({
    type: "confirmation.respond",
    id: request.confirmation.id,
    approved: false,
  });
  assert.equal(events.filter((e) => e.type === "system.updated").length, 0);
  events.length = 0;
  core.send({ type: "command.send", text: "Close Spotify" });
  t.mock.timers.tick(1200);
  const next = events.find((e) => e.type === "confirmation.required");
  assert.ok(next && next.type === "confirmation.required");
  assert.equal(
    core.send({
      type: "confirmation.respond",
      id: next.confirmation.id,
      approved: true,
    }),
    true,
  );
  assert.equal(
    core.send({
      type: "confirmation.respond",
      id: next.confirmation.id,
      approved: true,
    }),
    false,
  );
  const update = events.find((e) => e.type === "system.updated");
  assert.equal(
    update?.system.applications.find((a) => a.id === "spotify")?.status,
    "closed",
  );
  core.disconnect();
});

test("cancelled tasks and stopped voice have no late events", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const events: JarvisEvent[] = [];
  const core = new MockCore(
    (e) => events.push(e),
    () => {},
  );
  core.connect();
  core.send({ type: "command.send", text: "Prepare Flutter environment" });
  t.mock.timers.tick(1300);
  assert.equal(core.send({ type: "task.cancel", id: "flutter-demo" }), true);
  const count = events.length;
  t.mock.timers.tick(20000);
  assert.equal(events.length, count);
  assert.equal(
    events.filter((e) => e.type === "task.updated").at(-1)?.task.status,
    "cancelled",
  );
  core.send({ type: "voice.start" });
  t.mock.timers.tick(500);
  core.send({ type: "voice.stop" });
  const stoppedCount = events.length;
  t.mock.timers.tick(20000);
  assert.equal(events.length, stoppedCount);
  core.disconnect();
  assert.equal(core.send({ type: "voice.start" }), false);
});

test("event store upserts entities and keeps activity bounded", () => {
  useJarvisStore.setState({ activities: [], tasks: [] });
  const apply = useJarvisStore.getState().applyEvent;
  for (let i = 0; i < 180; i++)
    apply({
      type: "activity.created",
      activity: {
        id: String(i),
        message: "event",
        type: "system",
        status: "info",
        timestamp: new Date().toISOString(),
      },
    });
  assert.equal(useJarvisStore.getState().activities.length, 150);
  apply({
    type: "activity.created",
    activity: {
      id: "179",
      message: "updated",
      type: "system",
      status: "success",
      timestamp: new Date().toISOString(),
    },
  });
  assert.equal(useJarvisStore.getState().activities.length, 150);
  assert.equal(useJarvisStore.getState().activities[0].message, "updated");
  useJarvisStore.getState().setConnection("disconnected");
  assert.equal(useJarvisStore.getState().state, "offline");
});

test("WebSocket validates payloads, reconnects, and never replays commands", async (t) => {
  const { WebSocketGateway } = await import("../lib/jarvis/gateway");
  t.mock.timers.enable({ apis: ["setTimeout"] });
  class FakeSocket {
    static OPEN = 1;
    static CLOSING = 2;
    static instances: FakeSocket[] = [];
    readyState = 0;
    sent: string[] = [];
    onopen: (() => void) | null = null;
    onclose: (() => void) | null = null;
    onerror: (() => void) | null = null;
    onmessage: ((event: { data: string }) => void) | null = null;
    constructor() {
      FakeSocket.instances.push(this);
    }
    send(payload: string) {
      this.sent.push(payload);
    }
    close() {
      this.readyState = 3;
      this.onclose?.();
    }
  }
  const original = globalThis.WebSocket;
  Object.defineProperty(globalThis, "WebSocket", {
    value: FakeSocket,
    writable: true,
    configurable: true,
  });
  t.after(() =>
    Object.defineProperty(globalThis, "WebSocket", {
      value: original,
      writable: true,
      configurable: true,
    }),
  );
  const events: JarvisEvent[] = [];
  const connections: string[] = [];
  const gateway = new WebSocketGateway(
    "ws://localhost:8765/ws",
    (event) => events.push(event),
    (status) => connections.push(status),
  );
  gateway.connect();
  assert.equal(
    gateway.send({ type: "command.send", text: "Do not queue" }),
    false,
  );
  const first = FakeSocket.instances[0];
  first.readyState = 1;
  first.onopen?.();
  assert.deepEqual(JSON.parse(first.sent[0]), {
    type: "session.subscribe",
    protocolVersion: 1,
  });
  first.onmessage?.({
    data: JSON.stringify({ type: "state.changed", state: "invented" }),
  });
  assert.equal(events.at(-1)?.type, "notification.created");
  first.onmessage?.({
    data: JSON.stringify({ type: "state.changed", state: "idle" }),
  });
  assert.equal(events.at(-1)?.type, "state.changed");
  assert.equal(gateway.send({ type: "command.send", text: "Hello" }), true);
  first.close();
  assert.equal(
    gateway.send({ type: "command.send", text: "Do not replay" }),
    false,
  );
  t.mock.timers.tick(1000);
  const second = FakeSocket.instances[1];
  second.readyState = 1;
  second.onopen?.();
  assert.equal(second.sent.length, 1);
  assert.equal(JSON.parse(second.sent[0]).type, "session.subscribe");
  gateway.disconnect();
  t.mock.timers.tick(60000);
  assert.equal(FakeSocket.instances.length, 2);
  assert.deepEqual(connections, [
    "connecting",
    "connected",
    "disconnected",
    "connecting",
    "connected",
    "disconnected",
  ]);
});

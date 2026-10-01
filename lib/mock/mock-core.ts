import type { EventListener } from "../jarvis/events";
import type {
  Agent,
  CoreCommand,
  JarvisGateway,
  JarvisState,
  Task,
} from "../jarvis/types";
import {
  flutterTask,
  mockActivities,
  mockAgents,
  mockMessages,
  mockNotifications,
  mockSystem,
  mockTasks,
} from "./data";

/** Deterministic demo adapter. Never accesses the microphone, filesystem or Python. */
export class MockCore implements JarvisGateway {
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private busy = false;
  private connected = false;
  private voice = false;
  private currentTask: Task | null = null;
  private pendingConfirmation: string | null = null;
  private system = structuredClone(mockSystem);
  private agents = structuredClone(mockAgents);
  constructor(
    private emit: EventListener,
    private connection: (value: "connected" | "disconnected") => void,
  ) {}
  private id() {
    return crypto.randomUUID();
  }
  private later(delay: number, fn: () => void) {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      fn();
    }, delay);
    this.timers.add(timer);
  }
  private clear() {
    this.timers.forEach(clearTimeout);
    this.timers.clear();
  }
  private state(state: JarvisState, detail: string) {
    this.emit({ type: "state.changed", state, detail });
  }
  private activity(
    message: string,
    type: "system" | "voice" | "task" | "agent" | "security" = "task",
    status: "info" | "success" | "warning" | "error" = "info",
  ) {
    this.emit({
      type: "activity.created",
      activity: {
        id: this.id(),
        timestamp: new Date().toISOString(),
        type,
        message,
        status,
      },
    });
  }
  private notification(
    title: string,
    message: string,
    kind: "info" | "success" | "warning" | "error" = "success",
  ) {
    this.emit({
      type: "notification.created",
      notification: {
        id: this.id(),
        title,
        message,
        kind,
        read: false,
        timestamp: new Date().toISOString(),
      },
    });
  }
  private message(text: string, role: "user" | "jarvis", tools: string[] = []) {
    this.emit({
      type: "message.updated",
      message: {
        id: this.id(),
        text,
        role,
        tools,
        timestamp: new Date().toISOString(),
        status: "sent",
      },
    });
  }
  private agent(
    id: string,
    status: Agent["status"],
    task: string | null,
    lastEvent: string,
  ) {
    const agent = this.agents.find((a) => a.id === id);
    if (!agent) return;
    const updated: Agent = {
      ...agent,
      status,
      task,
      lastEvent,
      actions:
        agent.actions +
        (status === "completed" && agent.status !== "completed" ? 5 : 0),
    };
    this.agents = this.agents.map((entry) =>
      entry.id === id ? updated : entry,
    );
    this.emit({ type: "agent.updated", agent: updated });
  }

  connect() {
    this.connected = true;
    this.connection("connected");
    mockTasks.forEach((task) => this.emit({ type: "task.updated", task }));
    this.agents.forEach((agent) => this.emit({ type: "agent.updated", agent }));
    [...mockActivities]
      .reverse()
      .forEach((activity) => this.emit({ type: "activity.created", activity }));
    mockMessages.forEach((message) =>
      this.emit({ type: "message.updated", message }),
    );
    mockNotifications.forEach((notification) =>
      this.emit({ type: "notification.created", notification }),
    );
    this.emit({ type: "system.updated", system: this.system });
    this.state("idle", "Your workspace is ready. What shall we do next?");
  }
  disconnect() {
    this.clear();
    this.busy = false;
    this.voice = false;
    this.connected = false;
    this.connection("disconnected");
  }
  send(command: CoreCommand): boolean {
    if (!this.connected) return false;
    if (command.type === "confirmation.respond")
      return this.resolve(command.id, command.approved);
    if (command.type === "task.cancel") {
      if (
        this.currentTask?.id !== command.id ||
        !this.busy ||
        this.pendingConfirmation
      )
        return false;
      this.clear();
      this.busy = false;
      this.emit({
        type: "task.updated",
        task: {
          ...this.currentTask,
          status: "cancelled",
          steps: this.currentTask.steps.map((s) => ({
            ...s,
            status: s.status === "running" ? "pending" : s.status,
          })),
        },
      });
      this.agent("environment", "idle", null, "Task cancelled");
      this.agent("verification", "idle", null, "Task cancelled");
      this.agent("research", "idle", null, "Task cancelled");
      this.activity("Task cancelled by you", "task", "warning");
      this.state("idle", "Task cancelled. Ready when you are.");
      return true;
    }
    if (command.type === "voice.stop") {
      if (!this.voice) return false;
      this.clear();
      this.voice = false;
      this.busy = false;
      this.emit({ type: "transcription.updated", text: "", level: 0 });
      this.state("idle", "Listening stopped.");
      return true;
    }
    if (this.busy) return false;
    if (command.type === "voice.start") {
      this.busy = true;
      this.voice = true;
      this.state("listening", "Listening to a simulated voice command…");
      this.activity("Demo voice input started", "voice");
      const words = "JARVIS, prépare-moi un environnement Flutter.".split(" ");
      words.forEach((_, i) =>
        this.later(400 * (i + 1), () =>
          this.emit({
            type: "transcription.updated",
            text: words.slice(0, i + 1).join(" "),
            level: [0.25, 0.7, 0.4, 0.85, 0.5, 0.3][i % 6],
          }),
        ),
      );
      this.later(3200, () => {
        this.voice = false;
        this.busy = false;
        this.emit({
          type: "transcription.updated",
          text: words.join(" "),
          level: 0,
        });
        this.run(words.join(" "));
      });
      return true;
    }
    if (command.type === "command.send" && command.text.trim()) {
      this.run(command.text.trim());
      return true;
    }
    return false;
  }
  private run(text: string) {
    this.busy = true;
    this.message(text, "user");
    this.state("thinking", "Analyzing your request…");
    this.activity("Command recognized", "voice");
    if (/(close|ferme).*spotify|spotify.*(close|ferme)/i.test(text)) {
      this.later(1200, () => {
        const id = this.id();
        this.pendingConfirmation = id;
        this.currentTask = {
          id: "close-spotify-demo",
          title: "Close Spotify",
          status: "waiting",
          progress: 0,
          agent: "System Agent",
          startedAt: new Date().toISOString(),
          steps: [{ title: "Await your confirmation", status: "pending" }],
        };
        this.emit({ type: "task.updated", task: this.currentTask });
        this.emit({
          type: "confirmation.required",
          confirmation: {
            id,
            title: "Close Spotify?",
            target: "Spotify",
            description:
              "JARVIS would like to close Spotify. Playback will stop. This demonstration will only update the simulated application state.",
            taskId: this.currentTask.id,
          },
        });
        this.state(
          "waiting_confirmation",
          "Your approval is required to continue.",
        );
        this.notification(
          "Confirmation required",
          "Review the request to close Spotify.",
          "warning",
        );
      });
      return;
    }
    if (/flutter|workspace|environnement|environment/i.test(text)) {
      this.later(1300, () => this.flutter());
      return;
    }
    if (/research|recherche|freelance/i.test(text)) {
      this.later(1300, () => this.research());
      return;
    }
    this.later(1600, () => {
      this.state("speaking", "Here is what I can do in this demo.");
      this.message(
        "This is a local UI demonstration. Try “Prepare Flutter environment”, “Research freelance opportunities”, or “Close Spotify” to explore the connected workflows. No command has been executed on your computer.",
        "jarvis",
      );
    });
    this.later(4000, () => {
      this.busy = false;
      this.state("idle", "Ready for your next request.");
    });
  }
  private flutter() {
    this.currentTask = {
      ...structuredClone(flutterTask),
      status: "running",
      startedAt: new Date().toISOString(),
    };
    this.state("executing", "Preparing your Flutter environment…");
    this.activity("Environment Agent started", "agent");
    this.agent(
      "environment",
      "running",
      flutterTask.title,
      "Analyzing environment",
    );
    this.agent(
      "verification",
      "waiting",
      flutterTask.title,
      "Waiting for environment setup",
    );
    this.message(
      "I’ll check the SDKs, configure your workspace and verify the environment. This run is simulated.",
      "jarvis",
      ["environment.prepare"],
    );
    this.step(0);
    [1, 2, 3, 4, 5].forEach((i) => this.later(i * 1800, () => this.step(i)));
  }
  private step(index: number) {
    if (!this.currentTask) return;
    const complete = index === 5;
    this.currentTask = {
      ...this.currentTask,
      progress: index * 20,
      status: complete ? "completed" : "running",
      steps: this.currentTask.steps.map((step, i) => ({
        ...step,
        status: i < index ? "completed" : i === index ? "running" : "pending",
      })),
    };
    this.emit({ type: "task.updated", task: this.currentTask });
    if (index > 0)
      this.activity(
        this.currentTask.steps[index - 1].title + " — complete",
        "task",
        "success",
      );
    if (index === 4) {
      this.agent("environment", "completed", null, "Environment configured");
      this.agent(
        "verification",
        "running",
        flutterTask.title,
        "Running final checks",
      );
      this.state("executing", "Verifying your environment…");
    }
    if (complete) {
      this.agent(
        "verification",
        "completed",
        null,
        "All verification checks passed",
      );
      this.state("speaking", "Your Flutter environment is ready.");
      this.message(
        "Your Flutter environment is ready. Flutter and Android SDK checks passed, and workspace configuration is complete. These are simulated results.",
        "jarvis",
        ["environment.prepare", "verification.check"],
      );
      this.notification(
        "Task completed",
        "Flutter environment ready · simulated result",
      );
      this.later(2400, () => {
        this.busy = false;
        this.state("idle", "All set. Ready for your next request.");
      });
    }
  }
  private research() {
    this.currentTask = {
      ...mockTasks[1],
      status: "running",
      progress: 25,
      startedAt: new Date().toISOString(),
      steps: [{ title: "Review sample opportunities", status: "running" }],
    };
    this.emit({ type: "task.updated", task: this.currentTask });
    this.agent(
      "research",
      "running",
      this.currentTask.title,
      "Reviewing sample opportunities",
    );
    this.state("executing", "Organizing research results…");
    this.later(3500, () => {
      if (!this.currentTask) return;
      this.emit({
        type: "task.updated",
        task: {
          ...this.currentTask,
          status: "completed",
          progress: 100,
          steps: [
            { title: "Review sample opportunities", status: "completed" },
          ],
        },
      });
      this.agent("research", "completed", null, "Sample brief prepared");
      this.activity("Research brief prepared", "agent", "success");
      this.message(
        "Demo research brief: focus on Flutter mobile development, Next.js dashboards, and Python automation. A connected research agent will provide verified opportunities and sources. No web search was performed in this demo.",
        "jarvis",
        ["research.demo"],
      );
      this.notification(
        "Research completed",
        "Your sample research brief is available in Chat.",
      );
      this.state("speaking", "Your sample research brief is ready.");
      this.later(2000, () => {
        this.busy = false;
        this.state("idle", "Ready for your next request.");
      });
    });
  }
  private resolve(id: string, approved: boolean) {
    if (this.pendingConfirmation !== id) return false;
    this.pendingConfirmation = null;
    this.emit({ type: "confirmation.resolved", id });
    if (approved) {
      this.system = {
        ...this.system,
        applications: this.system.applications.map((a) =>
          a.id === "spotify" ? { ...a, status: "closed" } : a,
        ),
      };
      this.emit({ type: "system.updated", system: this.system });
    }
    if (this.currentTask)
      this.emit({
        type: "task.updated",
        task: {
          ...this.currentTask,
          status: approved ? "completed" : "cancelled",
          progress: approved ? 100 : 0,
          steps: [
            {
              title: approved
                ? "Action approved and simulated"
                : "Action declined",
              status: approved ? "completed" : "pending",
            },
          ],
        },
      });
    this.activity(
      approved
        ? "Spotify closed in the demo"
        : "Action declined — Spotify unchanged",
      "security",
      approved ? "success" : "info",
    );
    this.message(
      approved
        ? "Spotify is now closed in the simulation. Your actual applications are unchanged."
        : "Cancelled. Spotify was left unchanged.",
      "jarvis",
      ["confirmation.respond"],
    );
    this.notification(
      approved ? "Action confirmed" : "Action cancelled",
      approved ? "Spotify closed in the simulation." : "No changes were made.",
      "info",
    );
    this.busy = false;
    this.state("idle", "Ready for your next request.");
    return true;
  }
}

import type {
  Activity,
  Agent,
  MemoryEntry,
  Message,
  Notification,
  SystemContext,
  Task,
} from "../jarvis/types";

export const flutterTask: Task = {
  id: "flutter-demo",
  title: "Prepare Flutter environment",
  status: "scheduled",
  progress: 0,
  agent: "Environment Agent",
  startedAt: null,
  steps: [
    "Analyze requirements",
    "Verify Flutter SDK",
    "Verify Android SDK",
    "Configure environment",
    "Run verification",
  ].map((title) => ({ title, status: "pending" })),
};
export const mockTasks: Task[] = [
  flutterTask,
  {
    id: "research-demo",
    title: "Research freelance opportunities",
    status: "scheduled",
    progress: 0,
    agent: "Research Agent",
    startedAt: null,
    steps: [{ title: "Find relevant opportunities", status: "pending" }],
  },
  {
    id: "spotify-demo",
    title: "Open Spotify",
    status: "completed",
    progress: 100,
    agent: "System Agent",
    startedAt: "2026-09-30T20:38:00Z",
    steps: [{ title: "Launch application", status: "completed" }],
  },
  {
    id: "package-demo",
    title: "Install development package",
    status: "failed",
    progress: 35,
    agent: "Environment Agent",
    startedAt: "2026-09-30T20:30:00Z",
    steps: [
      { title: "Resolve dependencies", status: "completed" },
      { title: "Download package — registry unavailable", status: "failed" },
    ],
  },
];
export const mockAgents: Agent[] = [
  {
    id: "environment",
    name: "Environment Agent",
    description: "Prepares development environments and verifies dependencies.",
    status: "idle",
    task: null,
    lastEvent: "Ready for your next project",
    actions: 12,
  },
  {
    id: "research",
    name: "Research Agent",
    description: "Finds, compares and organizes information from the web.",
    status: "completed",
    task: "Daily technology brief",
    lastEvent: "Research summary completed",
    actions: 8,
  },
  {
    id: "verification",
    name: "Verification Agent",
    description: "Checks outcomes and validates completed operations.",
    status: "idle",
    task: null,
    lastEvent: "All checks passed",
    actions: 6,
  },
  {
    id: "memory",
    name: "Memory Agent",
    description:
      "Organizes relevant context, preferences and project knowledge.",
    status: "idle",
    task: null,
    lastEvent: "Context synchronized",
    actions: 4,
  },
];
export const mockSystem: SystemContext = {
  cpu: 24,
  ram: 61,
  ramTotal: 16,
  storage: 42,
  network: true,
  microphone: false,
  audio: true,
  window: "Visual Studio Code",
  version: "1.0.0-demo",
  latency: 12,
  applications: [
    { id: "vscode", name: "VS Code", detail: "jarvis_core", status: "active" },
    { id: "chrome", name: "Chrome", detail: "3 tabs open", status: "active" },
    {
      id: "terminal",
      name: "Terminal",
      detail: "Python · zsh",
      status: "active",
    },
    {
      id: "spotify",
      name: "Spotify",
      detail: "The less I know the better · Tame Impala",
      status: "playing",
    },
  ],
};
export const mockActivities: Activity[] = [
  {
    id: "a4",
    timestamp: "2026-09-30T20:42:00Z",
    type: "agent",
    message: "Workspace context synchronized",
    status: "success",
  },
  {
    id: "a3",
    timestamp: "2026-09-30T20:41:00Z",
    type: "system",
    message: "All systems are operational",
    status: "success",
  },
  {
    id: "a2",
    timestamp: "2026-09-30T20:40:00Z",
    type: "agent",
    message: "4 specialized agents initialized",
    status: "info",
  },
  {
    id: "a1",
    timestamp: "2026-09-30T20:39:00Z",
    type: "system",
    message: "JARVIS demo session started",
    status: "info",
  },
];
export const mockMessages: Message[] = [
  {
    id: "welcome",
    role: "jarvis",
    text: "Good evening, Fabrice. Your workspace is ready. I can walk you through a Flutter setup, a research task, or an action requiring your confirmation. All actions in this session are simulated.",
    timestamp: "2026-09-30T20:42:00Z",
    status: "sent",
    tools: [],
  },
];
export const mockNotifications: Notification[] = [
  {
    id: "welcome-note",
    title: "Your workspace is ready",
    message: "Demo session initialized. No action will affect your computer.",
    timestamp: "2026-09-30T20:42:00Z",
    read: false,
    kind: "info",
  },
];
export const mockMemories: MemoryEntry[] = [
  {
    id: "m1",
    category: "Preferences",
    title: "A workspace that feels like you",
    content:
      "Dark interfaces, minimal distractions, and concise answers. Your preferred development stack is Next.js, Flutter and NestJS.",
    updatedAt: "2026-09-30",
    tags: ["Appearance", "Development"],
  },
  {
    id: "m2",
    category: "Projects",
    title: "JARVIS personal assistant",
    content:
      "A local Python core with a separate desktop control interface. Current focus: real-time events, voice interaction and specialized agents.",
    updatedAt: "2026-09-30",
    tags: ["Python", "In progress"],
  },
  {
    id: "m3",
    category: "Preferences",
    title: "Your soundtrack",
    content:
      "Damso for your playlists. Instrumental and ambient music during focused development sessions.",
    updatedAt: "2026-09-29",
    tags: ["Music", "Focus"],
  },
  {
    id: "m4",
    category: "Habits",
    title: "Evening focus sessions",
    content:
      "Example routine: review active tasks, open the development workspace, and start a focus playlist.",
    updatedAt: "2026-09-28",
    tags: ["Routine"],
  },
  {
    id: "m5",
    category: "Facts",
    title: "Local-first architecture",
    content:
      "JARVIS executes actions through the Python Core. The interface displays events and requests confirmation for sensitive actions.",
    updatedAt: "2026-09-27",
    tags: ["Architecture"],
  },
  {
    id: "m6",
    category: "People",
    title: "Fabrice",
    content:
      "Demo profile. Developer working with web and mobile technologies. This is sample context, not information retrieved from the Core.",
    updatedAt: "2026-09-26",
    tags: ["Demo profile"],
  },
];
export const demoPrompts = [
  {
    label: "Prepare my workspace",
    command: "JARVIS, prépare-moi un environnement Flutter.",
  },
  { label: "Research a topic", command: "Research freelance opportunities" },
  { label: "Test a confirmation", command: "Close Spotify" },
];

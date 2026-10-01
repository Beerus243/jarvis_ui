# JARVIS — Desktop Interface v1.0

Independent desktop control interface for a Python personal assistant. Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui (Radix), Lucide, Motion and Zustand. **The default mode is a deterministic UI demonstration. It never executes system commands, records microphone audio, searches the web, or contacts a Python backend.**

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Node.js 22 is used for development and tests.

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

`npm run test:e2e` runs Chrome against an already running server. Defaults: `http://localhost:3000`, Chrome at `/opt/google/chrome/chrome`. Override `JARVIS_TEST_URL` and `CHROME_PATH` for your machine. Screenshots are saved in ignored `artifacts/`; failure traces in `test-results/`.

## Explore

- **Dashboard:** state-aware SVG orb, voice command simulation, task progress, activities, agent network, system and application context.
- **Conversation:** timestamped messages, delivery state and structured tool references.
- **Tasks:** status filters, search, step progress, scenario replay and active task cancellation.
- **Agents:** status, assignment, action counts and inspection dialogs.
- **Memory:** searchable, categorized demonstration library. No claim of real Core memory.
- **System:** telemetry, connection state, audio and application context, system event feed.
- **Settings:** persisted name, voice-button availability, reduced motion, sidebar density and notification preferences; privacy, security, automation and connection information.

Use **Prepare workspace** or the microphone button to run:

```text
listening (voice only) → thinking → executing (5 steps)
→ speaking (simulated) → idle
```

`Research freelance opportunities` runs a second deterministic scenario. `Close Spotify` opens a dedicated confirmation. Cancel leaves the simulated application unchanged; confirm closes it only within demo state. Unknown commands get an honest capabilities response. Only one demo scenario runs at a time. No synthetic speech is emitted.

The initial task list includes scheduled, completed and failed examples. Metrics, apps, seeded history, agent counts and music are demonstration data, not device telemetry. No actual media is played. Progress and event timestamps generated during a scenario are live within that simulation.

## Architecture

```text
MockCore (lib/mock/) or WebSocketGateway (lib/jarvis/)
                         │ validated typed events
                         ▼
                 Zustand JARVIS store
                         │ granular selectors
                         ▼
   Orb / activities / tasks / agents / system / messages / confirmations
```

- `app/`: server route components, metadata and shared root layout.
- `components/layout/`: shell, navigation, header and page headings.
- `components/jarvis/`: isolated live views and interaction controls.
- `components/pages/`: page-specific interactive composition.
- `components/ui/`: shadcn/ui primitives and shared presentation components.
- `lib/jarvis/types.ts`: centralized domain types, backed by runtime schemas.
- `lib/jarvis/events.ts`: validated discriminated event union.
- `lib/jarvis/gateway.ts`: reconnecting WebSocket adapter, no business execution.
- `lib/jarvis/gateway-provider.tsx`: adapter lifecycle and command dispatch.
- `lib/mock/`: sample data and deterministic scenario adapter, dynamically loaded only in demo mode.
- `lib/store/`: event state and independent persisted UI preferences.
- `tests/`: event validation, mock lifecycle, safety flow and browser integration checks.

Activities are capped at 150, messages at 200, tasks at 100, notifications at 50. Each display subscribes to the data it needs. Motion respects the OS preference and the in-app override. Dialogs use Radix focus management and keyboard handling; Ctrl/Cmd+K focuses the command input. All routes support smaller viewports; navigation collapses automatically below 1020px.

## Connect a future Python Core

```dotenv
NEXT_PUBLIC_JARVIS_MODE=websocket
NEXT_PUBLIC_JARVIS_WS_URL=ws://localhost:8765/ws
```

Restart the dev server (or rebuild production) after changing `NEXT_PUBLIC_*` variables. The URL is public browser configuration: never include secrets. Use `wss://` when serving the UI over HTTPS.

**This is a proposed version-1 UI event contract, not an assertion that the existing Python Core already implements it.** The backend must implement or adapt to it. Configure connection authentication, allowed origins and permissions on the real Core before deploying beyond a trusted local environment. UI confirmations are presentation; backend authorization and idempotency remain Core responsibilities.

On each successful connection, the UI sends:

```json
{ "type": "session.subscribe", "protocolVersion": 1 }
```

The Core should respond with its current state and entity snapshots using the same event forms as updates, then stream subsequent updates. A socket being open does not imply JARVIS is ready: readiness is supplied by `state.changed`. Reconnection uses exponential backoff from 1 second to 30 seconds. Commands are **never queued or replayed** after a disconnect. Incoming strings are size-limited to 1 MB, JSON parsed and validated with Zod before reaching the store; malformed events are ignored with a visible notification.

### Core → UI events

| Type                    | Payload                                                       |
| ----------------------- | ------------------------------------------------------------- |
| `state.changed`         | `state: JarvisState`, optional `detail: string`               |
| `activity.created`      | `activity: Activity`                                          |
| `task.updated`          | `task: Task` (full entity, upsert by ID)                      |
| `agent.updated`         | `agent: Agent` (full entity, upsert by ID)                    |
| `system.updated`        | `system: SystemContext` (full snapshot)                       |
| `message.updated`       | `message: Message` (upsert by ID for streamed content/status) |
| `transcription.updated` | `text: string`, `level: number` between 0 and 1               |
| `confirmation.required` | `confirmation: Confirmation` (unique request ID)              |
| `confirmation.resolved` | `id: string`                                                  |
| `notification.created`  | `notification: Notification`                                  |

Complete payload schemas are in `lib/jarvis/types.ts`. Example:

```json
{
  "type": "state.changed",
  "state": "executing",
  "detail": "Verifying Flutter SDK…"
}
```

```json
{
  "type": "confirmation.required",
  "confirmation": {
    "id": "request-42",
    "title": "Close Spotify?",
    "description": "Playback will stop.",
    "target": "Spotify",
    "taskId": "task-42"
  }
}
```

The eight states are `idle`, `listening`, `thinking`, `speaking`, `executing`, `waiting_confirmation`, `error`, and `offline`. For multiple confirmations the UI shows the first pending request. The Core should send `confirmation.resolved`, resulting entity updates, and the next `state.changed` after responding to an approval or cancellation.

### UI → Core commands

```ts
{ type: "command.send", text: string }
{ type: "voice.start" }
{ type: "voice.stop" }
{ type: "task.cancel", id: string }
{ type: "confirmation.respond", id: string, approved: boolean }
```

Voice commands request recording from the **Core**, not from this browser. Send transcription/audio-level events for live visualization. Task progress, actual tools, security decisions and action execution belong to Python. Transport delivery is not proof that an action succeeded: result messages/events must come from the Core.

## Persistence and current boundaries

Only UI preferences are saved to localStorage (`jarvis-ui-preferences`). Tasks, conversations, notifications and approvals are session state and reset on a full reload. Core memory, durable history, settings synchronization, real scheduler management, authentication, actual speech/media playback and real device control are outside this UI V1. In WebSocket mode no mock tasks, telemetry, messages or memory are injected.
# jarvis_ui

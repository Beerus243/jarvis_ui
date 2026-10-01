# JARVIS — Desktop Interface v1.0

Independent desktop control interface for a Python personal assistant. Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui (Radix), Lucide, Motion and Zustand. **The default mode connects to the local Python JARVIS service over WebSocket. Commands execute through the existing Core and its action policies.** Set `NEXT_PUBLIC_JARVIS_MODE=mock` explicitly for a deterministic demonstration.

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
npm run test:live # local Python service + UI required; sends "liste mes tâches"
npm test
npm run build
npm start
```

`npm run test:e2e` runs Chrome against an already running server. Defaults: `http://localhost:3000`, Chrome at `/opt/google/chrome/chrome`. Override `JARVIS_TEST_URL` and `CHROME_PATH` for your machine. Screenshots are saved in ignored `artifacts/`; failure traces in `test-results/`.

## Explore

- **Dashboard:** state-aware SVG orb, Core microphone control, task progress, activities, agent network, system and application context.
- **Conversation:** timestamped messages, delivery state and structured tool references.
- **Tasks:** status filters, search, step progress, scenario replay and active task cancellation.
- **Agents:** status, assignment, action counts and inspection dialogs.
- **Memory:** searchable, categorized demonstration library. No claim of real Core memory.
- **System:** telemetry, connection state, audio and application context, system event feed.
- **Settings:** persisted name, voice-button availability, reduced motion, sidebar density and notification preferences; privacy, security, automation and connection information.

In explicit **mock mode**, use the microphone button to run:

```text
listening (voice only) → thinking → executing (5 steps)
→ speaking (simulated) → idle
```

`Research freelance opportunities` runs a second deterministic scenario. `Close Spotify` opens a dedicated confirmation. Cancel leaves the simulated application unchanged; confirm closes it only within demo state. Unknown commands get an honest capabilities response. Only one demo scenario runs at a time. No synthetic speech is emitted.

In mock mode, the initial task list includes scheduled, completed and failed examples. Metrics, apps, seeded history, agent counts and music are demonstration data, not device telemetry. No actual media is played. Progress and event timestamps generated during a scenario are live within that simulation.

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

## Connect the Python Core

```dotenv
NEXT_PUBLIC_JARVIS_MODE=websocket
NEXT_PUBLIC_JARVIS_WS_URL=ws://localhost:8765/ws
```

Restart the dev server (or rebuild production) after changing `NEXT_PUBLIC_*` variables. The URL is public browser configuration: never include secrets. Use `wss://` when serving the UI over HTTPS.

The sibling project `../jarvis/core/ui_bridge/` implements this protocol inside the existing Python process. No second brain or simulated bridge is needed.

```bash
# Existing background service includes the bridge and microphone.
systemctl --user restart jarvis.service
systemctl --user status jarvis.service

# Alternative: foreground Core without a microphone (stop the service first).
cd ../jarvis
systemctl --user stop jarvis.service
.venv-kokoro-cuda/bin/python main.py --ui-only
```

`--ui` also enables the bridge with `--text` or foreground voice mode; `--no-ui` disables it. The former `ws_bridge_server.py` now launches the real Core in `--ui-only` mode. The Core application lock prevents competing instances. The dependency `websockets>=15,<16` is included in both requirements files.

The bridge binds to `127.0.0.1:8765` and accepts browser origins `http://localhost:3000` and `http://127.0.0.1:3000`. Set `JARVIS_UI_PORT` and `JARVIS_UI_ORIGINS` in the Python process environment for another local port/origin. It is a local desktop connection, without remote authentication.

Open `/chat` or use the home command field and send `liste mes tâches` to verify the link without changing applications. System telemetry displays `V7.7 · Python Core` and actual local CPU, RAM, storage and application observations. Unavailable measurements remain unknown.

The home microphone button requests listening from the existing Python audio loop. Stopping a capture discards that utterance; it does not stop JARVIS. The microphone remains disabled until the Python pipeline is ready. Wake-word activation and existing STT/TTS stay in Python (the existing Google transcription needs Internet). If the service is stopped, the home button can start it through the existing local Next.js service route.

On each successful connection, the UI sends:

```json
{ "type": "session.subscribe", "protocolVersion": 1 }
```

The Core responds with `session.reset`, `session.capabilities`, recent in-process messages and current entities, then streams subsequent updates. Persisted tasks and pending approvals are refreshed from the Core; a reset clears obsolete browser state. A socket being open does not imply JARVIS is ready: readiness is supplied by `state.changed`. Reconnection uses exponential backoff from 1 second to 30 seconds. Commands are **never queued or replayed** after a disconnect. Incoming strings are size-limited to 1 MB, JSON parsed and validated with Zod before reaching the store; malformed events are ignored with a visible notification.

### Core → UI events

| Type                    | Payload                                                       |
| ----------------------- | ------------------------------------------------------------- |
| `session.reset`         | No payload; clear stale browser entities and approvals        |
| `session.capabilities`  | `voice: boolean`; real microphone pipeline availability       |
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

Only UI preferences are saved to localStorage (`jarvis-ui-preferences`). Python owns persisted tasks, action approval expiry and device control. The bridge retains up to 200 recent message/activity events in process memory and restores them on reconnect; earlier conversation history is not imported into the UI. Task cancellation can stop subsequent steps, but a step already executing may finish. Commands are serialized through the shared Python command entry point; approvals are bound to the exact current ID and cannot be reused.

The Memory page and Settings preferences are not synchronized with Python memory/configuration. The Agents page reports the real Core task worker rather than the demonstration agents. In WebSocket mode no mock tasks, telemetry, messages or memory are injected.

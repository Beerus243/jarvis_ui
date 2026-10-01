import { jarvisEventSchema, type EventListener } from "./events";
import type { ConnectionStatus, CoreCommand, JarvisGateway } from "./types";

/** Protocol v1 implemented by jarvis/core/ui_bridge inside the Python service. */
export class WebSocketGateway implements JarvisGateway {
  private socket: WebSocket | null = null;
  private retry: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;
  private attempts = 0;
  constructor(
    private url: string,
    private emit: EventListener,
    private connection: (status: ConnectionStatus) => void,
  ) {}
  connect() {
    this.disposed = false;
    if (this.socket && this.socket.readyState < WebSocket.CLOSING) return;
    this.connection("connecting");
    try {
      const url = new URL(this.url);
      if (!["ws:", "wss:"].includes(url.protocol))
        throw new Error("Invalid WebSocket protocol");
      const socket = new WebSocket(url);
      this.socket = socket;
      socket.onopen = () => {
        if (this.disposed) return;
        this.attempts = 0;
        this.connection("connected");
        socket.send(
          JSON.stringify({ type: "session.subscribe", protocolVersion: 1 }),
        );
      };
      socket.onmessage = (event) => {
        if (typeof event.data !== "string" || event.data.length > 1_000_000)
          return;
        try {
          const parsed = jarvisEventSchema.safeParse(JSON.parse(event.data));
          if (parsed.success) this.emit(parsed.data);
          else this.protocolError();
        } catch {
          this.protocolError();
        }
      };
      socket.onerror = () => socket.close();
      socket.onclose = () => {
        if (this.disposed) return;
        this.connection("disconnected");
        if (this.attempts === 0)
          this.emit({
            type: "notification.created",
            notification: {
              id: "connection-lost",
              title: "Core unavailable",
              message: "Reconnecting automatically. Commands are not queued.",
              timestamp: new Date().toISOString(),
              kind: "warning",
              read: false,
            },
          });
        this.retry = setTimeout(
          () => this.connect(),
          Math.min(1000 * 2 ** this.attempts++, 30000),
        );
      };
    } catch {
      this.connection("disconnected");
      this.emit({
        type: "state.changed",
        state: "error",
        detail:
          "Invalid Core WebSocket URL. Check your connection configuration.",
      });
    }
  }
  private protocolError() {
    this.emit({
      type: "notification.created",
      notification: {
        id: "protocol-error",
        title: "Unsupported Core event",
        message: "An invalid event was ignored. Check protocol compatibility.",
        timestamp: new Date().toISOString(),
        kind: "warning",
        read: false,
      },
    });
  }
  disconnect() {
    this.disposed = true;
    if (this.retry) clearTimeout(this.retry);
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.onmessage = null;
      this.socket.onopen = null;
      this.socket.onerror = null;
      this.socket.close();
      this.socket = null;
    }
    this.connection("disconnected");
  }
  send(command: CoreCommand) {
    if (this.socket?.readyState !== WebSocket.OPEN) return false;
    try {
      this.socket.send(JSON.stringify(command));
      return true;
    } catch {
      return false;
    }
  }
}

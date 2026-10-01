"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { MotionConfig } from "motion/react";
import { WebSocketGateway } from "./gateway";
import type { CoreCommand, JarvisGateway } from "./types";
import { isMockMode, useJarvisStore } from "../store/jarvis-store";
import { useSettingsStore } from "../store/settings-store";
const GatewayContext = createContext<(command: CoreCommand) => boolean>(
  () => false,
);
export function GatewayProvider({ children }: { children: React.ReactNode }) {
  const gateway = useRef<JarvisGateway | null>(null);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  useEffect(() => {
    void useSettingsStore.persist.rehydrate();
    let disposed = false;
    const { applyEvent, setConnection } = useJarvisStore.getState();
    async function connect() {
      if (isMockMode) {
        const { MockCore } = await import("../mock/mock-core");
        if (disposed) return;
        gateway.current = new MockCore(applyEvent, setConnection);
      } else
        gateway.current = new WebSocketGateway(
          process.env.NEXT_PUBLIC_JARVIS_WS_URL ?? "ws://localhost:8765/ws",
          applyEvent,
          setConnection,
        );
      gateway.current.connect();
    }
    void connect();
    return () => {
      disposed = true;
      gateway.current?.disconnect();
      gateway.current = null;
    };
  }, []);
  const send = useCallback((command: CoreCommand) => {
    const accepted = gateway.current?.send(command) ?? false;
    if (!accepted)
      useJarvisStore.getState().applyEvent({
        type: "notification.created",
        notification: {
          id: crypto.randomUUID(),
          title: "Command not sent",
          message:
            "Check the Core connection, or wait for the current action to finish.",
          timestamp: new Date().toISOString(),
          read: false,
          kind: "warning",
        },
      });
    return accepted;
  }, []);
  return (
    <GatewayContext.Provider value={send}>
      <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
        <div className={reducedMotion ? "reduce-motion app-root" : "app-root"}>
          {children}
        </div>
      </MotionConfig>
    </GatewayContext.Provider>
  );
}
export function useGateway() {
  return useContext(GatewayContext);
}

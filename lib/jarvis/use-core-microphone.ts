"use client";

import { useCallback, useEffect, useState } from "react";

export type CoreMicrophoneStatus =
  | "checking"
  | "active"
  | "inactive"
  | "activating"
  | "deactivating"
  | "failed"
  | "unavailable";

interface ServiceResponse {
  status?: string;
  error?: string;
}

function normalizeStatus(status: string | undefined): CoreMicrophoneStatus {
  switch (status) {
    case "active":
    case "inactive":
    case "activating":
    case "deactivating":
    case "failed":
      return status;
    default:
      return "unavailable";
  }
}

async function readStatus() {
  const response = await fetch("/api/core/microphone", { cache: "no-store" });
  const payload = (await response.json()) as ServiceResponse;
  if (!response.ok) throw new Error(payload.error ?? "Core status unavailable.");
  return normalizeStatus(payload.status);
}

export function useCoreMicrophone() {
  const [status, setStatus] = useState<CoreMicrophoneStatus>("checking");
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let disposed = false;
    let timer: number | undefined;

    const refresh = async () => {
      try {
        const currentStatus = await readStatus();
        if (disposed) return;
        setStatus(currentStatus);
        setError(null);
        if (currentStatus === "activating" || currentStatus === "deactivating")
          timer = window.setTimeout(refresh, 500);
      } catch (cause) {
        if (!disposed) {
          setStatus("unavailable");
          setError(cause instanceof Error ? cause.message : "Core unavailable.");
        }
      }
    };

    timer = window.setTimeout(refresh, 0);
    return () => {
      disposed = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [refreshKey]);

  const toggle = useCallback(async () => {
    if (!["active", "inactive", "failed"].includes(status)) return;
    const action = status === "active" ? "stop" : "start";
    setStatus(action === "start" ? "activating" : "deactivating");
    setError(null);

    try {
      const response = await fetch("/api/core/microphone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = (await response.json()) as ServiceResponse;
      if (!response.ok) throw new Error(payload.error ?? "Core control failed.");
      setStatus(normalizeStatus(payload.status));
      setRefreshKey((key) => key + 1);
    } catch (cause) {
      setStatus("unavailable");
      setError(cause instanceof Error ? cause.message : "Core control failed.");
    }
  }, [status]);

  return { status, error, toggle };
}

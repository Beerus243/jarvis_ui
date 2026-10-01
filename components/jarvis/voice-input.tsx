"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, AudioLines, Command, Mic, Square } from "lucide-react";
import { useGateway } from "@/lib/jarvis/gateway-provider";
import { isMockMode, useJarvisStore } from "@/lib/store/jarvis-store";
import { useSettingsStore } from "@/lib/store/settings-store";
export function VoiceInput({ compact = false }: { compact?: boolean }) {
  const send = useGateway();
  const state = useJarvisStore((s) => s.state);
  const connection = useJarvisStore((s) => s.connection);
  const transcription = useJarvisStore((s) => s.transcription);
  const voiceAvailable = useJarvisStore((s) => s.voiceAvailable);
  const voiceEnabled = useSettingsStore((s) => s.voiceEnabled);
  const [text, setText] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const listening = state === "listening";
  const busy = !["idle", "error"].includes(state);
  const disabled = connection !== "connected";
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim() && send({ type: "command.send", text })) setText("");
  }
  return (
    <div className={`voice-input-wrapper ${compact ? "voice-compact" : ""}`}>
      <form
        onSubmit={submit}
        className={`command-input ${listening ? "command-listening" : ""}`}
      >
        <AudioLines size={20} className="command-wave" />
        <input
          ref={input}
          aria-label="Command for JARVIS"
          placeholder={
            listening
              ? transcription || "Listening…"
              : "Ask JARVIS anything, or give a command…"
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          disabled={disabled || busy}
        />
        <kbd className="command-shortcut">
          <Command size={11} /> K
        </kbd>
        <span className="input-divider" />
        <button
          type="button"
          className={`icon-button mic-button ${listening ? "mic-active" : ""}`}
          onClick={() =>
            send({ type: listening ? "voice.stop" : "voice.start" })
          }
          disabled={
            disabled ||
            (!isMockMode && !voiceAvailable) ||
            !voiceEnabled ||
            (busy && !listening)
          }
          aria-label={
            listening
              ? "Stop listening"
              : isMockMode
                ? "Start simulated voice command"
                : "Start Core microphone"
          }
          title={
            isMockMode
              ? "Simulate a voice command (no microphone recording)"
              : voiceAvailable
                ? "Ask the Core to start listening"
                : "Python microphone unavailable or starting"
          }
        >
          {listening ? <Square size={16} /> : <Mic size={18} />}
        </button>
        <button
          className="send-button"
          type="submit"
          aria-label="Send command"
          disabled={!text.trim() || disabled || busy}
        >
          <ArrowUp size={18} />
        </button>
      </form>
      {!compact && (
        <div className="command-hint">
          <span>
            {isMockMode ? "DEMO VOICE" : "CORE VOICE"}
            <span className="hint-dot">·</span>
            {listening
              ? isMockMode
                ? "Transcribing sample command"
                : "Listening on the Python microphone"
              : "Your next action starts here"}
          </span>
          <span>
            Press <kbd>↵</kbd> to send
          </span>
        </div>
      )}
      {transcription && (
        <p className="transcription" aria-live="polite">
          <span>YOU</span>“{transcription}”
        </p>
      )}
    </div>
  );
}

"use client";
import { useEffect, useRef } from "react";
import { ArrowUpRight, Braces, MessageSquare, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useJarvisStore, isMockMode } from "@/lib/store/jarvis-store";
import { useSettingsStore } from "@/lib/store/settings-store";
import { timeLabel } from "@/lib/utils";
import { VoiceInput } from "@/components/jarvis/voice-input";
import { PageHeading } from "@/components/layout/page-heading";
import { Logo } from "@/components/layout/logo";
import { ActivityFeed } from "@/components/jarvis/activity-feed";
export function ChatPage() {
  const messages = useJarvisStore((s) => s.messages);
  const state = useJarvisStore((s) => s.state);
  const name = useSettingsStore((s) => s.name);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);
  return (
    <div className="page-container">
      <PageHeading
        eyebrow="A CONTINUOUS CONVERSATION"
        title="Conversation"
        description="The context behind every command. The outcome of every action."
      />
      <div className="chat-layout">
        <section className="chat-panel panel">
          <div className="chat-panel-top">
            <span>
              <MessageSquare size={15} />
              Current session
            </span>
            <span className="muted-text">
              {isMockMode ? "DEMO CONVERSATION" : "CORE CONVERSATION"}
            </span>
          </div>
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty">
                <Logo />
                <h2>A thought. A command. A conversation.</h2>
                <p>
                  Your conversation will appear here when you interact with
                  JARVIS.
                </p>
              </div>
            )}
            {messages.map((message) => (
              <article
                key={message.id}
                className={`chat-message message-${message.role}`}
              >
                <div className="message-avatar">
                  {message.role === "jarvis" ? (
                    <Logo small />
                  ) : (
                    name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="message-body">
                  <div className="message-heading">
                    <strong>
                      {message.role === "jarvis" ? "JARVIS" : "YOU"}
                    </strong>
                    <time>{timeLabel(message.timestamp)}</time>
                    <span
                      className={`message-delivery ${message.status === "failed" ? "danger-text" : ""}`}
                    >
                      {message.status}
                    </span>
                  </div>
                  <p>{message.text}</p>
                  {message.tools.length > 0 && (
                    <div className="tool-calls">
                      {message.tools.map((tool) => (
                        <span key={tool}>
                          <Braces size={12} />
                          {tool}
                        </span>
                      ))}
                      <Link href="/tasks">
                        View tasks
                        <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  )}
                </div>
              </article>
            ))}
            {state === "thinking" && (
              <div className="thinking-message">
                <span className="status-dot" />
                JARVIS is analyzing your request…
              </div>
            )}
            <div ref={end} />
          </div>
          <div className="chat-composer">
            <VoiceInput compact />
            <p>
              <ShieldCheck size={12} />
              {isMockMode
                ? "Simulated responses. No actions affect your device."
                : "Sensitive actions require your confirmation."}
            </p>
          </div>
        </section>
        <aside className="chat-aside">
          <ActivityFeed expanded />
          <div className="context-note">
            <ShieldCheck size={17} />
            <div>
              <strong>More than a conversation</strong>
              <p>
                Commands, tools and task outcomes remain connected in one
                workspace.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { ArrowUpRight, MessageSquare } from "lucide-react";
import { useJarvisStore } from "@/lib/store/jarvis-store";
export function LatestExchange() {
  const messages = useJarvisStore((s) => s.messages);
  const userIndex = messages.findLastIndex(
    (message) => message.role === "user",
  );
  if (userIndex < 0) return null;
  const user = messages[userIndex];
  const response = messages
    .slice(userIndex + 1)
    .findLast((message) => message.role === "jarvis");
  return (
    <details className="latest-exchange">
      <summary>
        <MessageSquare size={12} />
        <span>Last command</span>
        <strong>{user.text}</strong>
      </summary>
      <div>
        <span>JARVIS</span>
        <p>{response?.text ?? "Your request is being processed…"}</p>
        <Link href="/chat">
          Open conversation
          <ArrowUpRight size={12} />
        </Link>
      </div>
    </details>
  );
}

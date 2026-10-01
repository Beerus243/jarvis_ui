import type { Metadata } from "next";
import { ChatPage } from "@/components/pages/chat-page";
export const metadata: Metadata = { title: "Conversation" };
export default function Page() {
  return <ChatPage />;
}

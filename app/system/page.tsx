import type { Metadata } from "next";
import { SystemPage } from "@/components/pages/system-page";
export const metadata: Metadata = { title: "System" };
export default function Page() {
  return <SystemPage />;
}

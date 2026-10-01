import Link from "next/link";
import { Radar } from "lucide-react";
export default function NotFound() {
  return (
    <div className="empty-page">
      <Radar size={40} />
      <h1 className="mt-6 text-2xl">Outside the workspace.</h1>
      <p className="my-4">This page could not be found.</p>
      <Link href="/" className="text-button accent-text">
        Return to the dashboard →
      </Link>
    </div>
  );
}

"use client";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-page">
      <AlertCircle size={36} />
      <h2>This view could not be loaded.</h2>
      <p className="mb-6">
        Your workspace is still here. Try loading the page again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

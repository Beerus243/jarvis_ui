"use client";
import { useState } from "react";
import type { Confirmation } from "@/lib/jarvis/types";
import { ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useJarvisStore } from "@/lib/store/jarvis-store";
import { useGateway } from "@/lib/jarvis/gateway-provider";
export function ConfirmationDialog() {
  const confirmation = useJarvisStore((s) => s.confirmations[0]);
  const connected = useJarvisStore((s) => s.connection === "connected");
  const send = useGateway();
  const [submittedConfirmation, setSubmittedConfirmation] =
    useState<Confirmation | null>(null);
  const submitted = !!confirmation && confirmation === submittedConfirmation;
  const respond = (approved: boolean) => {
    if (
      confirmation &&
      !submitted &&
      connected &&
      send({ type: "confirmation.respond", id: confirmation.id, approved })
    )
      setSubmittedConfirmation(confirmation);
  };
  return (
    <Dialog
      open={!!confirmation}
      onOpenChange={(open) => {
        if (!open && connected) respond(false);
      }}
    >
      <DialogContent
        className="confirmation-dialog"
        showCloseButton={false}
        onEscapeKeyDown={(e) => {
          if (submitted || !connected) e.preventDefault();
        }}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="confirmation-icon">
          <ShieldAlert size={25} />
        </div>
        <DialogHeader>
          <span className="eyebrow warning-text">
            YOUR APPROVAL IS REQUIRED
          </span>
          <DialogTitle>{confirmation?.title}</DialogTitle>
          <DialogDescription>{confirmation?.description}</DialogDescription>
        </DialogHeader>
        <div className="confirmation-target">
          <span>APPLICATION</span>
          <strong>{confirmation?.target}</strong>
        </div>
        {!connected && (
          <p className="warning-text">Reconnect to the Core to respond.</p>
        )}
        {submitted && (
          <p className="muted-text">
            Waiting for the Core to acknowledge your decision…
          </p>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => respond(false)}
            disabled={!connected || submitted}
          >
            Cancel action
          </Button>
          <Button
            onClick={() => respond(true)}
            disabled={!connected || submitted}
          >
            Confirm action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

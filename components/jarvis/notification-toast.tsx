"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Info, X } from "lucide-react";
import { useJarvisStore } from "@/lib/store/jarvis-store";
import { useSettingsStore } from "@/lib/store/settings-store";
import type { Notification } from "@/lib/jarvis/types";
export function NotificationToast() {
  const notificationId = useJarvisStore((s) => s.notifications[0]?.id);
  const enabled = useSettingsStore((s) => s.notifications);
  const [visible, setVisible] = useState<Notification | null>(null);
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (!enabled) {
      const clear = setTimeout(() => setVisible(null), 0);
      return () => clearTimeout(clear);
    }
    const notification = useJarvisStore.getState().notifications[0];
    if (!notification || notification.id === last.current) return;
    last.current = notification.id;
    if (notification.id === "welcome-note" || !enabled) return;
    const show = setTimeout(() => setVisible(notification), 0);
    const timer = setTimeout(() => setVisible(null), 5500);
    return () => {
      clearTimeout(show);
      clearTimeout(timer);
    };
  }, [notificationId, enabled]);
  return (
    <div className="toast-region" aria-live="polite">
      <AnimatePresence>
        {visible && enabled && (
          <motion.div
            className="notification-toast"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {visible.kind === "success" ? (
              <CheckCircle2 size={20} className="accent-text" />
            ) : (
              <Info size={20} />
            )}
            <div>
              <strong>{visible.title}</strong>
              <p>{visible.message}</p>
            </div>
            <button
              className="icon-button"
              aria-label="Dismiss notification"
              onClick={() => setVisible(null)}
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

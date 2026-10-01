import { create } from "zustand";
import { persist } from "zustand/middleware";
interface Settings {
  name: string;
  reducedMotion: boolean;
  compact: boolean;
  notifications: boolean;
  voiceEnabled: boolean;
  set: (
    values: Partial<
      Pick<
        Settings,
        "name" | "reducedMotion" | "compact" | "notifications" | "voiceEnabled"
      >
    >,
  ) => void;
}
export const useSettingsStore = create<Settings>()(
  persist(
    (set) => ({
      name: "Fabrice",
      reducedMotion: false,
      compact: false,
      notifications: true,
      voiceEnabled: true,
      set: (values) => set(values),
    }),
    { name: "jarvis-ui-preferences", skipHydration: true },
  ),
);

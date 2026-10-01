import { GatewayProvider } from "@/lib/jarvis/gateway-provider";
import { Topbar } from "./topbar";
import { ConfirmationDialog } from "@/components/jarvis/confirmation-dialog";
import { NotificationToast } from "@/components/jarvis/notification-toast";
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <GatewayProvider>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="app-shell">
        <div className="workspace">
          <Topbar />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <footer className="workspace-footer">
            <span>
              <span className="status-dot" />
              JARVIS PERSONAL INTELLIGENCE
            </span>
            <span>
              Designed to work with you.
              <span className="footer-separator">/</span>UI v1.0
            </span>
          </footer>
        </div>
      </div>
      <ConfirmationDialog />
      <NotificationToast />
    </GatewayProvider>
  );
}

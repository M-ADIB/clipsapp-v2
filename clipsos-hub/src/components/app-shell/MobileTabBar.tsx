/**
 * MobileTabBar — Bottom navigation for client role on mobile.
 *
 * Matches Figma spec: Home | My Videos | Chat | Analytics
 * Fixed to bottom, 56px height, only visible on mobile for client role.
 */
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Video, MessageSquare, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CLIENT_TABS = [
  { label: "Home", icon: Home, to: "/client" },
  { label: "My Videos", icon: Video, to: "/client/videos" },
  { label: "Chat", icon: MessageSquare, to: "/client/chat" },
  { label: "Analytics", icon: BarChart3, to: "/client/queue" },
] as const;

export function MobileTabBar() {
  const { role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Only show for client role
  if (role !== "client") return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-around border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {CLIENT_TABS.map((tab) => {
        const isActive =
          tab.to === "/client"
            ? location.pathname === "/client"
            : location.pathname.startsWith(tab.to);
        const Icon = tab.icon;

        return (
          <button
            key={tab.to}
            onClick={() => navigate({ to: tab.to })}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 transition-colors ${
              isActive ? "text-foreground-strong" : "text-foreground-disabled"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

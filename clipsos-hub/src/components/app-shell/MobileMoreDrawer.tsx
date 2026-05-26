/**
 * MobileMoreDrawer — Bottom sheet showing nav items not in the bottom bar.
 *
 * Opens as a shadcn Sheet from the bottom. Items are displayed in a
 * 2-column grid grouped by sidebar section.
 */
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { NavSection } from "./nav-config";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

interface MobileMoreDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: NavSection[];
}

export function MobileMoreDrawer({ open, onOpenChange, sections }: MobileMoreDrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  function handleNav(to: string) {
    navigate({ to });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[70vh] flex flex-col rounded-t-2xl border-t border-border bg-background px-4 pb-6 pt-4"
      >
        <SheetHeader className="mb-2">
          <SheetTitle className="text-sm font-semibold text-foreground">More</SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto min-h-0">
          {sections.map((section) => (
            <div key={section.label}>
              {/* Section label */}
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-foreground-disabled">
                {section.label}
              </span>

              {/* 2-column grid */}
              <div className="grid grid-cols-2 gap-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.to === location.pathname ||
                    (item.to !== "/" && location.pathname.startsWith(item.to + "/"));

                  return (
                    <button
                      key={item.to}
                      onClick={() => handleNav(item.to)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors cursor-pointer ${
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "text-foreground-muted hover:bg-surface-raised"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="truncate text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-border pt-4 shrink-0">
          <button
            onClick={() => {
              auth.signOut();
              onOpenChange(false);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500 transition-colors active:bg-red-500/20 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

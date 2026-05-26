/**
 * TemplatesListPage — list/manage project type templates.
 * Route: /owner/templates
 */

import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import { useProjectTypeTemplates } from "@/hooks/data";
import { useDeleteTemplate } from "@/hooks/use-template-builder";
import type { TemplateConfig } from "@/lib/templateBuilder";
import { toast } from "sonner";

export function TemplatesListPage() {
  const navigate = useNavigate();
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const { data: templates, isLoading } = useProjectTypeTemplates();
  const deleteTemplate = useDeleteTemplate();

  useEffect(() => {
    setHeaderConfig({ title: "Templates" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteTemplate.mutateAsync(id);
      toast.success("Template deleted");
    } catch {
      toast.error("Failed to delete template");
    }
  };

  return (
    <FullBleed>
      {/* ── Toolbar ─────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 md:px-6">
        <p className="text-xs text-foreground-muted">
          Reusable offer configurations for your projects.
        </p>
        <Button
          size="sm"
          onClick={() => navigate({ to: "/owner/templates/new" })}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          New Template
        </Button>
      </div>

      {/* ── Body ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-4 py-6 md:px-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : !templates || templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Layers className="mb-4 h-12 w-12 text-foreground-muted/30" />
              <h3 className="text-sm font-semibold text-foreground mb-1">No templates yet</h3>
              <p className="text-xs text-foreground-muted mb-4 max-w-sm">
                Create a template to define reusable project configurations with pricing, scope,
                modules, and workflow steps.
              </p>
              <Button
                size="sm"
                onClick={() => navigate({ to: "/owner/templates/new" })}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Create First Template
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => {
                const cfg = t.config as unknown as TemplateConfig | null;
                return (
                  <div
                    key={t.id}
                    className="group flex items-center gap-4 rounded-xl border border-white/[0.08] px-5 py-4 transition-colors hover:bg-surface-raised"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-lg">
                      {t.icon || "📋"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {t.display_name}
                      </p>
                      <p className="text-xs text-foreground-muted truncate mt-0.5">
                        {cfg?.tagline || t.description || "No description"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {cfg?.billing_type && (
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {cfg.billing_type.replace("_", "-")}
                        </Badge>
                      )}
                      {cfg?.service_depth && (
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {cfg.service_depth.replace("_", " ")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          navigate({
                            to: "/owner/templates/$templateSlug",
                            params: { templateSlug: t.slug },
                          })
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-muted hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id, t.display_name)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </FullBleed>
  );
}

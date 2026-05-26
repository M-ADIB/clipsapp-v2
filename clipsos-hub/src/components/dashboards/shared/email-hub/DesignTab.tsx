/**
 * DesignTab — edit the global master template wrapper that all emails inherit.
 *
 * Allows owners/managers to control:
 *  - Logo URL
 *  - Accent color (used for CTA buttons)
 *  - Footer text/HTML
 *  - The full wrapper HTML (advanced, collapsed by default)
 *
 * Shows a live preview with sample content injected into the wrapper.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Eye, Loader2, Palette, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useMasterTemplate,
  useUpdateMasterTemplate,
  type MasterTemplateRow,
} from "@/hooks/use-master-template";
import { applyMasterWrapper, buildVisualContent } from "@/lib/email/renderTemplate";

/** Sample content used in the live preview */
const SAMPLE_TEMPLATE = {
  edit_mode: "visual" as const,
  subject: "Welcome to ClipsOS",
  headline: "Welcome aboard, Adib 👋",
  body: "Your workspace is ready. Dive in and start creating amazing content with your team.",
  cta_text: "Open Dashboard",
  cta_url: "https://clips-appv2.lovable.app",
  preview_text: null,
  body_html: "",
};

export function DesignTab() {
  const { data: master, isLoading } = useMasterTemplate();
  const updateMutation = useUpdateMasterTemplate();

  const [draft, setDraft] = useState<MasterTemplateRow | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync draft when master loads
  useEffect(() => {
    if (master && !draft) {
      setDraft(master);
    }
  }, [master, draft]);

  // Recompute preview
  const previewHtml = (() => {
    if (!draft) return "";
    const contentHtml = buildVisualContent(SAMPLE_TEMPLATE, draft.accent_color);
    return applyMasterWrapper(contentHtml, {
      wrapper_html: draft.wrapper_html,
      logo_url: draft.logo_url,
      accent_color: draft.accent_color,
      footer_html: draft.footer_html,
    });
  })();

  const handleSave = async () => {
    if (!draft) return;
    try {
      await updateMutation.mutateAsync({
        id: draft.id,
        wrapper_html: draft.wrapper_html,
        logo_url: draft.logo_url,
        accent_color: draft.accent_color,
        footer_html: draft.footer_html,
      });
      toast.success("Master template saved — all future emails will use these settings.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-foreground-subtle" />
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-card/30 p-12 text-center text-foreground-subtle">
        No master template found for your workspace. Contact support or re-seed the database.
      </div>
    );
  }

  const isDirty =
    master &&
    (draft.logo_url !== master.logo_url ||
      draft.accent_color !== master.accent_color ||
      draft.footer_html !== master.footer_html ||
      draft.wrapper_html !== master.wrapper_html);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* ── Left: settings form ── */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-foreground-subtle" />
            <h2 className="text-sm font-semibold text-foreground">Email Branding</h2>
          </div>
          <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending || !isDirty}>
            {updateMutation.isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-3.5 w-3.5" />
            )}
            {isDirty ? "Save Changes" : "Saved"}
          </Button>
        </div>

        <p className="text-xs text-foreground-disabled">
          These settings control the shared wrapper for <strong>all</strong> outbound emails.
          Changes apply immediately to the next email sent.
        </p>

        <Field label="Logo URL" hint="URL to your logo image (max 200px wide × 40px tall).">
          <Input
            placeholder="https://example.com/logo.png"
            value={draft.logo_url}
            onChange={(e) => setDraft({ ...draft, logo_url: e.target.value })}
          />
        </Field>

        <Field label="Accent Color" hint="Used for CTA buttons and highlights.">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={draft.accent_color}
              onChange={(e) => setDraft({ ...draft, accent_color: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
            />
            <Input
              className="w-28 font-mono text-xs"
              value={draft.accent_color}
              onChange={(e) => setDraft({ ...draft, accent_color: e.target.value })}
            />
          </div>
        </Field>

        <Field label="Footer text" hint="Appears at the bottom of every email.">
          <Textarea
            rows={3}
            value={draft.footer_html}
            onChange={(e) => setDraft({ ...draft, footer_html: e.target.value })}
          />
        </Field>

        {/* ── Advanced: wrapper HTML ── */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs font-medium text-foreground-subtle hover:text-foreground transition-colors"
        >
          {showAdvanced ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
          Advanced: Edit wrapper HTML
        </button>

        {showAdvanced && (
          <Field
            label="Wrapper HTML"
            hint="Use {{CONTENT}}, {{LOGO_BLOCK}}, {{FOOTER_HTML}}, {{ACCENT_COLOR}} as placeholders."
          >
            <Textarea
              rows={16}
              className="font-mono text-xs"
              value={draft.wrapper_html}
              onChange={(e) => setDraft({ ...draft, wrapper_html: e.target.value })}
            />
          </Field>
        )}
      </section>

      {/* ── Right: live preview ── */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium uppercase tracking-wide text-foreground-disabled">
          <Eye className="h-3.5 w-3.5" />
          Live Preview
        </div>
        <div className="rounded-xl border border-border bg-surface-card p-3">
          <div className="mb-2 border-b border-border pb-2 text-xs text-foreground-subtle">
            Sample email using your master template
          </div>
          <iframe
            title="master-template-preview"
            srcDoc={previewHtml}
            sandbox=""
            className="h-[600px] w-full rounded-lg bg-white"
          />
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-foreground-subtle">{label}</Label>
      {children}
      {hint && <span className="text-[11px] text-foreground-disabled">{hint}</span>}
    </div>
  );
}

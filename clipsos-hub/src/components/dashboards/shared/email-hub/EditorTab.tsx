/**
 * EditorTab — visual ↔ HTML toggle, live iframe preview.
 * Saves through useUpdateEmailTemplate.
 */
import { useMemo } from "react";
import { Code2, Eye, Loader2, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EmailTemplate } from "@/hooks/use-email-templates";
import { useMasterTemplate } from "@/hooks/use-master-template";
import { renderTemplate, renderWithMaster } from "@/lib/email/renderTemplate";

const PREVIEW_VARS: Record<string, string> = {
  workspace_name: "ClipsOS",
  client_name: "Adib",
  invite_url: "https://clips-appv2.lovable.app/invite/abc",
  invoice_number: "INV-2026-001",
  amount: "$1,200.00",
  payment_url: "https://clips-appv2.lovable.app/pay/abc",
  video_title: "Meadow Lane Oakland — Final Cut",
  video_url: "https://clips-appv2.lovable.app/v/abc",
};

interface EditorTabProps {
  draft: EmailTemplate | null;
  isLoading: boolean;
  isSaving: boolean;
  templates: EmailTemplate[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChange: (d: EmailTemplate) => void;
  onSave: () => void;
}

export function EditorTab({
  draft,
  isLoading,
  isSaving,
  templates,
  selectedId,
  onSelect,
  onChange,
  onSave,
}: EditorTabProps) {
  const mode: "visual" | "html" = useMemo(() => {
    if (!draft) return "visual";
    return draft.edit_mode === "html" ? "html" : "visual";
  }, [draft]);

  const { data: master } = useMasterTemplate();

  const preview = useMemo(() => {
    if (!draft) return { subject: "", html: "" };
    const templateInput = {
      edit_mode: mode,
      subject: draft.subject,
      preview_text: draft.preview_text,
      headline: draft.headline,
      body: draft.body,
      cta_text: draft.cta_text,
      cta_url: draft.cta_url,
      body_html: draft.body_html,
    };

    // Use master template wrapper if available
    if (master) {
      return renderWithMaster(
        templateInput,
        {
          wrapper_html: master.wrapper_html,
          logo_url: master.logo_url,
          accent_color: master.accent_color,
          footer_html: master.footer_html,
        },
        PREVIEW_VARS,
      );
    }

    return renderTemplate(templateInput, PREVIEW_VARS);
  }, [draft, mode, master]);

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
        Pick a template from the Templates tab to start editing.
      </div>
    );
  }

  const setMode = (m: "visual" | "html") => onChange({ ...draft, edit_mode: m });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_minmax(0,1fr)]">
      {/* ── Left: template list ── */}
      <aside className="flex flex-col gap-2">
        <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-foreground-disabled">
          Templates
        </div>
        <div className="flex flex-col gap-1">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`flex flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selectedId === t.id
                  ? "bg-surface-raised text-foreground"
                  : "text-foreground-subtle hover:bg-surface-card"
              }`}
            >
              <span className="font-medium">{t.name}</span>
              <span className="font-mono text-[10px] text-foreground-disabled">{t.slug}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Middle: editor form ── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-card p-0.5">
            <button
              onClick={() => setMode("visual")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "visual" ? "bg-surface-raised text-foreground" : "text-foreground-subtle"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Visual
            </button>
            <button
              onClick={() => setMode("html")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "html" ? "bg-surface-raised text-foreground" : "text-foreground-subtle"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              HTML
            </button>
          </div>
          <Button size="sm" onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-3.5 w-3.5" />
            )}
            Save
          </Button>
        </div>

        <Field label="Name">
          <Input
            value={draft.name}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
          />
        </Field>

        <Field label="Subject" hint="Tokens like {{client_name}} are allowed.">
          <Input
            value={draft.subject}
            onChange={(e) => onChange({ ...draft, subject: e.target.value })}
          />
        </Field>

        <Field label="Preview text" hint="Inbox preview snippet (optional).">
          <Input
            value={draft.preview_text ?? ""}
            onChange={(e) => onChange({ ...draft, preview_text: e.target.value })}
          />
        </Field>

        {mode === "visual" ? (
          <>
            <Field label="Headline">
              <Input
                value={draft.headline ?? ""}
                onChange={(e) => onChange({ ...draft, headline: e.target.value })}
              />
            </Field>
            <Field label="Body">
              <Textarea
                rows={6}
                value={draft.body ?? ""}
                onChange={(e) => onChange({ ...draft, body: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="CTA text">
                <Input
                  value={draft.cta_text ?? ""}
                  onChange={(e) => onChange({ ...draft, cta_text: e.target.value })}
                />
              </Field>
              <Field label="CTA URL">
                <Input
                  value={draft.cta_url ?? ""}
                  onChange={(e) => onChange({ ...draft, cta_url: e.target.value })}
                />
              </Field>
            </div>
          </>
        ) : (
          <Field label="Raw HTML" hint="Full HTML email body. Tokens still interpolated.">
            <Textarea
              rows={18}
              className="font-mono text-xs"
              value={draft.body_html ?? ""}
              onChange={(e) => onChange({ ...draft, body_html: e.target.value })}
            />
          </Field>
        )}
      </section>

      {/* ── Right: live preview ── */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium uppercase tracking-wide text-foreground-disabled">
          <Eye className="h-3.5 w-3.5" />
          Preview
        </div>
        <div className="rounded-xl border border-border bg-surface-card p-3">
          <div className="mb-2 border-b border-border pb-2 text-xs text-foreground-subtle">
            Subject: <span className="font-medium text-foreground">{preview.subject}</span>
          </div>
          <iframe
            title="email-preview"
            srcDoc={preview.html}
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

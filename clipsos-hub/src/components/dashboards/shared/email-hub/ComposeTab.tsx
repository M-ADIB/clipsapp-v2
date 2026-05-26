/**
 * ComposeTab — write a one-off campaign and either send now or schedule.
 *
 * Audience picker → Subject/Headline/Body/CTA → Preview.
 * On send:
 *   1. Inserts a row into email_campaigns
 *   2. Inserts one row per recipient into email_campaign_recipients
 *   3. Inserts one row per recipient into email_queue (status='pending')
 *      with metadata.campaign_id set so the queue worker / cancel flow can
 *      correlate them.
 *
 * Saving as a template hands data back to the parent which routes the user
 * to the Editor tab with a new draft.
 */
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { renderTemplate } from "@/lib/email/renderTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Send, Clock, Save, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface Recipient {
  email: string;
  name: string;
}

interface ComposeState {
  subject: string;
  headline: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
  preview_text: string;
  audiences: string[];
  customList: string;
}

const AUDIENCE_OPTIONS = [
  { id: "leads", label: "Leads", description: "All leads from form submissions" },
  { id: "active_clients", label: "Active Clients", description: "Clients with active status" },
  { id: "all_clients", label: "All Clients", description: "Every client in the system" },
  { id: "team", label: "Team Members", description: "Internal team (editors, admins)" },
];

interface ComposeTabProps {
  /** Lets the parent jump to Editor with a fresh draft seeded from this form */
  onSaveAsTemplate: (data: {
    name: string;
    subject: string;
    headline: string;
    body: string;
    cta_text: string;
    cta_url: string;
    preview_text: string;
  }) => void;
  /** Optional pre-fill (e.g. when "Use template" is clicked from Templates tab) */
  initialData?: Partial<ComposeState> | null;
}

const EMPTY: ComposeState = {
  subject: "",
  headline: "",
  body: "",
  ctaText: "",
  ctaUrl: "",
  preview_text: "",
  audiences: [],
  customList: "",
};

export function ComposeTab({ onSaveAsTemplate, initialData }: ComposeTabProps) {
  const { tenantId, user } = useAuth();
  const qc = useQueryClient();

  const [state, setState] = useState<ComposeState>(EMPTY);
  const [isSending, setIsSending] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    if (!initialData) return;
    setState((s) => ({ ...s, ...initialData }));
  }, [initialData]);

  /** Render a fresh HTML preview for the first recipient */
  const previewHtml = useMemo(() => {
    const { html } = renderTemplate(
      {
        edit_mode: "visual",
        subject: state.subject,
        headline: state.headline,
        body: state.body,
        cta_text: state.ctaText,
        cta_url: state.ctaUrl,
        preview_text: state.preview_text,
        body_html: "",
      },
      { client_name: "John", workspace_name: "ClipsOS" },
    );
    return html;
  }, [state]);

  async function fetchRecipients(): Promise<Recipient[]> {
    if (!tenantId) return [];
    const recipients: Recipient[] = [];
    const seen = new Set<string>();
    const add = (email: string | null, name: string | null) => {
      if (!email) return;
      const k = email.toLowerCase();
      if (seen.has(k)) return;
      seen.add(k);
      recipients.push({ email, name: name ?? "" });
    };

    if (state.audiences.includes("leads")) {
      const { data } = await supabase
        .from("leads")
        .select("email, first_name")
        .eq("tenant_id", tenantId);
      data?.forEach((r) => add(r.email, r.first_name));
    }
    if (state.audiences.includes("active_clients")) {
      const { data } = await supabase
        .from("clients")
        .select("email, name")
        .eq("tenant_id", tenantId)
        .eq("account_status", "active");
      data?.forEach((r) => add(r.email, r.name));
    }
    if (state.audiences.includes("all_clients")) {
      const { data } = await supabase
        .from("clients")
        .select("email, name")
        .eq("tenant_id", tenantId);
      data?.forEach((r) => add(r.email, r.name));
    }
    if (state.audiences.includes("team")) {
      const { data } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("tenant_id", tenantId);
      data?.forEach((r) => add(r.email, r.full_name));
    }
    if (state.customList.trim()) {
      state.customList
        .split(/[,\n]+/)
        .map((e) => e.trim())
        .filter(Boolean)
        .forEach((email) => add(email, ""));
    }

    return recipients;
  }

  async function send(scheduledFor?: Date) {
    if (!tenantId) {
      toast.error("Tenant not loaded — try again.");
      return;
    }
    if (!state.subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!state.body.trim()) {
      toast.error("Body is required");
      return;
    }
    if (state.audiences.length === 0 && !state.customList.trim()) {
      toast.error("Select at least one audience or add custom emails");
      return;
    }

    setIsSending(true);
    try {
      const recipients = await fetchRecipients();
      if (recipients.length === 0) {
        toast.error("No recipients found for the selected audiences");
        return;
      }

      // Snapshot the rendered HTML for the first recipient (history preview)
      const firstName = recipients[0]?.name?.split(" ")[0] || "there";
      const { html: renderedHtml } = renderTemplate(
        {
          edit_mode: "visual",
          subject: state.subject,
          headline: state.headline,
          body: state.body,
          cta_text: state.ctaText,
          cta_url: state.ctaUrl,
          preview_text: state.preview_text,
          body_html: "",
        },
        { client_name: firstName },
      );

      // 1) Campaign row
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: campaign, error: campErr } = await (supabase as any)
        .from("email_campaigns")
        .insert({
          tenant_id: tenantId,
          subject: state.subject,
          headline: state.headline || null,
          body: state.body,
          cta_text: state.ctaText || null,
          cta_url: state.ctaUrl || null,
          audience: state.audiences.join(", ") + (state.customList.trim() ? ", custom" : ""),
          recipient_count: recipients.length,
          status: scheduledFor ? "scheduled" : "sent",
          sent_at: scheduledFor ? null : new Date().toISOString(),
          scheduled_for: scheduledFor ? scheduledFor.toISOString() : null,
          rendered_html: renderedHtml,
          created_by: user?.id ?? null,
        })
        .select("id")
        .single();
      if (campErr) throw campErr;

      // 2) Recipients
      const recRows = recipients.map((r) => ({
        tenant_id: tenantId,
        campaign_id: campaign!.id,
        email: r.email,
        name: r.name || null,
        status: "queued",
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: recErr } = await (supabase as any)
        .from("email_campaign_recipients")
        .insert(recRows);
      if (recErr) throw recErr;

      // 3) Queue entries (one per recipient, individually rendered)
      const queueRows = recipients.map((r) => {
        const fname = r.name?.split(" ")[0] || "";
        const { html, subject } = renderTemplate(
          {
            edit_mode: "visual",
            subject: state.subject,
            headline: state.headline,
            body: state.body,
            cta_text: state.ctaText,
            cta_url: state.ctaUrl,
            preview_text: state.preview_text,
            body_html: "",
          },
          { client_name: fname },
        );
        return {
          tenant_id: tenantId,
          to_email: r.email,
          to_name: r.name || null,
          subject,
          body_html: html,
          status: "pending",
          metadata: { campaign_id: campaign!.id },
        };
      });

      // Insert in batches of 100
      for (let i = 0; i < queueRows.length; i += 100) {
        const batch = queueRows.slice(i, i + 100);
        const { error } = await supabase.from("email_queue").insert(batch);
        if (error) throw error;
      }

      qc.invalidateQueries({ queryKey: ["email-campaigns", tenantId] });
      qc.invalidateQueries({ queryKey: ["email-campaigns-scheduled", tenantId] });

      toast.success(
        scheduledFor
          ? `Campaign scheduled for ${recipients.length} recipients`
          : `Campaign sent to ${recipients.length} recipients`,
      );
      setState(EMPTY);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setIsSending(false);
      setShowSchedule(false);
    }
  }

  function confirmSchedule() {
    if (!scheduleDate || !scheduleTime) {
      toast.error("Pick a date and time");
      return;
    }
    const dt = new Date(`${scheduleDate}T${scheduleTime}`);
    if (dt <= new Date()) {
      toast.error("Scheduled time must be in the future");
      return;
    }
    send(dt);
  }

  function saveTemplate() {
    if (!templateName.trim()) {
      toast.error("Template name is required");
      return;
    }
    onSaveAsTemplate({
      name: templateName,
      subject: state.subject,
      headline: state.headline,
      body: state.body,
      cta_text: state.ctaText,
      cta_url: state.ctaUrl,
      preview_text: state.preview_text,
    });
    setShowSaveTemplate(false);
    setTemplateName("");
  }

  const toggleAudience = (id: string) => {
    setState((s) => ({
      ...s,
      audiences: s.audiences.includes(id)
        ? s.audiences.filter((a) => a !== id)
        : [...s.audiences, id],
    }));
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* ── Left: form ── */}
      <div className="space-y-5">
        {/* Audience */}
        <div>
          <Label className="mb-2 block text-sm font-medium">Audience</Label>
          <div className="space-y-2">
            {AUDIENCE_OPTIONS.map((opt) => (
              <label key={opt.id} className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={state.audiences.includes(opt.id)}
                  onCheckedChange={() => toggleAudience(opt.id)}
                />
                <span className="text-sm">{opt.label}</span>
                <span className="text-xs text-foreground-subtle">— {opt.description}</span>
              </label>
            ))}
          </div>
          <div className="mt-3">
            <Label className="text-xs text-foreground-subtle">
              Custom emails (comma or newline separated)
            </Label>
            <Textarea
              value={state.customList}
              onChange={(e) => setState((s) => ({ ...s, customList: e.target.value }))}
              placeholder="john@example.com, jane@example.com"
              className="mt-1 h-16 text-sm"
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <Label className="text-sm font-medium">Subject *</Label>
          <Input
            value={state.subject}
            onChange={(e) => setState((s) => ({ ...s, subject: e.target.value }))}
            placeholder="Your email subject..."
            className="mt-1"
          />
        </div>

        {/* Headline */}
        <div>
          <Label className="text-sm font-medium">
            Headline{" "}
            <span className="text-xs text-foreground-subtle">
              (optional — large heading inside the email)
            </span>
          </Label>
          <Input
            value={state.headline}
            onChange={(e) => setState((s) => ({ ...s, headline: e.target.value }))}
            placeholder="Big heading inside the email..."
            className="mt-1"
          />
        </div>

        {/* Body */}
        <div>
          <Label className="text-sm font-medium">
            Body *{" "}
            <span className="text-xs text-foreground-subtle">
              Use {"{{client_name}}"} to personalize.
            </span>
          </Label>
          <Textarea
            value={state.body}
            onChange={(e) => setState((s) => ({ ...s, body: e.target.value }))}
            placeholder="Write your email content here..."
            rows={8}
            className="mt-1"
          />
        </div>

        {/* CTA */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium">CTA button text</Label>
            <Input
              value={state.ctaText}
              onChange={(e) => setState((s) => ({ ...s, ctaText: e.target.value }))}
              placeholder="Learn More"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">CTA button URL</Label>
            <Input
              value={state.ctaUrl}
              onChange={(e) => setState((s) => ({ ...s, ctaUrl: e.target.value }))}
              placeholder="https://..."
              className="mt-1"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={() => send()} disabled={isSending}>
            {isSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send Now
          </Button>
          <Button variant="outline" onClick={() => setShowSchedule(true)} disabled={isSending}>
            <Clock className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button variant="outline" onClick={() => setShowSaveTemplate(true)}>
            <Save className="mr-2 h-4 w-4" />
            Save as Template
          </Button>
        </div>
      </div>

      {/* ── Right: live preview ── */}
      <div>
        <Label className="mb-2 block text-sm font-medium">Live Preview</Label>
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <iframe
            srcDoc={previewHtml}
            title="Email preview"
            sandbox=""
            className="h-[640px] w-full border-0"
          />
        </div>
      </div>

      {/* Schedule dialog */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSchedule(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSchedule} disabled={isSending}>
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Clock className="mr-2 h-4 w-4" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save-template dialog */}
      <Dialog open={showSaveTemplate} onOpenChange={setShowSaveTemplate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Template Name</Label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Monthly Newsletter"
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveTemplate(false)}>
              Cancel
            </Button>
            <Button onClick={saveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

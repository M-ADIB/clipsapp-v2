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
import { renderTemplate } from "@/lib/email/renderTemplate";
import { useSendCampaign } from "@/hooks/use-email-campaign";
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
  const sendCampaign = useSendCampaign();

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

  async function send(scheduledFor?: Date) {
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
      const count = await sendCampaign.mutateAsync({ ...state, scheduledFor });
      toast.success(
        scheduledFor
          ? `Campaign scheduled for ${count} recipients`
          : `Campaign sent to ${count} recipients`,
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

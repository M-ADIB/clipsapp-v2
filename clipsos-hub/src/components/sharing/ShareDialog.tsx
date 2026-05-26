/**
 * ShareDialog — clean, focused share dialog.
 *
 * Features:
 *   - Create share links with configurable permissions
 *   - Require name + email for guest commenting identity
 *   - Short, readable URLs based on video title
 *   - Role-gated controls (full vs simplified based on user role)
 *
 * Scoped to single-video shares when opened from VideoPreviewModal.
 * Also supports batch (videos) and cycle scopes from grid/toolbar.
 */
import {
  Check,
  Copy,
  Download,
  Link2,
  Loader2,
  Mail,
  MessageSquare,
  Plus,
  UserCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

import { useCreateShareLink, buildShareUrl, type ShareScope } from "@/hooks/use-share-links";
import type { AppRole } from "@/integrations/supabase/db-types";

/* ─── Props ────────────────────────────────────────────────────────── */

export type ShareTarget =
  | { scope: "video"; videoId: string; videoTitle?: string | null }
  | { scope: "videos"; videoIds: string[] }
  | { scope: "cycle"; cycleId: string; cycleName?: string | null };

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: ShareTarget;
  /** Optional project id for context. */
  projectId?: string | null;
  /** Current user role — controls which permission toggles are visible. */
  role?: AppRole | null;
}

/* ─── Constants ────────────────────────────────────────────────────── */

const EXPIRY_OPTIONS: Array<{ label: string; ms: number | null }> = [
  { label: "24 hours", ms: 1000 * 60 * 60 * 24 },
  { label: "7 days", ms: 1000 * 60 * 60 * 24 * 7 },
  { label: "30 days", ms: 1000 * 60 * 60 * 24 * 30 },
  { label: "90 days", ms: 1000 * 60 * 60 * 24 * 90 },
  { label: "Never", ms: null },
];

/** Roles that get full permission controls (download toggle, expiry, email) */
const FULL_CONTROL_ROLES: AppRole[] = ["owner", "manager", "senior_editor", "client"];

/** Roles that can see the share button at all */
const SHARE_ALLOWED_ROLES: AppRole[] = [
  "owner",
  "manager",
  "senior_editor",
  "content_creator",
  "editor",
  "client",
];

function hasFullControls(role: AppRole | null | undefined): boolean {
  return !!role && FULL_CONTROL_ROLES.includes(role);
}

export function canShare(role: AppRole | null | undefined): boolean {
  return !!role && SHARE_ALLOWED_ROLES.includes(role);
}

/* ─── Helpers ──────────────────────────────────────────────────────── */

function describeTarget(target: ShareTarget): {
  title: string;
  description: string;
} {
  if (target.scope === "video") {
    return {
      title: "Share Video",
      description: target.videoTitle
        ? `Create a shareable link for "${target.videoTitle}"`
        : "Create a shareable link for this video",
    };
  }
  if (target.scope === "videos") {
    return {
      title: `Share ${target.videoIds.length} Videos`,
      description: "Create a shareable link for the selected videos",
    };
  }
  return {
    title: "Share Cycle",
    description: target.cycleName
      ? `Create a shareable link for "${target.cycleName}"`
      : "Create a shareable link for this cycle",
  };
}

/* ─── Main Component ───────────────────────────────────────────────── */

export function ShareDialog({ open, onOpenChange, target, projectId, role }: ShareDialogProps) {
  const [view, setView] = useState<"create" | "success">("create");

  // Form state
  const [allowDownload, setAllowDownload] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [requireEmail, setRequireEmail] = useState(true); // default ON — guests need name+email to comment
  const [expiryMs, setExpiryMs] = useState<number | null>(EXPIRY_OPTIONS[2].ms); // 30 days default

  // Generated link
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Mutations
  const createLink = useCreateShareLink();

  const meta = describeTarget(target);
  const fullControls = hasFullControls(role);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setView("create");
      setAllowDownload(false);
      setAllowComments(true);
      setRequireEmail(true);
      setExpiryMs(EXPIRY_OPTIONS[2].ms);
      setGeneratedUrl(null);
      setCopied(false);
    }
  }, [open]);

  /* ─── Handlers ─────────────────────────────────────────────────── */

  const handleCreate = useCallback(async () => {
    try {
      const res = await createLink.mutateAsync({
        scope: target.scope as ShareScope,
        videoId: target.scope === "video" ? target.videoId : null,
        videoIds: target.scope === "videos" ? target.videoIds : [],
        cycleId: target.scope === "cycle" ? target.cycleId : null,
        projectId: projectId ?? null,
        allowDownload: fullControls ? allowDownload : false,
        allowComments,
        expiresInMs: fullControls ? expiryMs : EXPIRY_OPTIONS[2].ms,
        requireEmail: fullControls ? requireEmail : true,
        videoTitle: target.scope === "video" ? (target.videoTitle ?? null) : null,
      });

      setGeneratedUrl(res.url);
      setView("success");

      // Auto-copy
      try {
        await navigator.clipboard.writeText(res.url);
        setCopied(true);
        toast.success("Link created & copied to clipboard");
      } catch {
        toast.success("Link created successfully");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create link");
    }
  }, [
    createLink,
    target,
    projectId,
    allowDownload,
    allowComments,
    expiryMs,
    requireEmail,
    fullControls,
  ]);

  const handleCopyUrl = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy");
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Link2 className="h-3.5 w-3.5 text-primary" />
            </div>
            {meta.title}
          </DialogTitle>
          <DialogDescription className="text-xs">{meta.description}</DialogDescription>
        </DialogHeader>

        <Separator />

        {view === "create" ? (
          <CreateView
            allowDownload={allowDownload}
            setAllowDownload={setAllowDownload}
            allowComments={allowComments}
            setAllowComments={setAllowComments}
            requireEmail={requireEmail}
            setRequireEmail={setRequireEmail}
            expiryMs={expiryMs}
            setExpiryMs={setExpiryMs}
            fullControls={fullControls}
            isPending={createLink.isPending}
            onCreate={handleCreate}
            onCancel={() => onOpenChange(false)}
          />
        ) : (
          <SuccessView
            url={generatedUrl!}
            copied={copied}
            onCopy={() => handleCopyUrl(generatedUrl!)}
            onDone={() => onOpenChange(false)}
            onCreateAnother={() => setView("create")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─── Create View ──────────────────────────────────────────────────── */

function CreateView({
  allowDownload,
  setAllowDownload,
  allowComments,
  setAllowComments,
  requireEmail,
  setRequireEmail,
  expiryMs,
  setExpiryMs,
  fullControls,
  isPending,
  onCreate,
  onCancel,
}: {
  allowDownload: boolean;
  setAllowDownload: (v: boolean) => void;
  allowComments: boolean;
  setAllowComments: (v: boolean) => void;
  requireEmail: boolean;
  setRequireEmail: (v: boolean) => void;
  expiryMs: number | null;
  setExpiryMs: (v: number | null) => void;
  fullControls: boolean;
  isPending: boolean;
  onCreate: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3.5 px-5 py-4">
        {/* Permissions */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Permissions</Label>
          <div className="rounded-lg border border-border/60 divide-y divide-border/40">
            {fullControls && (
              <PermissionRow
                icon={<Download className="h-3.5 w-3.5" />}
                label="Allow download"
                hint="Recipients can download original files"
                checked={allowDownload}
                onChange={setAllowDownload}
              />
            )}
            <PermissionRow
              icon={<MessageSquare className="h-3.5 w-3.5" />}
              label="Allow comments"
              hint="Recipients can leave timestamped feedback"
              checked={allowComments}
              onChange={setAllowComments}
            />
            <PermissionRow
              icon={<UserCircle className="h-3.5 w-3.5" />}
              label="Require name & email"
              hint="Viewers must identify themselves to view and comment"
              checked={requireEmail}
              onChange={setRequireEmail}
            />
          </div>
        </div>

        {/* Expiry */}
        {fullControls && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Link expires in</Label>
            <Select
              value={String(expiryMs)}
              onValueChange={(v) => setExpiryMs(v === "null" ? null : Number(v))}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPIRY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.label} value={opt.ms === null ? "null" : String(opt.ms)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 border-t border-border/40 px-5 py-3 bg-muted/30">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="text-xs">
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onCreate}
          disabled={isPending}
          className="gap-1.5 text-xs"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Link2 className="h-3.5 w-3.5" />
          )}
          Create Link
        </Button>
      </div>
    </div>
  );
}

/* ─── Success View ─────────────────────────────────────────────────── */

function SuccessView({
  url,
  copied,
  onCopy,
  onDone,
  onCreateAnother,
}: {
  url: string;
  copied: boolean;
  onCopy: () => void;
  onDone: () => void;
  onCreateAnother: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
          <Check className="h-5 w-5 text-emerald-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Link created!</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {copied ? "Already copied to your clipboard" : "Copy the link below to share"}
          </p>
        </div>

        <div className="flex w-full items-center gap-2">
          <Input
            readOnly
            value={url}
            className="h-8 font-mono text-xs flex-1 bg-muted/50"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={onCopy}
                  className="h-8 w-8 shrink-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Copy link</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/40 px-5 py-3 bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCreateAnother}
          className="gap-1.5 text-xs"
        >
          <Plus className="h-3 w-3" />
          Create another
        </Button>
        <Button type="button" size="sm" onClick={onDone} className="text-xs">
          Done
        </Button>
      </div>
    </div>
  );
}

/* ─── Permission Row ───────────────────────────────────────────────── */

function PermissionRow({
  icon,
  label,
  hint,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="text-muted-foreground">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs font-medium leading-tight">{label}</p>
          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{hint}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="scale-[0.85]" />
    </div>
  );
}

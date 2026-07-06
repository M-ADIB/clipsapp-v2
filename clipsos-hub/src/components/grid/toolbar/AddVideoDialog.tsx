/**
 * AddVideoDialog — Upload-first "New Video" creation flow.
 *
 * Workflow:
 *   1. User picks a client (or it's pre-filled if grid is scoped to one client)
 *   2. User optionally types a title
 *   3. User drags/picks a video file
 *   4. On "Upload & Create":
 *      a. INSERT a new row into `videos` with the chosen title + client
 *      b. Immediately queue the file for upload via useUploadManager
 *   5. Dialog closes, toast shows, grid revalidates and scrolls to new row
 *
 * No empty rows are ever created.
 */
import { useCallback, useRef, useState } from "react";
import { AlertCircle, ChevronDown, FileVideo, Upload, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useClients } from "@/hooks/use-clients";
import { useUploadManager } from "@/hooks/useUploadManager";
import {
  ACCEPTED_VIDEO_EXTENSIONS,
  ACCEPTED_VIDEO_TYPES,
  MAX_FILE_SIZE,
  LARGE_FILE_WARNING_THRESHOLD,
} from "@/lib/upload";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatBytes } from "@/lib/format";
const formatFileSize = formatBytes;

interface AddVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-filled when the grid is already scoped to one client. */
  defaultClientId?: string;
  defaultClientName?: string;
  /** Pre-filled project context, if any. */
  projectId?: string;
  /** Pre-filled cycle context, if any. */
  cycleId?: string;
}

export function AddVideoDialog({
  open,
  onOpenChange,
  defaultClientId,
  defaultClientName,
  projectId,
  cycleId,
}: AddVideoDialogProps) {
  const { tenantId, user, profile } = useAuth();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { addFile } = useUploadManager();
  const qc = useQueryClient();

  // ── State ──────────────────────────────────────────────────────────
  const [clientId, setClientId] = useState(defaultClientId ?? "");
  const [clientName, setClientName] = useState(defaultClientName ?? "");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileWarning, setFileWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setClientId(defaultClientId ?? "");
    setClientName(defaultClientName ?? "");
    setTitle("");
    setFile(null);
    setFileError(null);
    setFileWarning(null);
    setIsSubmitting(false);
    setIsDragging(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  // ── File handling ──────────────────────────────────────────────────
  const validateAndSet = useCallback((f: File) => {
    const isMimeTypeAccepted = ACCEPTED_VIDEO_TYPES.includes(
      f.type as (typeof ACCEPTED_VIDEO_TYPES)[number],
    );

    // Extract extension from file name
    const dotIndex = f.name.lastIndexOf(".");
    const fileExtension = dotIndex !== -1 ? f.name.substring(dotIndex).toLowerCase() : "";
    const acceptedExtensions = ACCEPTED_VIDEO_EXTENSIONS.split(",").map((ext) =>
      ext.trim().toLowerCase(),
    );
    const isExtensionAccepted = fileExtension ? acceptedExtensions.includes(fileExtension) : false;

    if (!isMimeTypeAccepted && !isExtensionAccepted) {
      setFileError(`Unsupported type: ${f.type || "unknown"}. Use MP4, MOV, WebM, AVI, or MKV.`);
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      const maxGB = (MAX_FILE_SIZE / (1024 * 1024 * 1024)).toFixed(0);
      const fileGB = (f.size / (1024 * 1024 * 1024)).toFixed(2);
      setFileError(`File too large (${fileGB} GB). Maximum upload size is ${maxGB} GB.`);
      return;
    }
    setFileError(null);
    // Large file advisory
    if (f.size > LARGE_FILE_WARNING_THRESHOLD) {
      const sizeGB = (f.size / (1024 * 1024 * 1024)).toFixed(2);
      setFileWarning(`Large file (${sizeGB} GB) — upload may take several minutes.`);
    } else {
      setFileWarning(null);
    }
    setFile(f);
    // Auto-fill title from filename if still empty
    setTitle((prev) => {
      if (prev.trim()) return prev;
      return f.name.replace(/\.[^/.]+$/, ""); // strip extension
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) validateAndSet(f);
    },
    [validateAndSet],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) validateAndSet(f);
      e.target.value = "";
    },
    [validateAndSet],
  );

  // ── Submit ─────────────────────────────────────────────────────────
  const canSubmit = Boolean(clientId && file && !isSubmitting);

  const handleSubmit = async () => {
    console.log("[AddVideoDialog] handleSubmit triggered");
    if (isSubmitting) return;

    console.log("[AddVideoDialog] Initial variables:", {
      tenantId,
      clientId,
      file: file ? { name: file.name, size: file.size, type: file.type } : null,
      isSubmitting,
      canSubmit,
      user: user ? { id: user.id } : null,
      profile: profile ? { id: profile.id } : null,
    });

    setIsSubmitting(true);

    try {
      // Defensive validations with visible user feedback (toasts)
      if (!clientId) {
        throw new Error("Please select a client.");
      }
      if (!file) {
        throw new Error("Please select a video file to upload.");
      }

      // Determine activeTenantId using the AuthContext tenantId first
      let activeTenantId = tenantId;

      if (!activeTenantId && clientId) {
        console.log("[AddVideoDialog] tenantId is missing, looking up via clientId:", clientId);
        // Fallback 1: Lookup the selected client from local clients array
        const selectedClient = clients.find((c) => c.id === clientId);
        if (selectedClient?.tenant_id) {
          activeTenantId = selectedClient.tenant_id;
          console.log(
            "[AddVideoDialog] Resolved activeTenantId from clients array:",
            activeTenantId,
          );
        } else {
          // Fallback 2: Direct lookup in the clients database table
          const { data: clientRow, error: clientErr } = await supabase
            .from("clients")
            .select("tenant_id")
            .eq("id", clientId)
            .maybeSingle();
          if (clientErr) {
            throw new Error(`Failed to lookup client tenant ID: ${clientErr.message}`);
          }
          if (clientRow?.tenant_id) {
            activeTenantId = clientRow.tenant_id;
            console.log(
              "[AddVideoDialog] Resolved activeTenantId from database lookup:",
              activeTenantId,
            );
          } else {
            throw new Error("Could not resolve workspace tenant ID from client.");
          }
        }
      }

      console.log("[AddVideoDialog] Resolved activeTenantId:", activeTenantId);

      if (!activeTenantId) {
        throw new Error(
          "Could not resolve workspace tenant ID. Please select a client or contact support.",
        );
      }

      console.log("[AddVideoDialog] Fetching max order_index...");
      // 1. Find max order_index
      const { data: maxRow, error: maxRowErr } = await supabase
        .from("videos")
        .select("order_index")
        .eq("tenant_id", activeTenantId)
        .order("order_index", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (maxRowErr) {
        console.warn("[AddVideoDialog] Error fetching max order_index:", maxRowErr);
      }
      const nextOrder = (maxRow?.order_index ?? 0) + 1;

      // 2. Create the video row
      const sanitizedProjectId = projectId && projectId !== "none" ? projectId : null;
      const sanitizedCycleId = cycleId && cycleId !== "none" ? cycleId : null;

      const { data: newVideo, error: insertErr } = await supabase
        .from("videos")
        .insert({
          tenant_id: activeTenantId,
          client_id: clientId,
          project_id: sanitizedProjectId,
          cycle_id: sanitizedCycleId,
          video_title: title.trim() || file.name.replace(/\.[^/.]+$/, ""),
          order_index: nextOrder,
          created_by: user?.id ?? null,
        })
        .select("id")
        .single();

      if (insertErr) {
        throw new Error(insertErr.message || "Database insert failed");
      }
      if (!newVideo?.id) {
        throw new Error("Video was created, but no ID was returned");
      }

      // 3. Create version 1 record
      const { data: version, error: versionErr } = await supabase
        .from("video_versions")
        .insert({
          video_id: newVideo.id,
          tenant_id: activeTenantId,
          version_number: 1,
          is_current: true,
          uploaded_by: profile?.id ?? null,
        })
        .select("id")
        .single();

      if (versionErr) {
        throw new Error(versionErr.message || "Version create failed");
      }
      if (!version?.id) {
        throw new Error("Version was created, but no ID was returned");
      }

      // 4. Queue upload — fire-and-forget (UploadManager handles progress)
      addFile(file, newVideo.id, version.id);

      // 5. Invalidate grid queries so the new row appears
      qc.invalidateQueries({ queryKey: ["grid", "rows"] });

      toast.success(`"${title.trim() || file.name}" added — uploading now`);
      handleOpenChange(false);
    } catch (err: any) {
      console.error("[AddVideoDialog] error details:", err);
      const msg = err?.message || (typeof err === "string" ? err : "Something went wrong");
      toast.error(`Failed to create video: ${msg}`);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            Upload New Video
          </DialogTitle>
          <DialogDescription>
            Select a client, give your video a title, then upload the file to create the row.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* ── Client picker ────────────────────────────────── */}
          {!defaultClientId && (
            <div className="space-y-1.5">
              <Label htmlFor="client-select" className="text-xs font-medium text-foreground-muted">
                Client <span className="text-destructive">*</span>
              </Label>
              <Select
                value={clientId}
                onValueChange={(val) => {
                  setClientId(val);
                  const selectedClient = clients.find((c) => c.id === val);
                  if (selectedClient) {
                    setClientName(selectedClient.name);
                  }
                }}
              >
                <SelectTrigger
                  id="client-select"
                  className={cn(
                    "h-9 w-full bg-background text-sm",
                    !clientId && "text-foreground-disabled",
                  )}
                >
                  <SelectValue placeholder="Select a client…" />
                </SelectTrigger>
                <SelectContent>
                  {clientsLoading ? (
                    <div className="p-2 text-xs text-foreground-disabled">Loading clients…</div>
                  ) : clients.length === 0 ? (
                    <div className="p-2 text-xs text-foreground-disabled">No clients found</div>
                  ) : (
                    clients.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ── Title ────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="video-title" className="text-xs font-medium text-foreground-muted">
              Video title
              <span className="ml-1 text-foreground-disabled">(auto-filled from filename)</span>
            </Label>
            <Input
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Product Demo — May 2025"
              className="h-9 text-sm"
            />
          </div>

          {/* ── File drop zone ───────────────────────────────── */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground-muted">
              Video file <span className="text-destructive">*</span>
            </Label>

            {file ? (
              /* File selected state */
              <div className="flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/[0.04] px-3 py-3">
                <FileVideo className="h-8 w-8 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-foreground-muted">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setFileError(null);
                  }}
                  className="shrink-0 rounded p-1 text-foreground-disabled transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Remove file"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              /* Empty drop zone */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-all",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/30",
                )}
              >
                <Upload
                  className={cn(
                    "h-7 w-7 transition-colors",
                    isDragging ? "text-primary" : "text-foreground-disabled",
                  )}
                />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Drop your video here</p>
                  <p className="mt-0.5 text-xs text-foreground-muted">
                    or click to browse · MP4, MOV, WebM, AVI, MKV
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_VIDEO_EXTENSIONS}
              onChange={handleInputChange}
              className="hidden"
            />

            {fileError && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {fileError}
              </p>
            )}

            {fileWarning && !fileError && (
              <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {fileWarning}
              </p>
            )}
          </div>

          {/* ── Actions ──────────────────────────────────────── */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={!canSubmit} className="gap-1.5">
              {isSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Creating…
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Upload &amp; Create
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

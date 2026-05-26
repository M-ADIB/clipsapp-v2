/**
 * UploadDropzone — Drag-and-drop file picker for video uploads.
 * Supports multi-file drag (10+ files at once).
 * Can be used as a standalone dialog or embedded inline.
 */

import { useCallback, useState, useRef } from "react";
import { Upload, FileVideo, AlertCircle, Files, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUploadManager } from "@/hooks/useUploadManager";
import {
  ACCEPTED_VIDEO_TYPES,
  ACCEPTED_VIDEO_EXTENSIONS,
  MAX_FILE_SIZE,
  LARGE_FILE_WARNING_THRESHOLD,
} from "@/lib/upload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  /** The video record to upload a version for */
  videoId: string;
  /** The version record ID (optional — auto-creates v1 if missing) */
  versionId?: string;
  /** Whether to show as a dialog */
  asDialog?: boolean;
  /** Dialog open state (when asDialog=true) */
  open?: boolean;
  /** Dialog close callback */
  onOpenChange?: (open: boolean) => void;
  /** Called when file(s) are queued for upload */
  onFilesQueued?: (jobIds: string[]) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function totalSize(files: File[]): string {
  const total = files.reduce((sum, f) => sum + f.size, 0);
  return formatFileSize(total);
}

export function UploadDropzone({
  videoId,
  versionId,
  asDialog = false,
  open,
  onOpenChange,
  onFilesQueued,
}: UploadDropzoneProps) {
  const { addFile } = useUploadManager();
  const { tenantId, profile } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [warnings, setWarnings] = useState<string[]>([]);

  const validateFile = useCallback((file: File): string | null => {
    const isMimeTypeAccepted = ACCEPTED_VIDEO_TYPES.includes(
      file.type as (typeof ACCEPTED_VIDEO_TYPES)[number],
    );

    // Extract extension from file name
    const dotIndex = file.name.lastIndexOf(".");
    const fileExtension = dotIndex !== -1 ? file.name.substring(dotIndex).toLowerCase() : "";
    const acceptedExtensions = ACCEPTED_VIDEO_EXTENSIONS.split(",").map((ext) =>
      ext.trim().toLowerCase(),
    );
    const isExtensionAccepted = fileExtension ? acceptedExtensions.includes(fileExtension) : false;

    if (!isMimeTypeAccepted && !isExtensionAccepted) {
      return `${file.name}: unsupported type (${file.type || "unknown"})`;
    }
    if (file.size > MAX_FILE_SIZE) {
      const maxGB = (MAX_FILE_SIZE / (1024 * 1024 * 1024)).toFixed(0);
      return `${file.name}: exceeds ${maxGB} GB limit (${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB)`;
    }
    return null;
  }, []);

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const validFiles: File[] = [];
      const validationErrors: string[] = [];
      const fileWarnings: string[] = [];

      for (const file of files) {
        const error = validateFile(file);
        if (error) {
          validationErrors.push(error);
        } else {
          validFiles.push(file);
          // Large file advisory
          if (file.size > LARGE_FILE_WARNING_THRESHOLD) {
            const sizeGB = (file.size / (1024 * 1024 * 1024)).toFixed(2);
            fileWarnings.push(
              `${file.name} (${sizeGB} GB) — upload may take several minutes on slower connections`,
            );
          }
        }
      }

      setErrors(validationErrors);
      setWarnings(fileWarnings);
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    },
    [validateFile],
  );

  /**
   * Ensure a version record exists for this video.
   * If versionId was supplied as a prop, use it.
   * Otherwise create a new v1 in video_versions.
   */
  const ensureVersionId = useCallback(async (): Promise<string> => {
    if (versionId) return versionId;

    // Check if a version already exists
    const { data: existing } = await supabase
      .from("video_versions")
      .select("id")
      .eq("video_id", videoId)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    if (existing) return existing.id;

    // Create version 1
    const { data: created, error } = await supabase
      .from("video_versions")
      .insert({
        video_id: videoId,
        tenant_id: tenantId!,
        version_number: 1,
        is_current: true,
        uploaded_by: profile?.id ?? null,
      })
      .select("id")
      .single();

    if (error) throw new Error(`Failed to create version: ${error.message}`);
    return created.id;
  }, [versionId, videoId, tenantId, profile?.id]);

  const handleUploadAll = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsCreatingVersion(true);
    try {
      const resolvedVersionId = await ensureVersionId();
      const jobIds = selectedFiles.map((file) => addFile(file, videoId, resolvedVersionId));
      onFilesQueued?.(jobIds);
      setSelectedFiles([]);
      setErrors([]);
      setWarnings([]);
      onOpenChange?.(false);
    } catch (err) {
      setErrors((prev) => [
        ...prev,
        err instanceof Error ? err.message : "Failed to initialize upload",
      ]);
    } finally {
      setIsCreatingVersion(false);
    }
  }, [selectedFiles, addFile, videoId, ensureVersionId, onFilesQueued, onOpenChange]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
      // Reset input so the same files can be re-selected
      e.target.value = "";
    },
    [handleFiles],
  );

  const dropzoneContent = (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        aria-label={
          selectedFiles.length > 0
            ? `${selectedFiles.length} files selected. Click or press Enter to add more.`
            : "Drop video files here or click to browse"
        }
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          selectedFiles.length > 0 && "border-primary/50 bg-primary/5",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_VIDEO_EXTENSIONS}
          onChange={handleInputChange}
          className="hidden"
          multiple
          aria-label="Select video files to upload"
        />

        {selectedFiles.length > 0 ? (
          <>
            <Files className="mb-3 h-10 w-10 text-primary" />
            <p className="text-sm font-medium text-foreground">
              {selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"} selected
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalSize(selectedFiles)} total • Click or drop to add more
            </p>
          </>
        ) : (
          <>
            <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Drop your videos here</p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse • MP4, MOV, WebM, AVI, MKV • Up to 10 GB • Multiple files OK
            </p>
          </>
        )}
      </div>

      {/* Selected file list */}
      {selectedFiles.length > 0 && (
        <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-2">
          {selectedFiles.map((file, i) => (
            <div
              key={`${file.name}-${file.size}-${i}`}
              className="flex items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-muted/50"
            >
              <FileVideo className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-foreground">{file.name}</span>
              <span className="shrink-0 text-muted-foreground">{formatFileSize(file.size)}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div role="alert" className="space-y-1 rounded-md bg-destructive/10 px-3 py-2">
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
              {err}
            </div>
          ))}
        </div>
      )}

      {/* Warnings (large file advisory) */}
      {warnings.length > 0 && (
        <div
          role="status"
          className="space-y-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2"
        >
          {warnings.map((warn, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400"
            >
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
              {warn}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {selectedFiles.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedFiles([]);
              setErrors([]);
              setWarnings([]);
            }}
          >
            Clear All
          </Button>
          <Button size="sm" onClick={handleUploadAll} disabled={isCreatingVersion}>
            {isCreatingVersion ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-3.5 w-3.5" />
            )}
            {isCreatingVersion
              ? "Preparing…"
              : `Upload ${selectedFiles.length > 1 ? `${selectedFiles.length} Videos` : "Video"}`}
          </Button>
        </div>
      )}

      {/* Info */}
      <p className="text-center text-[11px] text-muted-foreground">
        Uploads are resumable. Videos are archived in original quality.
      </p>
    </div>
  );

  if (asDialog) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Videos</DialogTitle>
            <DialogDescription>
              Select one or more video files. Each will be processed for streaming and archived for
              download.
            </DialogDescription>
          </DialogHeader>
          {dropzoneContent}
        </DialogContent>
      </Dialog>
    );
  }

  return dropzoneContent;
}

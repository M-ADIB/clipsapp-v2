/**
 * ClientFiles — "My Files" page for clients.
 *
 * Shows all video files (approved/posted versions) belonging to this client,
 * organized by video. Each row shows the video title, version type, file size,
 * and a download/view link.
 */
import { useEffect, useMemo } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useQuery } from "@tanstack/react-query";
import { FileVideo, Download, ExternalLink, FolderOpen, Clock, HardDrive } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatBytes, formatDate } from "@/lib/format";
const formatFileSize = formatBytes;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface ClientFile {
  id: string;
  videoTitle: string;
  versionType: string;
  versionLabel: string | null;
  versionNumber: number;
  fileName: string | null;
  fileSize: number | null;
  playbackUrl: string | null;
  thumbnailUrl: string | null;
  uploadedAt: string;
}

/* ------------------------------------------------------------------ */
/* Hook: fetch client files from video_versions                       */
/* ------------------------------------------------------------------ */

function useClientFiles(clientId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: ["client-files", tenantId, clientId],
    enabled: !!tenantId && !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_versions")
        .select(
          `
          id,
          version_number,
          version_type,
          custom_version_label,
          video_file_name,
          video_file_size,
          video_playback_url,
          video_thumbnail_url,
          uploaded_at,
          video:videos!inner(id, video_title, client_id)
        `,
        )
        .eq("tenant_id", tenantId!)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;

      // Filter to this client's videos
      const files: ClientFile[] = [];
      for (const vv of data) {
        const video = vv.video as {
          id?: string;
          video_title?: string;
          client_id?: string;
        } | null;
        if (video?.client_id !== clientId) continue;

        files.push({
          id: vv.id,
          videoTitle: video?.video_title ?? "Untitled",
          versionType: vv.version_type ?? "Version",
          versionLabel: vv.custom_version_label,
          versionNumber: vv.version_number,
          fileName: vv.video_file_name,
          fileSize: vv.video_file_size ? Number(vv.video_file_size) : null,
          playbackUrl: vv.video_playback_url,
          thumbnailUrl: vv.video_thumbnail_url,
          uploadedAt: vv.uploaded_at ?? "",
        });
      }

      return files;
    },
  });
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getVersionLabel(file: ClientFile): string {
  if (file.versionLabel) return file.versionLabel;
  const typeLabel =
    file.versionType === "rough_cut"
      ? "Rough Cut"
      : file.versionType === "final"
        ? "Final"
        : file.versionType === "revision"
          ? "Revision"
          : file.versionType;
  return `${typeLabel} v${file.versionNumber}`;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function ClientFiles({ embedded = false }: { embedded?: boolean }) {
  const { user } = useAuth();
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  useEffect(() => {
    if (embedded) return;
    setHeaderConfig({ title: "My Files" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig, embedded]);

  const { data: clientIds = [], isLoading: accessLoading } = useQuery({
    queryKey: ["client_access", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_access")
        .select("client_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.client_id);
    },
  });

  const clientId = clientIds[0];
  const { data: files = [], isLoading: filesLoading } = useClientFiles(clientId);

  const isLoading = accessLoading || filesLoading;

  // Stats
  const totalSize = useMemo(() => files.reduce((sum, f) => sum + (f.fileSize ?? 0), 0), [files]);

  if (!accessLoading && !clientId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-2xl bg-surface-card p-6 mb-4">
          <FolderOpen className="h-10 w-10 text-foreground-disabled" />
        </div>
        <p className="text-sm text-foreground-muted">Your workspace is being set up.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto px-4 py-5 md:px-6 flex flex-col gap-4 md:gap-6">
      {/* Stats bar */}
      <div className="flex items-center gap-6 text-sm text-foreground-muted">
        <div className="flex items-center gap-2">
          <FileVideo className="h-4 w-4" />
          <span>
            {isLoading ? "—" : files.length} file
            {files.length !== 1 ? "s" : ""}
          </span>
        </div>
        {totalSize > 0 && (
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <span>{formatFileSize(totalSize)}</span>
          </div>
        )}
      </div>

      {/* File list */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-surface-card py-16 text-center">
          <FolderOpen className="mb-3 h-12 w-12 text-foreground-disabled" />
          <p className="text-sm font-medium text-foreground-strong">No files yet</p>
          <p className="mt-1 text-xs text-foreground-muted">
            Video files will appear here as your team uploads versions.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 md:gap-4 rounded-lg border border-border bg-surface-card px-3 py-2.5 md:px-4 md:py-3 transition-colors hover:bg-foreground/[0.03]"
            >
              {/* Thumbnail */}
              <div
                className="h-10 w-10 md:h-12 md:w-12 shrink-0 overflow-hidden rounded-md bg-foreground/[0.08]"
                style={{
                  backgroundImage: file.thumbnailUrl ? `url(${file.thumbnailUrl})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {!file.thumbnailUrl && (
                  <div className="flex h-full w-full items-center justify-center">
                    <FileVideo className="h-5 w-5 text-foreground-disabled" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground-strong">
                  {file.videoTitle}
                </p>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-foreground-muted">
                  <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[11px] font-medium">
                    {getVersionLabel(file)}
                  </span>
                  {file.fileSize && <span>{formatFileSize(file.fileSize)}</span>}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(file.uploadedAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {file.playbackUrl && (
                <Button size="sm" variant="ghost" className="shrink-0" asChild>
                  <a href={file.playbackUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

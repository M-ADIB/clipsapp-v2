/**
 * useUploadThumbnail — uploads an image to the `thumbnails` bucket and
 * inserts a new row into `thumbnail_versions`.
 *
 * Flow:
 *  1. Upload file to `thumbnails/{tenant_id}/{video_id}/{timestamp}.{ext}`
 *  2. Get public URL
 *  3. Compute next version_number
 *  4. Insert into thumbnail_versions with is_current = true (unset previous)
 *  5. Update videos.video_thumbnail_url to the new URL
 *  6. Invalidate thumbnail-versions + videos queries
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { thumbnailVersionsKey } from "./use-thumbnail-versions";

interface UploadThumbnailInput {
  videoId: string;
  file: File;
  versionNotes?: string;
}

export function useUploadThumbnail() {
  const { tenantId, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, file, versionNotes }: UploadThumbnailInput) => {
      if (!tenantId) throw new Error("Not authenticated");

      // 1. Determine file extension & storage path
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const timestamp = Date.now();
      const storagePath = `${tenantId}/${videoId}/${timestamp}.${ext}`;

      // 2. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });
      if (uploadError) throw uploadError;

      // 3. Get public URL
      const { data: urlData } = supabase.storage.from("thumbnails").getPublicUrl(storagePath);
      const thumbnailUrl = urlData.publicUrl;

      // 4. Get next version number
      const { data: existing } = await supabase
        .from("thumbnail_versions")
        .select("version_number")
        .eq("video_id", videoId)
        .eq("tenant_id", tenantId)
        .order("version_number", { ascending: false })
        .limit(1);
      const nextVersion = (existing?.[0]?.version_number ?? 0) + 1;

      // 5. Unset previous current
      await supabase
        .from("thumbnail_versions")
        .update({ is_current: false } as never)
        .eq("video_id", videoId)
        .eq("tenant_id", tenantId);

      // 6. Insert new version
      const { data: newVersion, error: insertError } = await supabase
        .from("thumbnail_versions")
        .insert({
          tenant_id: tenantId,
          video_id: videoId,
          version_number: nextVersion,
          thumbnail_url: thumbnailUrl,
          thumbnail_storage_path: storagePath,
          is_current: true,
          version_notes: versionNotes || null,
          uploaded_by: user?.id || null,
        } as never)
        .select()
        .single();
      if (insertError) throw insertError;

      // 7. Update video's thumbnail URL & storage path to the latest uploaded
      await supabase
        .from("videos")
        .update({
          video_thumbnail_url: thumbnailUrl,
          thumbnail_storage_path: storagePath,
        } as never)
        .eq("id", videoId);

      return newVersion;
    },
    onSuccess: (_data, variables) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: thumbnailVersionsKey(variables.videoId) });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["video-meta", variables.videoId] });
    },
  });
}

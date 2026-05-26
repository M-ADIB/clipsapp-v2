/**
 * ThumbnailViewer — full-resolution image display with annotation overlay.
 *
 * Shows the thumbnail centered on a dark background with object-contain.
 * Overlays the AnnotationCanvas / AnnotationToolbar from the video preview
 * system, adapted for static images (no video player).
 */
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { AnnotationCanvas } from "@/components/video/preview/annotations/AnnotationCanvas";
import { AnnotationToolbar } from "@/components/video/preview/annotations/AnnotationToolbar";
import {
  ANNOTATION_COLORS,
  type AnnotationStroke,
  type AnnotationTool,
} from "@/components/video/preview/annotations/types";
import { useVideoAnnotations } from "@/components/video/preview/hooks/use-video-annotations";

interface ThumbnailViewerProps {
  thumbnailUrl: string;
  videoId: string;
  versionId: string | null;
  canAnnotate: boolean;
  /** Pass addComment.mutateAsync for anchoring annotations to comments. */
  addCommentAsync?: (input: { comment: string; versionId?: string | null }) => Promise<unknown>;
}

export function ThumbnailViewer({
  thumbnailUrl,
  videoId,
  versionId,
  canAnnotate,
  addCommentAsync,
}: ThumbnailViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Annotation state
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationTool, setAnnotationTool] = useState<AnnotationTool>("pen");
  const [annotationColor, setAnnotationColor] = useState(ANNOTATION_COLORS[0].value);
  const [draftStrokes, setDraftStrokes] = useState<AnnotationStroke[]>([]);
  const [savingAnnotation, setSavingAnnotation] = useState(false);

  const { annotations, saveAnnotation } = useVideoAnnotations(videoId);

  // Filter annotations for this thumbnail version
  const versionAnnotations = annotations.filter((a) => !a.version_id || a.version_id === versionId);

  // Flatten saved strokes for read-only display
  const savedStrokes = versionAnnotations.flatMap((a) => a.annotation_data?.strokes ?? []);

  const startAnnotating = useCallback(() => {
    setDraftStrokes([]);
    setIsAnnotating(true);
  }, []);

  const cancelAnnotating = useCallback(() => {
    setIsAnnotating(false);
    setDraftStrokes([]);
  }, []);

  const undoStroke = useCallback(() => {
    setDraftStrokes((prev) => prev.slice(0, -1));
  }, []);

  const clearStrokes = useCallback(() => {
    setDraftStrokes([]);
  }, []);

  const handleSave = useCallback(async () => {
    if (draftStrokes.length === 0) return;
    setSavingAnnotation(true);
    try {
      // Create comment to anchor the annotation
      let commentId: string | null = null;
      if (addCommentAsync) {
        const commentRes = await addCommentAsync({
          comment: "📝 Thumbnail annotation",
          versionId,
        });
        commentId = (commentRes as { id?: string })?.id ?? null;
      }

      // Save the annotation
      await saveAnnotation.mutateAsync({
        annotationData: { version: 1, strokes: draftStrokes },
        frameTimestamp: 0, // Static image — always frame 0
        commentId,
        versionId,
      });

      toast.success("Annotation saved");
      setIsAnnotating(false);
      setDraftStrokes([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save annotation");
    } finally {
      setSavingAnnotation(false);
    }
  }, [addCommentAsync, draftStrokes, saveAnnotation, versionId]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Image + annotation area */}
      <div
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center bg-black/90 rounded-lg overflow-hidden min-h-0"
      >
        <img
          src={thumbnailUrl}
          alt="Thumbnail preview"
          className="max-h-full max-w-full object-contain select-none"
          draggable={false}
        />

        {/* Saved annotation overlay (always visible, non-interactive) */}
        {savedStrokes.length > 0 && !isAnnotating && (
          <div className="absolute inset-0 pointer-events-none">
            <AnnotationCanvas
              baseStrokes={savedStrokes}
              draftStrokes={[]}
              onDraftChange={() => {}}
              tool="pen"
              color="#fff"
              enabled={false}
            />
          </div>
        )}

        {/* Draft annotation canvas (interactive when drawing) */}
        {isAnnotating && (
          <div className="absolute inset-0">
            <AnnotationCanvas
              baseStrokes={savedStrokes}
              draftStrokes={draftStrokes}
              onDraftChange={setDraftStrokes}
              tool={annotationTool}
              color={annotationColor}
              enabled
            />
          </div>
        )}

        {/* Annotation toolbar (floating above image when drawing) */}
        {isAnnotating && (
          <AnnotationToolbar
            tool={annotationTool}
            onToolChange={setAnnotationTool}
            color={annotationColor}
            onColorChange={setAnnotationColor}
            canUndo={draftStrokes.length > 0}
            canSave={draftStrokes.length > 0}
            onUndo={undoStroke}
            onClear={clearStrokes}
            onSave={handleSave}
            onCancel={cancelAnnotating}
            saving={savingAnnotation}
          />
        )}

        {/* Start annotate button — bottom-left when NOT annotating */}
        {canAnnotate && !isAnnotating && (
          <button
            type="button"
            onClick={startAnnotating}
            className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur px-3 py-1.5 text-xs font-medium text-foreground shadow-lg border border-border/60 hover:bg-background transition-colors"
            aria-label="Draw annotation"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
            </svg>
            Annotate
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * usePreviewAnnotations — manages annotation drawing state and save workflow.
 *
 * Extracted from VideoPreviewModal to keep the parent component lean.
 */
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { useVideoAnnotations } from "./use-video-annotations";
import {
  ANNOTATION_COLORS,
  type AnnotationStroke,
  type AnnotationTool,
} from "../annotations/types";

interface UsePreviewAnnotationsOptions {
  open: boolean;
  videoId: string | null;
  commentsEnabled: boolean;
  isModerator: boolean;
  selectedVersionId: string | null;
  player: {
    currentTime: number;
    pause: () => void;
  };
  /** Must be addComment.mutateAsync */
  addCommentAsync: (input: {
    comment: string;
    timestampSeconds?: number | null;
    versionId?: string | null;
  }) => Promise<unknown>;
}

export function usePreviewAnnotations({
  open,
  videoId,
  commentsEnabled,
  isModerator,
  selectedVersionId,
  player,
  addCommentAsync,
}: UsePreviewAnnotationsOptions) {
  const annotationsEnabled = commentsEnabled && isModerator;

  const { annotations: allAnnotations, saveAnnotation } = useVideoAnnotations(
    open && commentsEnabled ? videoId : null,
  );

  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationTool, setAnnotationTool] = useState<AnnotationTool>("pen");
  const [annotationColor, setAnnotationColor] = useState<string>(ANNOTATION_COLORS[0].value);
  const [draftStrokes, setDraftStrokes] = useState<AnnotationStroke[]>([]);
  const [annotationFrame, setAnnotationFrame] = useState<number>(0);
  const [savingAnnotation, setSavingAnnotation] = useState(false);

  const startAnnotating = useCallback(() => {
    if (!annotationsEnabled) return;
    player.pause();
    setAnnotationFrame(player.currentTime);
    setDraftStrokes([]);
    setIsAnnotating(true);
  }, [annotationsEnabled, player]);

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

  const saveAnnotationDraft = useCallback(async () => {
    if (draftStrokes.length === 0) return;
    setSavingAnnotation(true);
    try {
      // 1) Create a comment to anchor the annotation.
      const commentRes = await addCommentAsync({
        comment: "📝 Annotation",
        timestampSeconds: annotationFrame,
        versionId: selectedVersionId,
      });
      const commentId = (commentRes as { id?: string })?.id ?? null;

      // 2) Save the annotation linked to the comment.
      await saveAnnotation.mutateAsync({
        annotationData: { version: 1, strokes: draftStrokes },
        frameTimestamp: annotationFrame,
        commentId,
        versionId: selectedVersionId,
      });

      toast.success("Annotation saved");
      setIsAnnotating(false);
      setDraftStrokes([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save annotation");
    } finally {
      setSavingAnnotation(false);
    }
  }, [addCommentAsync, annotationFrame, draftStrokes, saveAnnotation, selectedVersionId]);

  return {
    annotationsEnabled,
    allAnnotations,
    isAnnotating,
    annotationTool,
    setAnnotationTool,
    annotationColor,
    setAnnotationColor,
    draftStrokes,
    setDraftStrokes,
    savingAnnotation,
    startAnnotating,
    cancelAnnotating,
    undoStroke,
    clearStrokes,
    saveAnnotationDraft,
  };
}

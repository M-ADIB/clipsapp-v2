/**
 * useVoiceRecorder — MediaRecorder wrapper for voice note comments.
 *
 * Records audio from the user's microphone, produces a Blob, and uploads
 * it to Supabase Storage (`video-voice-notes` bucket). Returns the public
 * URL for embedding in a comment.
 *
 * Key design decisions:
 *  - No `timeslice` on `start()` — collect all data in the `onstop` event
 *    to avoid corrupt chunk boundaries that break playback.
 *  - Explicit stream track stopping in `stop()`, `cancel()`, AND unmount
 *    cleanup to guarantee the mic indicator turns off.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/** Maximum voice note recording duration in seconds. */
const MAX_DURATION_SECONDS = 120;

interface VoiceRecorderState {
  isRecording: boolean;
  isUploading: boolean;
  /** Elapsed recording time in seconds. */
  duration: number;
  start: () => Promise<void>;
  /** Stops recording, uploads, and returns the public audio URL. */
  stop: () => Promise<string | null>;
  /** Cancels recording without saving. */
  cancel: () => void;
}

/** Kill all tracks on a MediaStream to turn off the mic indicator. */
function killStream(stream: MediaStream | null) {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    track.stop();
    track.enabled = false;
  });
}

export function useVoiceRecorder(videoId: string | null): VoiceRecorderState {
  const { tenantId } = useAuth();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);

  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState(0);

  // ─── Cleanup on unmount — ALWAYS stop the mic ────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
      const rec = mediaRecorderRef.current;
      if (rec && rec.state !== "inactive") {
        try {
          rec.stop();
        } catch {
          /* already stopped */
        }
      }
      killStream(streamRef.current);
      streamRef.current = null;
      mediaRecorderRef.current = null;
    };
  }, []);

  // ─── Start recording ─────────────────────────────────────────────
  const start = useCallback(async () => {
    // Clean up any previous session
    killStream(streamRef.current);
    streamRef.current = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      // Pick best available codec
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      // Start recording WITHOUT timeslice — collect all data in onstop
      // This avoids the chunk-boundary corruption issue.
      recorder.start();
      setIsRecording(true);
      setDuration(0);

      // Duration timer
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
      }, 500);

      // Auto-stop after MAX_DURATION_SECONDS
      autoStopTimerRef.current = setTimeout(() => {
        toast.info(`Voice note reached ${MAX_DURATION_SECONDS / 60} min limit — auto-stopped.`);
        // The stop() callback is not available here directly, so we just
        // stop the recorder which triggers onstop and data collection.
        const rec = mediaRecorderRef.current;
        if (rec && rec.state !== "inactive") {
          try {
            rec.stop();
          } catch {
            /* already stopped */
          }
        }
      }, MAX_DURATION_SECONDS * 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Microphone access denied";
      toast.error("Cannot record voice note", { description: msg });
    }
  }, []);

  // ─── Stop recording & upload ─────────────────────────────────────
  const stop = useCallback(async (): Promise<string | null> => {
    // Stop timers immediately
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      killStream(streamRef.current);
      streamRef.current = null;
      setIsRecording(false);
      return null;
    }

    // Wrap the async onstop flow in a promise
    const blob = await new Promise<Blob | null>((resolve) => {
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        // Immediately kill the mic
        killStream(streamRef.current);
        streamRef.current = null;

        if (chunks.length === 0) {
          resolve(null);
          return;
        }
        resolve(
          new Blob(chunks, {
            type: recorder.mimeType || "audio/webm",
          }),
        );
      };

      recorder.stop();
    });

    setIsRecording(false);
    mediaRecorderRef.current = null;

    if (!blob || blob.size === 0) return null;

    // Upload to Supabase Storage
    setIsUploading(true);
    try {
      const ext = blob.type.includes("mp4") ? "m4a" : "webm";
      const fileName = `${tenantId}/${videoId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("video-voice-notes")
        .upload(fileName, blob, {
          contentType: blob.type || "audio/webm",
          upsert: false,
        });

      if (uploadError) {
        // Bucket may not exist — fall back to inline data URL
        console.warn("Voice note upload failed, using inline fallback:", uploadError);
        const dataUrl = await blobToDataUrl(blob);
        return dataUrl;
      }

      const { data: urlData } = supabase.storage.from("video-voice-notes").getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err) {
      console.error("Voice note upload error:", err);
      toast.error("Failed to upload voice note");
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [tenantId, videoId]);

  // ─── Cancel recording ────────────────────────────────────────────
  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      // Discard data
      recorder.ondataavailable = null;
      recorder.onstop = null;
      try {
        recorder.stop();
      } catch {
        /* already stopped */
      }
    }
    mediaRecorderRef.current = null;

    // Kill the mic
    killStream(streamRef.current);
    streamRef.current = null;

    setIsRecording(false);
    setDuration(0);
  }, []);

  return {
    isRecording,
    isUploading,
    duration,
    start,
    stop,
    cancel,
  };
}

/** Convert a Blob to a data: URL. */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

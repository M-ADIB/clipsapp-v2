/**
 * useChatVoiceRecorder — MediaRecorder wrapper for chat voice messages.
 *
 * Adapted from the video preview VoiceNoteRecorder pattern.
 * Records audio from the user's microphone, produces a Blob, and uploads
 * it to Supabase Storage (`chat-attachments` bucket). Returns the URL + type
 * for embedding as a chat attachment.
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

export interface ChatVoiceRecorderState {
  isRecording: boolean;
  isUploading: boolean;
  /** Elapsed recording time in seconds. */
  duration: number;
  start: () => Promise<void>;
  /** Stops recording, uploads, and returns { url, type } or null. */
  stop: () => Promise<{ url: string; type: string; name: string } | null>;
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

export function useChatVoiceRecorder(): ChatVoiceRecorderState {
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

      // Start recording WITHOUT timeslice
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
  const stop = useCallback(async (): Promise<{
    url: string;
    type: string;
    name: string;
  } | null> => {
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

    // Upload to Supabase Storage (chat-attachments bucket)
    setIsUploading(true);
    try {
      const ext = blob.type.includes("mp4") ? "m4a" : "webm";
      const fileName = `voice-notes/${tenantId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-attachments")
        .upload(fileName, blob, {
          contentType: blob.type || "audio/webm",
          upsert: false,
        });

      if (uploadError) {
        console.error("Voice note upload failed:", uploadError);
        toast.error("Failed to upload voice note");
        return null;
      }

      const { data: urlData } = supabase.storage.from("chat-attachments").getPublicUrl(fileName);

      return {
        url: urlData.publicUrl,
        type: blob.type || "audio/webm",
        name: `voice-note.${ext}`,
      };
    } catch (err) {
      console.error("Voice note upload error:", err);
      toast.error("Failed to upload voice note");
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [tenantId]);

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
      recorder.ondataavailable = null;
      recorder.onstop = null;
      try {
        recorder.stop();
      } catch {
        /* already stopped */
      }
    }
    mediaRecorderRef.current = null;

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

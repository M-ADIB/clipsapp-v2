/**
 * useUploadManager — React hook to subscribe to upload state.
 *
 * Usage:
 * ```tsx
 * const { jobs, addFile, pause, resume, cancel, retry, clearCompleted, isOnline } = useUploadManager();
 * ```
 */

import { useCallback, useSyncExternalStore } from "react";
import { uploadManager } from "@/lib/upload";
import type { UploadJob } from "@/lib/upload";

export function useUploadManager() {
  const jobs = useSyncExternalStore(
    (callback) => uploadManager.subscribe(callback),
    () => uploadManager.getJobs(),
    () => uploadManager.getJobs(),
  );

  const addFile = useCallback((file: File, videoId: string, versionId: string) => {
    return uploadManager.addFile(file, videoId, versionId);
  }, []);

  const pause = useCallback((jobId: string) => {
    uploadManager.pause(jobId);
  }, []);

  const resume = useCallback((jobId: string) => {
    uploadManager.resume(jobId);
  }, []);

  const cancel = useCallback((jobId: string) => {
    uploadManager.cancel(jobId);
  }, []);

  const retry = useCallback((jobId: string) => {
    uploadManager.retry(jobId);
  }, []);

  const remove = useCallback((jobId: string) => {
    uploadManager.remove(jobId);
  }, []);

  const cancelAll = useCallback((reason?: string) => {
    uploadManager.cancelAllActive(reason);
  }, []);

  const clearCompleted = useCallback(() => {
    uploadManager.clearCompleted();
  }, []);

  const recoverStaleSessions = useCallback(() => {
    return uploadManager.recoverStaleSessions();
  }, []);

  const activeCount = jobs.filter(
    (j) => j.status === "uploading" || j.status === "processing",
  ).length;

  const completedCount = jobs.filter(
    (j) => j.status === "completed" || j.status === "failed" || j.status === "cancelled",
  ).length;

  const hasActiveUploads = activeCount > 0;

  const isOnline = uploadManager.getIsOnline();

  return {
    jobs,
    addFile,
    pause,
    resume,
    cancel,
    retry,
    remove,
    cancelAll,
    clearCompleted,
    recoverStaleSessions,
    activeCount,
    completedCount,
    hasActiveUploads,
    isOnline,
  };
}

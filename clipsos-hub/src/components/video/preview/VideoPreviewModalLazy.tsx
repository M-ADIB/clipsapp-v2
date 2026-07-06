import { Suspense, lazy, useEffect, useState } from "react";

import type { VideoPreviewModalProps } from "./VideoPreviewModal";

/**
 * Lazy-loaded VideoPreviewModal.
 *
 * The real modal pulls in hls.js + the full review UI (~1.3 MB chunk). It is
 * always mounted by its parents but controlled by `open`, so we defer loading
 * the chunk until the modal is first opened:
 *
 *   - Before the first open, this renders `null` — so nothing loads on the
 *     initial page render (and SSR renders null, avoiding any lazy/Suspense
 *     server boundary on the authenticated dashboards).
 *   - On first open we mount the lazy inner and keep it mounted afterwards,
 *     so subsequent open/close transitions behave exactly as before.
 *
 * NOTE: intentionally NOT used on the public guest-share (`/r/*`) routes, which
 * render the modal eagerly; those keep the direct import.
 */
const VideoPreviewModalInner = lazy(() =>
  import("./VideoPreviewModal").then((m) => ({ default: m.VideoPreviewModal })),
);

export function VideoPreviewModal(props: VideoPreviewModalProps) {
  const [everOpened, setEverOpened] = useState(props.open);

  useEffect(() => {
    if (props.open) setEverOpened(true);
  }, [props.open]);

  if (!everOpened) return null;

  return (
    <Suspense fallback={null}>
      <VideoPreviewModalInner {...props} />
    </Suspense>
  );
}

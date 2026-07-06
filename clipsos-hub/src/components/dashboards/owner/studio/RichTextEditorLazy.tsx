import { Suspense, lazy, useEffect, useState } from "react";

import type { RichTextEditorProps } from "./RichTextEditor";

/**
 * Lazy-loaded RichTextEditor.
 *
 * The TipTap editor + its extensions are a ~976 kB chunk. It's rendered inline
 * inside authenticated editing surfaces, so we can't null-gate it like a modal.
 * Instead we use the client-only mount pattern: server and first client render
 * both show a lightweight skeleton (so hydration matches and no lazy/Suspense
 * boundary is hit during SSR), then the editor chunk loads after mount. TipTap
 * is client-only anyway (ProseMirror needs the DOM), so no editor content was
 * being meaningfully server-rendered before.
 */
const RichTextEditorInner = lazy(() =>
  import("./RichTextEditor").then((m) => ({ default: m.RichTextEditor })),
);

function EditorSkeleton({ minHeight = "400px" }: { minHeight?: string }) {
  return (
    <div
      style={{ minHeight }}
      aria-busy="true"
      className="w-full rounded-xl border border-border bg-background animate-pulse"
    />
  );
}

export function RichTextEditor(props: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <EditorSkeleton minHeight={props.minHeight} />;

  return (
    <Suspense fallback={<EditorSkeleton minHeight={props.minHeight} />}>
      <RichTextEditorInner {...props} />
    </Suspense>
  );
}

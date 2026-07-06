import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const upsert = mock(async (_p: unknown) => {});
mock.module("@/hooks/use-closer-region", () => ({
  useCloserRegion: () => ({ data: null, isLoading: false }),
  useUpsertCloserRegion: () => ({ mutateAsync: upsert, isPending: false }),
  useSyncCalendlyEvents: () => ({ mutateAsync: async () => ({ synced: 0 }), isPending: false }),
}));

import { CalendlySettingsDialog } from "./CalendlySettingsDialog";

afterEach(() => {
  cleanup();
  upsert.mockClear();
});

describe("CalendlySettingsDialog", () => {
  it("requires an API key", async () => {
    render(<CalendlySettingsDialog open onOpenChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Save & Sync/i }));
    await waitFor(() =>
      expect(screen.getByText("Please enter your Calendly API key.")).toBeDefined(),
    );
    expect(upsert).not.toHaveBeenCalled();
  });

  it("saves the trimmed API key", async () => {
    render(<CalendlySettingsDialog open onOpenChange={() => {}} />);
    fireEvent.change(screen.getByLabelText(/Personal Access Token/i), {
      target: { value: "  tok_123  " },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save & Sync/i }));
    await waitFor(() => expect(upsert).toHaveBeenCalledTimes(1));
    const payload = upsert.mock.calls[0][0] as { calendly_api_key: string };
    expect(payload.calendly_api_key).toBe("tok_123");
  });
});

import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const updateSettings = mock(async (_p: unknown) => {});
mock.module("@/hooks/use-tenant-settings", () => ({
  useTenantSettings: () => ({ settings: null, isUpdating: false, updateSettings }),
}));

import { SlackSettingsDialog } from "./SlackSettingsDialog";
import { ResendSettingsDialog } from "./ResendSettingsDialog";
import { StripeSettingsDialog } from "./StripeSettingsDialog";

afterEach(() => {
  cleanup();
  updateSettings.mockClear();
});

describe("SlackSettingsDialog", () => {
  it("saves the webhook url on submit", async () => {
    render(<SlackSettingsDialog open onOpenChange={() => {}} />);
    fireEvent.change(screen.getByLabelText(/Incoming Webhook URL/i), {
      target: { value: "https://hooks.slack.com/services/x" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save Settings/i }));
    await waitFor(() => expect(updateSettings).toHaveBeenCalledTimes(1));
    const payload = updateSettings.mock.calls[0][0] as { slack_webhook_url: string };
    expect(payload.slack_webhook_url).toBe("https://hooks.slack.com/services/x");
  });
});

describe("ResendSettingsDialog", () => {
  it("saves the api key + from email on submit", async () => {
    render(<ResendSettingsDialog open onOpenChange={() => {}} />);
    fireEvent.change(screen.getByLabelText(/Resend API Key/i), { target: { value: "re_abc" } });
    fireEvent.click(screen.getByRole("button", { name: /Save Settings/i }));
    await waitFor(() => expect(updateSettings).toHaveBeenCalledTimes(1));
    const payload = updateSettings.mock.calls[0][0] as { resend_api_key: string };
    expect(payload.resend_api_key).toBe("re_abc");
  });
});

describe("StripeSettingsDialog", () => {
  it("saves stripe keys on submit", async () => {
    render(<StripeSettingsDialog open onOpenChange={() => {}} />);
    fireEvent.change(screen.getByLabelText(/Publishable Key/i), { target: { value: "pk_live_x" } });
    fireEvent.click(screen.getByRole("button", { name: /Save Settings/i }));
    await waitFor(() => expect(updateSettings).toHaveBeenCalledTimes(1));
    const payload = updateSettings.mock.calls[0][0] as { stripe_public_key: string };
    expect(payload.stripe_public_key).toBe("pk_live_x");
  });
});

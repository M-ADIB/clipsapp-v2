import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const linkMutate = mock((_p: unknown, _o: unknown) => {});
mock.module("@/hooks/data", () => ({ useClients: () => ({ data: [] }) }));
mock.module("@/hooks/use-stripe-actions", () => ({
  useCreatePaymentLink: () => ({ mutate: linkMutate, isPending: false }),
}));

import { SendPaymentLinkDialog } from "./SendPaymentLinkDialog";

afterEach(() => {
  cleanup();
  linkMutate.mockClear();
});

describe("SendPaymentLinkDialog", () => {
  it("requires client + valid amount", async () => {
    render(<SendPaymentLinkDialog open onOpenChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Generate Link/i }));
    await waitFor(() => expect(screen.getByText("Client is required")).toBeDefined());
    expect(linkMutate).not.toHaveBeenCalled();
  });

  it("converts the amount to cents on submit", async () => {
    render(<SendPaymentLinkDialog open onOpenChange={() => {}} preselectedClientId="c1" />);
    fireEvent.change(screen.getByLabelText("Amount"), { target: { value: "50" } });
    fireEvent.click(screen.getByRole("button", { name: /Generate Link/i }));
    await waitFor(() => expect(linkMutate).toHaveBeenCalledTimes(1));
    const payload = linkMutate.mock.calls[0][0] as { amount: number; client_id: string };
    expect(payload.amount).toBe(5000);
    expect(payload.client_id).toBe("c1");
  });
});

import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const recordMutate = mock((_p: unknown, _o: unknown) => {});
mock.module("@/hooks/data", () => ({ useClients: () => ({ data: [] }) }));
mock.module("@/hooks/use-stripe-actions", () => ({
  useRecordPayment: () => ({ mutate: recordMutate, isPending: false }),
}));
mock.module("@/hooks/use-finance", () => ({
  useUpdateFinanceTransaction: () => ({ mutate: () => {}, isPending: false }),
}));

import { RecordPaymentDialog } from "./RecordPaymentDialog";

afterEach(() => {
  cleanup();
  recordMutate.mockClear();
});

describe("RecordPaymentDialog", () => {
  it("requires a client and a positive amount", async () => {
    render(<RecordPaymentDialog open onOpenChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Record Payment/i }));
    await waitFor(() => expect(screen.getByText("Client is required")).toBeDefined());
    expect(recordMutate).not.toHaveBeenCalled();
  });

  it("rejects a non-positive amount", async () => {
    render(<RecordPaymentDialog open onOpenChange={() => {}} preselectedClientId="c1" />);
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: /Record Payment/i }));
    await waitFor(() => expect(screen.getByText("Enter a valid amount")).toBeDefined());
    expect(recordMutate).not.toHaveBeenCalled();
  });

  it("records the payment when client + amount are valid", async () => {
    render(<RecordPaymentDialog open onOpenChange={() => {}} preselectedClientId="c1" />);
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: "5000" } });
    fireEvent.click(screen.getByRole("button", { name: /Record Payment/i }));
    await waitFor(() => expect(recordMutate).toHaveBeenCalledTimes(1));
    const payload = recordMutate.mock.calls[0][0] as { client_id: string; amount: number };
    expect(payload.client_id).toBe("c1");
    expect(payload.amount).toBe(5000);
  });
});

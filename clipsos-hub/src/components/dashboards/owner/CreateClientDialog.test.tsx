import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const mutateAsync = mock(async (_p: unknown) => {});
mock.module("@/hooks/data", () => ({
  useCreateClient: () => ({ mutateAsync, isPending: false }),
}));

import { CreateClientDialog } from "./CreateClientDialog";

afterEach(() => {
  cleanup();
  mutateAsync.mockClear();
});

describe("CreateClientDialog", () => {
  it("requires a client name", async () => {
    render(<CreateClientDialog open onOpenChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Create Client/i }));
    await waitFor(() => expect(screen.getByText("Client name is required")).toBeDefined());
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("rejects a malformed email", async () => {
    render(<CreateClientDialog open onOpenChange={() => {}} />);
    fireEvent.change(screen.getByLabelText(/Client Name/i), { target: { value: "Acme" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "bad" } });
    fireEvent.click(screen.getByRole("button", { name: /Create Client/i }));
    await waitFor(() => expect(screen.getByText("Invalid email address")).toBeDefined());
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("submits the mapped payload when valid", async () => {
    render(<CreateClientDialog open onOpenChange={() => {}} />);
    fireEvent.change(screen.getByLabelText(/Client Name/i), { target: { value: "  Acme  " } });
    fireEvent.change(screen.getByLabelText(/Videos \/ month/i), { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: /Create Client/i }));
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    const payload = mutateAsync.mock.calls[0][0] as {
      name: string;
      videos_per_month: number | null;
      email: string | null;
    };
    expect(payload.name).toBe("Acme");
    expect(payload.videos_per_month).toBe(8);
    expect(payload.email).toBeNull();
  });
});

import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

// Mock the data hooks so the dialog renders without a backend.
const createMutate = mock((_payload: unknown, _opts: unknown) => {});
mock.module("@/hooks/data", () => ({
  useCreateCrmDeal: () => ({ mutate: createMutate, isPending: false }),
  useCrmPeople: () => ({ data: [] }),
}));

import { NewDealDialog } from "./NewDealDialog";

afterEach(() => {
  cleanup();
  createMutate.mockClear();
});

describe("NewDealDialog", () => {
  it("blocks submit and shows an error when the name is empty", async () => {
    render(<NewDealDialog open onOpenChange={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /Create Deal/i }));

    await waitFor(() => {
      expect(screen.getByText("Deal name is required")).toBeDefined();
    });
    expect(createMutate).not.toHaveBeenCalled();
  });

  it("submits the mutation with the deal name when valid", async () => {
    render(<NewDealDialog open onOpenChange={() => {}} />);

    fireEvent.change(screen.getByLabelText("Deal Name"), {
      target: { value: "Acme Corp — 12 Videos" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create Deal/i }));

    await waitFor(() => {
      expect(createMutate).toHaveBeenCalledTimes(1);
    });
    const payload = createMutate.mock.calls[0][0] as { name: string; stage: string };
    expect(payload.name).toBe("Acme Corp — 12 Videos");
    expect(payload.stage).toBe("No Stage");
  });
});

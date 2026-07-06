import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

// CostsTab imports operating-cost hooks at module load; stub them so the file
// (which also exports CostDialog) can be imported without a backend.
mock.module("@/hooks/use-operating-costs", () => ({
  useOperatingCosts: () => ({ data: [] }),
  useCreateOperatingCost: () => ({ mutateAsync: async () => {}, isPending: false }),
  useUpdateOperatingCost: () => ({ mutateAsync: async () => {}, isPending: false }),
  useDeleteOperatingCost: () => ({ mutate: () => {}, isPending: false }),
}));

import { CostDialog } from "./CostsTab";

afterEach(() => cleanup());

describe("CostDialog", () => {
  it("requires name and amount", async () => {
    const onSave = mock(() => {});
    render(<CostDialog open onClose={() => {}} onSave={onSave} saving={false} />);
    fireEvent.click(screen.getByRole("button", { name: /Add Cost/i }));
    await waitFor(() => expect(screen.getByText("Name is required")).toBeDefined());
    expect(onSave).not.toHaveBeenCalled();
  });

  it("calls onSave with parsed amount when valid", async () => {
    const onSave = mock((_d: unknown) => {});
    render(<CostDialog open onClose={() => {}} onSave={onSave} saving={false} />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Cap Cut" } });
    fireEvent.change(screen.getByLabelText("Amount"), { target: { value: "49.99" } });
    fireEvent.click(screen.getByRole("button", { name: /Add Cost/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const data = onSave.mock.calls[0][0] as { name: string; amount: number };
    expect(data.name).toBe("Cap Cut");
    expect(data.amount).toBe(49.99);
  });
});

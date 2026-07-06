import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const updateMutate = mock((_payload: unknown, _opts: unknown) => {});
mock.module("@/hooks/data", () => ({
  useUpdateCrmDeal: () => ({ mutate: updateMutate, isPending: false }),
}));

import { EditDealDialog } from "./EditDealDialog";

const deal = {
  id: "d1",
  name: "Acme",
  plan: "Pro 8",
  stage: "Payment Pending",
  personName: "Jane",
  region: "UAE",
  totalVideos: 8,
  notes: "hi",
};

afterEach(() => {
  cleanup();
  updateMutate.mockClear();
});

describe("EditDealDialog", () => {
  it("hydrates the form from the deal prop", () => {
    render(<EditDealDialog open onOpenChange={() => {}} deal={deal} />);
    expect((screen.getByLabelText("Deal Name") as HTMLInputElement).value).toBe("Acme");
  });

  it("submits an update with the edited name + deal id", async () => {
    render(<EditDealDialog open onOpenChange={() => {}} deal={deal} />);

    fireEvent.change(screen.getByLabelText("Deal Name"), { target: { value: "Acme 2" } });
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => expect(updateMutate).toHaveBeenCalledTimes(1));
    const payload = updateMutate.mock.calls[0][0] as { id: string; name: string };
    expect(payload.id).toBe("d1");
    expect(payload.name).toBe("Acme 2");
  });

  it("blocks update when the name is cleared", async () => {
    render(<EditDealDialog open onOpenChange={() => {}} deal={deal} />);

    fireEvent.change(screen.getByLabelText("Deal Name"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => expect(screen.getByText("Deal name is required")).toBeDefined());
    expect(updateMutate).not.toHaveBeenCalled();
  });
});

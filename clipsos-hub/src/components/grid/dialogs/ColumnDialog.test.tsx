import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const saveMutate = mock(async (_a: unknown) => {});
mock.module("@/hooks/use-custom-columns", () => ({
  useCustomColumn: () => ({ data: null }),
  useSaveCustomColumn: () => ({ mutateAsync: saveMutate, isPending: false }),
}));

import { ColumnDialog } from "./ColumnDialog";

afterEach(() => {
  cleanup();
  saveMutate.mockClear();
});

describe("ColumnDialog", () => {
  it("requires a field name", async () => {
    render(<ColumnDialog open onOpenChange={() => {}} onSaved={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Add field/i }));
    await waitFor(() => expect(screen.getByText("Name is required")).toBeDefined());
    expect(saveMutate).not.toHaveBeenCalled();
  });

  it("saves the trimmed field name + type", async () => {
    render(<ColumnDialog open onOpenChange={() => {}} onSaved={() => {}} />);
    fireEvent.change(screen.getByLabelText("Field name"), { target: { value: "  Hook Score " } });
    fireEvent.click(screen.getByRole("button", { name: /Add field/i }));
    await waitFor(() => expect(saveMutate).toHaveBeenCalledTimes(1));
    const arg = saveMutate.mock.calls[0][0] as {
      input: { column_name: string; column_type: string };
    };
    expect(arg.input.column_name).toBe("Hook Score");
    expect(arg.input.column_type).toBe("text");
  });
});

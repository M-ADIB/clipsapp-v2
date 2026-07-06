import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { GuestGateDialog } from "./GuestGateDialog";

afterEach(() => cleanup());

describe("GuestGateDialog", () => {
  it("renders the name + email fields", () => {
    render(<GuestGateDialog onComplete={() => {}} />);
    expect(screen.getByLabelText("Your Name")).toBeDefined();
    expect(screen.getByLabelText("Email Address")).toBeDefined();
  });

  it("shows validation errors and does not call onComplete on empty submit", async () => {
    const onComplete = mock(() => {});
    render(<GuestGateDialog onComplete={onComplete} />);

    fireEvent.submit(screen.getByRole("button", { name: /Access Video Review/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Please enter your name")).toBeDefined();
    });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("rejects a malformed email", async () => {
    const onComplete = mock(() => {});
    render(<GuestGateDialog onComplete={onComplete} />);

    fireEvent.change(screen.getByLabelText("Your Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "nope" } });
    fireEvent.submit(screen.getByRole("button", { name: /Access Video Review/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid email address")).toBeDefined();
    });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("calls onComplete with trimmed values on valid submit", async () => {
    const onComplete = mock((_info: { name: string; email: string }) => {});
    render(<GuestGateDialog onComplete={onComplete} />);

    fireEvent.change(screen.getByLabelText("Your Name"), { target: { value: "  Jane Doe " } });
    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: " jane@example.com " },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Access Video Review/i }).closest("form")!);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
    expect(onComplete.mock.calls[0][0]).toEqual({ name: "Jane Doe", email: "jane@example.com" });
  });
});

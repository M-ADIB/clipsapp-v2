import { describe, expect, it } from "bun:test";

import { areCellPropsEqual, type CellProps } from "./CellRenderer";

// Minimal prop factory; the comparator only looks at the data fields.
const col = { id: "c1", type: "text" } as unknown as CellProps["column"];
const row = { id: "r1" } as unknown as CellProps["row"];
const noop = () => {};

function props(over: Partial<CellProps> = {}): CellProps {
  return {
    column: col,
    value: "a",
    row,
    isEditing: false,
    isReadOnly: false,
    density: "regular",
    onCommit: noop,
    onCancel: noop,
    onBeginEdit: noop,
    ...over,
  };
}

describe("areCellPropsEqual", () => {
  it("is equal when data props match, even if callbacks differ (the whole point)", () => {
    const a = props({ onCommit: () => {}, onBeginEdit: () => {} });
    const b = props({ onCommit: () => {}, onBeginEdit: () => {} });
    expect(areCellPropsEqual(a, b)).toBe(true);
  });

  it("is NOT equal when the value changes", () => {
    expect(areCellPropsEqual(props({ value: "a" }), props({ value: "b" }))).toBe(false);
  });

  it("is NOT equal when the row reference changes (immutable data => real change)", () => {
    const otherRow = { id: "r1" } as unknown as CellProps["row"];
    expect(areCellPropsEqual(props(), props({ row: otherRow }))).toBe(false);
  });

  it("is NOT equal when isEditing / isReadOnly / density change", () => {
    expect(areCellPropsEqual(props(), props({ isEditing: true }))).toBe(false);
    expect(areCellPropsEqual(props(), props({ isReadOnly: true }))).toBe(false);
    expect(areCellPropsEqual(props(), props({ density: "compact" }))).toBe(false);
  });

  it("is NOT equal when the column reference changes", () => {
    const otherCol = { id: "c1", type: "text" } as unknown as CellProps["column"];
    expect(areCellPropsEqual(props(), props({ column: otherCol }))).toBe(false);
  });
});

import { describe, expect, it } from "bun:test";

import { PRIORITY_STYLES, priorityStyle } from "./priority-styles";

describe("priorityStyle", () => {
  it("returns the matching style for known priorities", () => {
    expect(priorityStyle("high")).toBe(PRIORITY_STYLES.high);
    expect(priorityStyle("medium").label).toBe("Medium");
    expect(priorityStyle("low").label).toBe("Low");
  });

  it("falls back to 'normal' for unknown / nullish priorities", () => {
    expect(priorityStyle("bogus")).toBe(PRIORITY_STYLES.normal);
    expect(priorityStyle(null)).toBe(PRIORITY_STYLES.normal);
    expect(priorityStyle(undefined)).toBe(PRIORITY_STYLES.normal);
  });

  it("uses theme tokens, never hardcoded hex", () => {
    for (const style of Object.values(PRIORITY_STYLES)) {
      expect(style.text).toContain("var(--");
      expect(style.bg).toContain("var(--");
      expect(style.text).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    }
  });
});

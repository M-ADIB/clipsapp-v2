import { describe, expect, it } from "bun:test";

import { normalizeStatus, statusBadgeText } from "./journey-lib";

describe("normalizeStatus", () => {
  it("maps known statuses and defaults unknown to upcoming", () => {
    expect(normalizeStatus("completed")).toBe("completed");
    expect(normalizeStatus("in_progress")).toBe("in_progress");
    expect(normalizeStatus("something-else")).toBe("upcoming");
    expect(normalizeStatus(null)).toBe("upcoming");
  });
});

describe("statusBadgeText", () => {
  it("returns the badge label for each status", () => {
    expect(statusBadgeText("completed")).toBe("DONE");
    expect(statusBadgeText("in_progress")).toBe("IN PROGRESS");
    expect(statusBadgeText("upcoming")).toBe("UPCOMING");
    expect(statusBadgeText(null)).toBe("UPCOMING");
  });
});

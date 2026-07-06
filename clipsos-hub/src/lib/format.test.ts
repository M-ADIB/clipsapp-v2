import { describe, expect, it } from "bun:test";

import { formatBytes, formatCurrency, formatDate, formatDateTime } from "./format";

describe("formatDate", () => {
  it("formats an ISO string as 'Mon D, YYYY'", () => {
    expect(formatDate("2026-01-05T12:00:00Z")).toBe("Jan 5, 2026");
  });

  it("accepts a Date object", () => {
    expect(formatDate(new Date("2026-12-31T00:00:00Z"))).toBe("Dec 31, 2026");
  });

  it("returns em-dash for null/undefined/empty", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("")).toBe("—");
  });

  it("returns em-dash for an unparseable date", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });
});

describe("formatDateTime", () => {
  it("includes hour and minute", () => {
    const out = formatDateTime("2026-01-05T15:45:00Z");
    // Locale-rendered time varies by TZ; assert the date part + a time separator.
    expect(out).toContain("Jan 5, 2026");
    expect(out).toMatch(/\d{1,2}:\d{2}/);
  });

  it("returns em-dash for invalid input", () => {
    expect(formatDateTime(null)).toBe("—");
    expect(formatDateTime("nope")).toBe("—");
  });
});

describe("formatBytes", () => {
  it("returns em-dash for zero/negative/nullish", () => {
    expect(formatBytes(0)).toBe("—");
    expect(formatBytes(-5)).toBe("—");
    expect(formatBytes(null)).toBe("—");
    expect(formatBytes(undefined)).toBe("—");
  });

  it("formats bytes/KB/MB/GB with expected precision", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(5 * 1024 ** 2)).toBe("5.0 MB");
    expect(formatBytes(2 * 1024 ** 3)).toBe("2.00 GB");
  });
});

describe("formatCurrency", () => {
  it("defaults to AED and includes the amount", () => {
    const out = formatCurrency(1234.5);
    expect(out).toContain("1,234.50");
    expect(out).toMatch(/AED|د\.إ/); // symbol varies by ICU build
  });

  it("formats USD with a dollar sign", () => {
    expect(formatCurrency(99.9, "USD")).toBe("$99.90");
  });
});

import { describe, expect, it } from "bun:test";

import { guestGateSchema } from "./guest-schemas";

describe("guestGateSchema", () => {
  it("accepts and trims a valid name + email", () => {
    const r = guestGateSchema.safeParse({ name: "  John Doe ", email: " john@example.com " });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("John Doe");
      expect(r.data.email).toBe("john@example.com");
    }
  });

  it("rejects an empty (or whitespace-only) name", () => {
    const r = guestGateSchema.safeParse({ name: "   ", email: "a@b.com" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("Please enter your name");
  });

  it("rejects an empty email", () => {
    const r = guestGateSchema.safeParse({ name: "John", email: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("Please enter your email address");
  });

  it("rejects a malformed email", () => {
    const r = guestGateSchema.safeParse({ name: "John", email: "john@nope" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("Please enter a valid email address");
  });
});

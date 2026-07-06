import { describe, expect, it } from "bun:test";

import { magicLinkSchema, passwordLoginSchema } from "./auth-schemas";

describe("passwordLoginSchema", () => {
  it("accepts a valid email + password", () => {
    const r = passwordLoginSchema.safeParse({ email: "a@b.com", password: "x" });
    expect(r.success).toBe(true);
  });

  it("rejects a missing / empty email with a message", () => {
    const r = passwordLoginSchema.safeParse({ email: "", password: "x" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("Email is required");
  });

  it("rejects a malformed email", () => {
    const r = passwordLoginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("Enter a valid email");
  });

  it("rejects a missing password", () => {
    const r = passwordLoginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("Password is required");
  });
});

describe("magicLinkSchema", () => {
  it("accepts a valid email", () => {
    expect(magicLinkSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });

  it("rejects empty and malformed emails", () => {
    const empty = magicLinkSchema.safeParse({ email: "" });
    const bad = magicLinkSchema.safeParse({ email: "nope" });
    expect(empty.success).toBe(false);
    expect(bad.success).toBe(false);
    if (!empty.success) expect(empty.error.issues[0].message).toBe("Email is required");
    if (!bad.success) expect(bad.error.issues[0].message).toBe("Enter a valid email");
  });
});

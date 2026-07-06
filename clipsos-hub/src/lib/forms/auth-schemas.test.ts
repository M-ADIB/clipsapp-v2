import { describe, expect, it } from "bun:test";

import { passwordLoginSchema } from "./auth-schemas";

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

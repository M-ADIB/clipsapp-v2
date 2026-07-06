import { describe, expect, it } from "bun:test";

import { dealSchema } from "./deal-schemas";

const base = {
  stage: "No Stage",
  region: "UAE",
  personId: "",
  plan: "",
  totalVideos: "",
  notes: "",
};

describe("dealSchema", () => {
  it("requires a deal name", () => {
    const r = dealSchema.safeParse({ ...base, name: "  " });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("Deal name is required");
  });

  it("accepts a minimal valid deal", () => {
    const r = dealSchema.safeParse({ ...base, name: "Acme" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.name).toBe("Acme");
  });
});

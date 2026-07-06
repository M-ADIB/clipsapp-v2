import { describe, expect, it } from "bun:test";

import { formatValue, parseFoundation, getInitialQuestions, TEMPLATES } from "./foundation-lib";

describe("formatValue", () => {
  it("joins arrays, stringifies scalars, and empties nullish", () => {
    expect(formatValue(["a", "b"])).toBe("a, b");
    expect(formatValue("x")).toBe("x");
    expect(formatValue(42)).toBe("42");
    expect(formatValue(null)).toBe("");
    expect(formatValue(undefined)).toBe("");
  });
});

describe("parseFoundation", () => {
  it("returns {} for nullish/array and passes objects through", () => {
    expect(parseFoundation(null)).toEqual({});
    expect(parseFoundation([] as never)).toEqual({});
    expect(parseFoundation({ name: "Jane" } as never)).toEqual({ name: "Jane" });
  });
});

describe("getInitialQuestions", () => {
  it("returns stored questions when present (with required defaulted)", () => {
    const q = getInitialQuestions(
      { questions: [{ id: "a", question: "Q", answer: "A", section: "S" }] },
      "Doctor",
    );
    expect(q).toHaveLength(1);
    expect(q[0].required).toBe(false);
  });

  it("falls back to the category template and autofills legacy keys", () => {
    const q = getInitialQuestions({ name: "Dr. Who", profession: "Cardiology" }, "Doctor");
    expect(q).toHaveLength(TEMPLATES.Doctor.questions.length);
    expect(q.find((x) => x.id === "doc-name")?.answer).toBe("Dr. Who");
    expect(q.find((x) => x.id === "doc-title")?.answer).toBe("Cardiology");
  });

  it("uses the Other template for an unknown category", () => {
    const q = getInitialQuestions({}, "Nonexistent");
    expect(q).toHaveLength(TEMPLATES.Other.questions.length);
  });
});

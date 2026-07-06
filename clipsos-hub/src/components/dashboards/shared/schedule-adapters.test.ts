import { describe, expect, it } from "bun:test";

import { classifyEventType, calendlyToScheduleEvent } from "./schedule-adapters";

describe("classifyEventType", () => {
  it("classifies by keyword and defaults to internal", () => {
    expect(classifyEventType("Discovery Call")).toBe("discovery");
    expect(classifyEventType("Intro chat")).toBe("discovery");
    expect(classifyEventType("Follow up")).toBe("follow_up");
    expect(classifyEventType("Closing / proposal")).toBe("closing");
    expect(classifyEventType("Team sync")).toBe("internal");
    expect(classifyEventType(null)).toBe("internal");
  });
});

describe("calendlyToScheduleEvent", () => {
  const weekStart = new Date("2026-01-05T00:00:00"); // a Monday

  it("returns null for events outside the week window", () => {
    const ev = {
      id: "1",
      start_time: "2026-02-01T10:00:00",
      end_time: "2026-02-01T10:30:00",
      event_type_name: "Discovery",
      sales_user_id: null,
      invitee_name: null,
    } as never;
    expect(calendlyToScheduleEvent(ev, weekStart, new Map())).toBeNull();
  });

  it("maps an in-window event with rep name + type", () => {
    const ev = {
      id: "2",
      start_time: "2026-01-06T09:15:00", // Tuesday
      end_time: "2026-01-06T10:15:00",
      event_type_name: "Closing call",
      sales_user_id: "u1",
      invitee_name: "Jane",
    } as never;
    const out = calendlyToScheduleEvent(ev, weekStart, new Map([["u1", "Alex"]]));
    expect(out).not.toBeNull();
    expect(out!.type).toBe("closing");
    expect(out!.dayOffset).toBe(1); // Tuesday
    expect(out!.durationMinutes).toBe(60);
    expect(out!.rep).toBe("Alex");
    expect(out!.attendee).toBe("Jane");
  });
});

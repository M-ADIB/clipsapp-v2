import { describe, expect, it } from "bun:test";

import { homeForRole, resolveRoleRedirect, routeRoleForPath } from "./role-routes";

describe("routeRoleForPath", () => {
  it("maps role-scoped prefixes (index and nested)", () => {
    expect(routeRoleForPath("/owner")).toBe("owner");
    expect(routeRoleForPath("/owner/videos")).toBe("owner");
    expect(routeRoleForPath("/senior-editor/board")).toBe("senior_editor");
    expect(routeRoleForPath("/content-creator/schedule")).toBe("content_creator");
    expect(routeRoleForPath("/editor/videos")).toBe("editor");
    expect(routeRoleForPath("/platform/tenants")).toBe("platform");
  });

  it("does not confuse /senior-editor or /content-creator with /editor", () => {
    expect(routeRoleForPath("/senior-editor")).toBe("senior_editor");
    expect(routeRoleForPath("/content-creator")).toBe("content_creator");
  });

  it("returns null for non-role-scoped paths", () => {
    expect(routeRoleForPath("/")).toBeNull();
    expect(routeRoleForPath("/settings")).toBeNull();
    expect(routeRoleForPath("/ownerx")).toBeNull(); // not a real prefix match
  });
});

describe("resolveRoleRedirect", () => {
  it("allows a user on their own role's routes (no redirect)", () => {
    expect(
      resolveRoleRedirect({ role: "owner", isPlatformAdmin: false, pathname: "/owner/videos" }),
    ).toBeNull();
    expect(
      resolveRoleRedirect({ role: "editor", isPlatformAdmin: false, pathname: "/editor" }),
    ).toBeNull();
  });

  it("redirects a user away from another role's routes to their own home", () => {
    expect(
      resolveRoleRedirect({ role: "client", isPlatformAdmin: false, pathname: "/owner/finance" }),
    ).toBe(homeForRole("client"));
    expect(
      resolveRoleRedirect({ role: "editor", isPlatformAdmin: false, pathname: "/manager/hq" }),
    ).toBe("/editor");
  });

  it("gates /platform on isPlatformAdmin, not app role", () => {
    expect(
      resolveRoleRedirect({ role: "owner", isPlatformAdmin: true, pathname: "/platform" }),
    ).toBeNull();
    expect(
      resolveRoleRedirect({ role: "owner", isPlatformAdmin: false, pathname: "/platform/tenants" }),
    ).toBe(homeForRole("owner"));
  });

  it("allows non-role-scoped paths", () => {
    expect(
      resolveRoleRedirect({ role: "owner", isPlatformAdmin: false, pathname: "/change-password" }),
    ).toBeNull();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeReq, makeParams, makeSession } from "../helpers";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      update: vi.fn(),
    },
  },
}));

import { PATCH as patchRole } from "@/app/api/users/[id]/role/route";
import { PATCH as patchBlock } from "@/app/api/users/[id]/block/route";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const mockAuth = vi.mocked(auth);
const mockUpdate = vi.mocked(db.user.update);

const fakeUser = {
  id: "user-2",
  name: "Jane",
  email: "jane@example.com",
  role: "CREATOR",
  blocked: false,
};

describe("PATCH /api/users/[id]/role", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 403 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await patchRole(
      makeReq("http://localhost/api/users/user-2/role", {
        method: "PATCH",
        body: { role: "CREATOR" },
      }),
      makeParams({ id: "user-2" })
    );
    expect(res.status).toBe(403);
  });

  it("returns 403 when caller is not ADMIN", async () => {
    mockAuth.mockResolvedValue(makeSession({ role: "CREATOR" }) as never);
    const res = await patchRole(
      makeReq("http://localhost/api/users/user-2/role", {
        method: "PATCH",
        body: { role: "CREATOR" },
      }),
      makeParams({ id: "user-2" })
    );
    expect(res.status).toBe(403);
  });

  it("returns 400 for an invalid role value", async () => {
    mockAuth.mockResolvedValue(makeSession({ role: "ADMIN" }) as never);
    const res = await patchRole(
      makeReq("http://localhost/api/users/user-2/role", {
        method: "PATCH",
        body: { role: "SUPERUSER" },
      }),
      makeParams({ id: "user-2" })
    );
    expect(res.status).toBe(400);
  });

  it("updates the role and returns the user when admin", async () => {
    mockAuth.mockResolvedValue(makeSession({ role: "ADMIN" }) as never);
    mockUpdate.mockResolvedValue({ ...fakeUser, role: "CREATOR" } as never);
    const res = await patchRole(
      makeReq("http://localhost/api/users/user-2/role", {
        method: "PATCH",
        body: { role: "CREATOR" },
      }),
      makeParams({ id: "user-2" })
    );
    expect(res.status).toBe(200);
    expect((await res.json()).role).toBe("CREATOR");
  });

  it("accepts all three valid roles", async () => {
    for (const role of ["VIEWER", "CREATOR", "ADMIN"]) {
      vi.clearAllMocks();
      mockAuth.mockResolvedValue(makeSession({ role: "ADMIN" }) as never);
      mockUpdate.mockResolvedValue({ ...fakeUser, role } as never);
      const res = await patchRole(
        makeReq("http://localhost/api/users/user-2/role", {
          method: "PATCH",
          body: { role },
        }),
        makeParams({ id: "user-2" })
      );
      expect(res.status).toBe(200);
    }
  });
});

describe("PATCH /api/users/[id]/block", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 403 when not admin", async () => {
    mockAuth.mockResolvedValue(makeSession({ role: "CREATOR" }) as never);
    const res = await patchBlock(
      makeReq("http://localhost/api/users/user-2/block", {
        method: "PATCH",
        body: { blocked: true },
      }),
      makeParams({ id: "user-2" })
    );
    expect(res.status).toBe(403);
  });

  it("returns 400 when blocked is not a boolean", async () => {
    mockAuth.mockResolvedValue(makeSession({ role: "ADMIN" }) as never);
    const res = await patchBlock(
      makeReq("http://localhost/api/users/user-2/block", {
        method: "PATCH",
        body: { blocked: "yes" },
      }),
      makeParams({ id: "user-2" })
    );
    expect(res.status).toBe(400);
  });

  it("blocks a user when admin sends true", async () => {
    mockAuth.mockResolvedValue(makeSession({ role: "ADMIN" }) as never);
    mockUpdate.mockResolvedValue({ ...fakeUser, blocked: true } as never);
    const res = await patchBlock(
      makeReq("http://localhost/api/users/user-2/block", {
        method: "PATCH",
        body: { blocked: true },
      }),
      makeParams({ id: "user-2" })
    );
    expect(res.status).toBe(200);
    expect((await res.json()).blocked).toBe(true);
  });

  it("unblocks a user when admin sends false", async () => {
    mockAuth.mockResolvedValue(makeSession({ role: "ADMIN" }) as never);
    mockUpdate.mockResolvedValue({ ...fakeUser, blocked: false } as never);
    const res = await patchBlock(
      makeReq("http://localhost/api/users/user-2/block", {
        method: "PATCH",
        body: { blocked: false },
      }),
      makeParams({ id: "user-2" })
    );
    expect(res.status).toBe(200);
    expect((await res.json()).blocked).toBe(false);
  });
});

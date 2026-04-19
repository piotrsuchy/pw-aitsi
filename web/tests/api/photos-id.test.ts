import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeReq, makeParams, makeSession } from "../helpers";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    photo: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));
vi.mock("fs/promises", () => ({ unlink: vi.fn().mockResolvedValue(undefined) }));

import { GET, PATCH, DELETE } from "@/app/api/photos/[id]/route";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const mockAuth = vi.mocked(auth);
const mockFindUnique = vi.mocked(db.photo.findUnique);
const mockUpdate = vi.mocked(db.photo.update);
const mockDelete = vi.mocked(db.photo.delete);

const fakePhoto = {
  id: "photo-1",
  title: "Old Warsaw",
  url: "/uploads/test.jpg",
  uploaderId: "user-1",
  description: null,
  categoryId: null,
  takenAtYear: null,
  takenAtMonth: null,
  takenAtDay: null,
  datePrecision: null,
  createdAt: new Date(),
};

describe("GET /api/photos/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 404 when photo does not exist", async () => {
    mockFindUnique.mockResolvedValue(null);
    const res = await GET(
      makeReq("http://localhost/api/photos/missing"),
      makeParams({ id: "missing" })
    );
    expect(res.status).toBe(404);
  });

  it("returns the photo when found", async () => {
    mockFindUnique.mockResolvedValue({
      ...fakePhoto,
      uploader: null,
      category: null,
      location: null,
      tags: [],
    } as never);
    const res = await GET(
      makeReq("http://localhost/api/photos/photo-1"),
      makeParams({ id: "photo-1" })
    );
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe("photo-1");
  });
});

describe("PATCH /api/photos/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PATCH(
      makeReq("http://localhost/api/photos/photo-1", { method: "PATCH", body: {} }),
      makeParams({ id: "photo-1" })
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when photo does not exist", async () => {
    mockAuth.mockResolvedValue(makeSession({ role: "CREATOR" }) as never);
    mockFindUnique.mockResolvedValue(null);
    const res = await PATCH(
      makeReq("http://localhost/api/photos/missing", { method: "PATCH", body: {} }),
      makeParams({ id: "missing" })
    );
    expect(res.status).toBe(404);
  });

  it("returns 403 when caller is not the owner and not admin", async () => {
    mockAuth.mockResolvedValue(
      makeSession({ role: "CREATOR", id: "other-user" }) as never
    );
    mockFindUnique.mockResolvedValue(fakePhoto as never); // uploaderId: "user-1"
    const res = await PATCH(
      makeReq("http://localhost/api/photos/photo-1", { method: "PATCH", body: {} }),
      makeParams({ id: "photo-1" })
    );
    expect(res.status).toBe(403);
  });

  it("allows the owner to update their photo", async () => {
    mockAuth.mockResolvedValue(
      makeSession({ role: "CREATOR", id: "user-1" }) as never
    );
    mockFindUnique.mockResolvedValue(fakePhoto as never);
    mockUpdate.mockResolvedValue({
      ...fakePhoto,
      title: "Updated",
      location: null,
      tags: [],
      category: null,
    } as never);
    const res = await PATCH(
      makeReq("http://localhost/api/photos/photo-1", {
        method: "PATCH",
        body: { title: "Updated" },
      }),
      makeParams({ id: "photo-1" })
    );
    expect(res.status).toBe(200);
  });

  it("allows an admin to update any photo", async () => {
    mockAuth.mockResolvedValue(
      makeSession({ role: "ADMIN", id: "admin-user" }) as never
    );
    mockFindUnique.mockResolvedValue(fakePhoto as never); // owned by user-1
    mockUpdate.mockResolvedValue({
      ...fakePhoto,
      title: "Admin edit",
      location: null,
      tags: [],
      category: null,
    } as never);
    const res = await PATCH(
      makeReq("http://localhost/api/photos/photo-1", {
        method: "PATCH",
        body: { title: "Admin edit" },
      }),
      makeParams({ id: "photo-1" })
    );
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/photos/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await DELETE(
      makeReq("http://localhost/api/photos/photo-1"),
      makeParams({ id: "photo-1" })
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when photo does not exist", async () => {
    mockAuth.mockResolvedValue(
      makeSession({ role: "CREATOR", id: "user-1" }) as never
    );
    mockFindUnique.mockResolvedValue(null);
    const res = await DELETE(
      makeReq("http://localhost/api/photos/missing"),
      makeParams({ id: "missing" })
    );
    expect(res.status).toBe(404);
  });

  it("returns 403 when caller is not the owner and not admin", async () => {
    mockAuth.mockResolvedValue(
      makeSession({ role: "CREATOR", id: "other-user" }) as never
    );
    mockFindUnique.mockResolvedValue(fakePhoto as never);
    const res = await DELETE(
      makeReq("http://localhost/api/photos/photo-1"),
      makeParams({ id: "photo-1" })
    );
    expect(res.status).toBe(403);
  });

  it("returns 204 when the owner deletes their photo", async () => {
    mockAuth.mockResolvedValue(
      makeSession({ role: "CREATOR", id: "user-1" }) as never
    );
    mockFindUnique.mockResolvedValue(fakePhoto as never);
    mockDelete.mockResolvedValue(fakePhoto as never);
    const res = await DELETE(
      makeReq("http://localhost/api/photos/photo-1"),
      makeParams({ id: "photo-1" })
    );
    expect(res.status).toBe(204);
  });

  it("returns 204 when an admin deletes another user's photo", async () => {
    mockAuth.mockResolvedValue(
      makeSession({ role: "ADMIN", id: "admin-user" }) as never
    );
    mockFindUnique.mockResolvedValue(fakePhoto as never);
    mockDelete.mockResolvedValue(fakePhoto as never);
    const res = await DELETE(
      makeReq("http://localhost/api/photos/photo-1"),
      makeParams({ id: "photo-1" })
    );
    expect(res.status).toBe(204);
  });
});

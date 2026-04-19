import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeReq, makeSession } from "../helpers";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    photo: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    tag: {
      upsert: vi.fn(),
    },
  },
}));

import { GET, POST } from "@/app/api/photos/route";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const mockAuth = vi.mocked(auth);
const mockFindMany = vi.mocked(db.photo.findMany);
const mockCount = vi.mocked(db.photo.count);
const mockCreate = vi.mocked(db.photo.create);

describe("GET /api/photos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);
  });

  it("returns empty list with correct meta shape", async () => {
    const res = await GET(makeReq("http://localhost/api/photos"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      data: [],
      meta: { total: 0, page: 1, limit: 20, pages: 0 },
    });
  });

  it("caps limit at 50", async () => {
    await GET(makeReq("http://localhost/api/photos?limit=999"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 })
    );
  });

  it("paginates — page 2 skips first batch", async () => {
    await GET(makeReq("http://localhost/api/photos?page=2&limit=10"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it("applies text search across title / description / tags", async () => {
    await GET(makeReq("http://localhost/api/photos?q=warsaw"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ OR: expect.any(Array) }),
      })
    );
  });

  it("filters by dateFrom (year ≥)", async () => {
    await GET(makeReq("http://localhost/api/photos?dateFrom=1980"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          takenAtYear: expect.objectContaining({ gte: 1980 }),
        }),
      })
    );
  });

  it("filters by dateTo (year ≤)", async () => {
    await GET(makeReq("http://localhost/api/photos?dateTo=1990"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          takenAtYear: expect.objectContaining({ lte: 1990 }),
        }),
      })
    );
  });

  it("filters by category slug", async () => {
    await GET(makeReq("http://localhost/api/photos?category=warsaw"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: { slug: "warsaw" },
        }),
      })
    );
  });
});

describe("POST /api/photos", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(
      makeReq("http://localhost/api/photos", { method: "POST", body: {} })
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is blocked", async () => {
    mockAuth.mockResolvedValue(
      makeSession({ role: "CREATOR", blocked: true }) as never
    );
    const res = await POST(
      makeReq("http://localhost/api/photos", { method: "POST", body: {} })
    );
    expect(res.status).toBe(403);
  });

  it("returns 403 for VIEWER role", async () => {
    mockAuth.mockResolvedValue(
      makeSession({ role: "VIEWER" }) as never
    );
    const res = await POST(
      makeReq("http://localhost/api/photos", { method: "POST", body: {} })
    );
    expect(res.status).toBe(403);
  });

  it("returns 400 when title is missing", async () => {
    mockAuth.mockResolvedValue(
      makeSession({ role: "CREATOR" }) as never
    );
    const res = await POST(
      makeReq("http://localhost/api/photos", {
        method: "POST",
        body: { url: "/uploads/x.jpg" },
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when url is missing", async () => {
    mockAuth.mockResolvedValue(
      makeSession({ role: "CREATOR" }) as never
    );
    const res = await POST(
      makeReq("http://localhost/api/photos", {
        method: "POST",
        body: { title: "Test" },
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 201 and the new photo for a CREATOR with valid body", async () => {
    mockAuth.mockResolvedValue(
      makeSession({ role: "CREATOR", id: "user-1" }) as never
    );
    const fakePhoto = {
      id: "photo-1",
      title: "Test",
      url: "/uploads/x.jpg",
      tags: [],
      location: null,
      category: null,
    };
    mockCreate.mockResolvedValue(fakePhoto as never);

    const res = await POST(
      makeReq("http://localhost/api/photos", {
        method: "POST",
        body: { title: "Test", url: "/uploads/x.jpg" },
      })
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("photo-1");
  });
});

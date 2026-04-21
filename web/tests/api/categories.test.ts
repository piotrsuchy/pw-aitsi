import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeReq } from "../helpers";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    category: {
      findMany: vi.fn(),
    },
  },
}));

import { GET } from "@/app/api/categories/route";
import { db } from "@/lib/db";

const mockFindMany = vi.mocked(db.category.findMany);

describe("GET /api/categories", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns an empty array when there are no categories", async () => {
    mockFindMany.mockResolvedValue([]);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("nests children under their parent", async () => {
    mockFindMany.mockResolvedValue([
      { id: "cat-1", name: "Warsaw", slug: "warsaw", parentId: null },
      { id: "cat-2", name: "City Center", slug: "warsaw-city-center", parentId: "cat-1" },
    ] as never);
    const body = await (await GET()).json();
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Warsaw");
    expect(body[0].children).toHaveLength(1);
    expect(body[0].children[0].name).toBe("City Center");
  });

  it("returns multiple root categories", async () => {
    mockFindMany.mockResolvedValue([
      { id: "cat-1", name: "Warsaw", slug: "warsaw", parentId: null },
      { id: "cat-2", name: "Krakow", slug: "krakow", parentId: null },
    ] as never);
    const body = await (await GET()).json();
    expect(body).toHaveLength(2);
    expect(body.map((c: { name: string }) => c.name)).toEqual(
      expect.arrayContaining(["Warsaw", "Krakow"])
    );
  });

  it("handles grandchildren (3 levels deep)", async () => {
    mockFindMany.mockResolvedValue([
      { id: "c1", name: "Poland", slug: "poland", parentId: null },
      { id: "c2", name: "Warsaw", slug: "warsaw", parentId: "c1" },
      { id: "c3", name: "Praga", slug: "praga", parentId: "c2" },
    ] as never);
    const body = await (await GET()).json();
    expect(body).toHaveLength(1);
    expect(body[0].children[0].children[0].name).toBe("Praga");
  });

  it("treats a category with an unknown parentId as a root node", async () => {
    mockFindMany.mockResolvedValue([
      { id: "c1", name: "Orphan", slug: "orphan", parentId: "nonexistent" },
    ] as never);
    const body = await (await GET()).json();
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Orphan");
  });
});

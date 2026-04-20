import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Category } from "@/app/generated/prisma/client";

type CategoryWithChildren = Category & { children: CategoryWithChildren[] };

function buildTree(flat: Category[]): CategoryWithChildren[] {
  const map = new Map<string, CategoryWithChildren>();
  flat.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: CategoryWithChildren[] = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

// GET /api/categories — returns full hierarchy tree
export async function GET() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(buildTree(categories));
}

// POST /api/categories
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.blocked) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, parentId } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9A-Z]+/g, "-");

  const existing = await db.category.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Category already exists" }, { status: 400 });
  }

  const category = await db.category.create({
    data: {
      name,
      slug,
      parentId: parentId || null,
    },
  });

  return NextResponse.json(category, { status: 201 });
}

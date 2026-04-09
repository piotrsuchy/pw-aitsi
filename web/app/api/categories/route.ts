import { NextResponse } from "next/server";
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

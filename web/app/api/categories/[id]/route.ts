import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// DELETE /api/categories/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  
  // Verify category exists
  const category = await db.category.findUnique({
    where: { id },
    include: { _count: { select: { photos: true, children: true } } },
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  // Ensure it doesn't have photos or subcategories
  if (category._count.photos > 0 || category._count.children > 0) {
    return NextResponse.json(
      { error: "Cannot delete category containing photos or subcategories." },
      { status: 400 }
    );
  }

  await db.category.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}

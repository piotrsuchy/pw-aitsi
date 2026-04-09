import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/admin/recent — last 20 uploaded photos (admin only)
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const photos = await db.photo.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      uploader: { select: { id: true, name: true, email: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  return NextResponse.json(photos);
}

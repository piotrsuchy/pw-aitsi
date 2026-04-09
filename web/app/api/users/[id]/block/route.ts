import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH /api/users/[id]/block — toggle blocked status (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { blocked } = await req.json();

  if (typeof blocked !== "boolean") {
    return NextResponse.json({ error: "blocked must be a boolean" }, { status: 400 });
  }

  const user = await db.user.update({
    where: { id },
    data: { blocked },
    select: { id: true, name: true, email: true, role: true, blocked: true },
  });

  return NextResponse.json(user);
}

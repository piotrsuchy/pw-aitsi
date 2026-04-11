import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Role } from "@/app/generated/prisma/client";

const VALID_ROLES: Role[] = ["VIEWER", "CREATOR", "ADMIN"];

// PATCH /api/users/[id]/role — change user role (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { role } = await req.json();

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const user = await db.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true, blocked: true },
  });

  return NextResponse.json(user);
}

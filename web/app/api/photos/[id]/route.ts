import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";

// ─── GET /api/photos/[id] ─────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const photo = await db.photo.findUnique({
    where: { id },
    include: {
      uploader: { select: { id: true, name: true, image: true } },
      category: true,
      location: true,
      tags: { include: { tag: true } },
    },
  });

  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(photo);
}

// ─── PATCH /api/photos/[id] ───────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.blocked) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const photo = await db.photo.findUnique({ where: { id } });
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = photo.uploaderId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title,
    description,
    categoryId,
    takenAtYear,
    takenAtMonth,
    takenAtDay,
    datePrecision,
    location,
  } = body;

  const updated = await db.photo.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(categoryId !== undefined && { categoryId }),
      ...(takenAtYear !== undefined && { takenAtYear }),
      ...(takenAtMonth !== undefined && { takenAtMonth }),
      ...(takenAtDay !== undefined && { takenAtDay }),
      ...(datePrecision !== undefined && { datePrecision }),
      ...(location !== undefined && {
        location: {
          upsert: {
            update: location,
            create: { ...location },
          },
        },
      }),
    },
    include: { location: true, tags: { include: { tag: true } }, category: true },
  });

  return NextResponse.json(updated);
}

// ─── DELETE /api/photos/[id] ──────────────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const photo = await db.photo.findUnique({ where: { id } });
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = photo.uploaderId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete file from local storage if it's a local path
  if (photo.url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", photo.url);
    await unlink(filePath).catch(() => {}); // ignore if already gone
  }

  await db.photo.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

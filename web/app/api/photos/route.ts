import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { Prisma } from "@/app/generated/prisma/client";

// ─── GET /api/photos ──────────────────────────────────────────────────────────
// Public: search & filter photos
// Query params: q, category, region, city, dateFrom, dateTo, page, limit
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const q = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const region = searchParams.get("region") ?? undefined;
  const city = searchParams.get("city") ?? undefined;
  const dateFrom = searchParams.get("dateFrom")
    ? parseInt(searchParams.get("dateFrom")!)
    : undefined;
  const dateTo = searchParams.get("dateTo")
    ? parseInt(searchParams.get("dateTo")!)
    : undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

  const where: Prisma.PhotoWhereInput = {
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
      ],
    }),
    ...(category && { category: { slug: category } }),
    ...(dateFrom && { takenAtYear: { gte: dateFrom } }),
    ...(dateTo && { takenAtYear: { lte: dateTo } }),
    ...(region || city
      ? {
          location: {
            ...(region && { region: { contains: region, mode: "insensitive" } }),
            ...(city && { city: { contains: city, mode: "insensitive" } }),
          },
        }
      : {}),
  };

  const [photos, total] = await Promise.all([
    db.photo.findMany({
      where,
      include: {
        uploader: { select: { id: true, name: true, image: true } },
        category: { select: { id: true, name: true, slug: true } },
        location: true,
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.photo.count({ where }),
  ]);

  return NextResponse.json({
    data: photos,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}

// ─── POST /api/photos ─────────────────────────────────────────────────────────
// Private (Creator/Admin): create a photo record after upload
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.blocked) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title,
    description,
    url,
    categoryId,
    takenAtYear,
    takenAtMonth,
    takenAtDay,
    datePrecision,
    location,
    tags,
  } = body;

  if (!title || !url) {
    return NextResponse.json({ error: "title and url are required" }, { status: 400 });
  }

  const photo = await db.photo.create({
    data: {
      title,
      description,
      url,
      uploaderId: session.user.id,
      categoryId: categoryId ?? null,
      takenAtYear: takenAtYear ?? null,
      takenAtMonth: takenAtMonth ?? null,
      takenAtDay: takenAtDay ?? null,
      datePrecision: datePrecision ?? null,
      location: location
        ? {
            create: {
              region: location.region ?? null,
              city: location.city ?? null,
              district: location.district ?? null,
              lat: location.lat ?? null,
              lng: location.lng ?? null,
            },
          }
        : undefined,
      tags: tags?.length
        ? {
            create: await Promise.all(
              tags.map(async (name: string) => {
                const tag = await db.tag.upsert({
                  where: { name },
                  update: {},
                  create: { name },
                });
                return { tagId: tag.id };
              })
            ),
          }
        : undefined,
    },
    include: {
      location: true,
      tags: { include: { tag: true } },
      category: true,
    },
  });

  return NextResponse.json(photo, { status: 201 });
}

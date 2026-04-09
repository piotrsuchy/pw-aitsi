import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveFile, isAllowedMimeType } from "@/lib/storage";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// POST /api/upload — multipart form, field: "file"
// Returns: { url: "/uploads/..." }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.blocked || session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!isAllowedMimeType(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, and GIF are allowed" },
      { status: 415 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 413 });
  }

  const url = await saveFile(Buffer.from(arrayBuffer), file.name);
  return NextResponse.json({ url }, { status: 201 });
}

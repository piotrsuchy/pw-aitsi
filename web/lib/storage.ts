import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Saves an uploaded file buffer to local disk.
 * Returns the public URL path (e.g. /uploads/abc123.jpg).
 *
 * Swap this implementation with an S3 upload for cloud deployment.
 */
export async function saveFile(
  buffer: Buffer,
  originalName: string
): Promise<string> {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/${filename}`;
}

export function isAllowedMimeType(mime: string) {
  return ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mime);
}

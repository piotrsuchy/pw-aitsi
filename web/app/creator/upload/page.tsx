import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { UploadForm } from "./upload-form";

export const metadata = { title: "Upload Photo – Local Archive" };

export default async function UploadPage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/creator/upload");
  if (session.user.role === "VIEWER") redirect("/");

  const categories = await db.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      children: {
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Upload a photo</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Add a historical photograph to the community archive.
        </p>
      </div>

      <UploadForm categories={categories} />
    </div>
  );
}

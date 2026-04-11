import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "My Photos – Local Archive" };

export default async function MyPhotosPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "VIEWER") redirect("/");

  const photos = await db.photo.findMany({
    where: { uploaderId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
      location: true,
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My photos</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {photos.length} {photos.length === 1 ? "photo" : "photos"} uploaded
          </p>
        </div>
        <Link
          href="/creator/upload"
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
        >
          Add photo
        </Link>
      </div>

      {photos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] py-20 text-center text-[var(--muted-foreground)]">
          <p>You haven&apos;t uploaded any photos yet.</p>
          <p className="mt-1 text-sm">
            <Link href="/creator/upload" className="text-[var(--primary)] underline">
              Upload your first photo
            </Link>
          </p>
        </div>
      ) : (
        <ul
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          role="list"
        >
          {photos.map((photo) => (
            <li key={photo.id}>
              <Link
                href={`/photos/${photo.id}`}
                className="group block rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-colors focus-visible:outline-[var(--primary)]"
              >
                <div className="relative aspect-[4/3] bg-[var(--muted)]">
                  <Image
                    src={photo.url}
                    alt={photo.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm truncate">{photo.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">
                    {photo.category?.name ?? "Uncategorized"}
                    {photo.location?.city ? ` · ${photo.location.city}` : ""}
                    {photo.takenAtYear ? ` · ${photo.takenAtYear}` : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

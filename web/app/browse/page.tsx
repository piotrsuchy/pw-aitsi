import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";

export const metadata = { title: "Browse – Local Archive" };

async function getCategories() {
  return db.category.findMany({
    where: { parentId: null },
    include: {
      children: { select: { id: true, name: true, slug: true } },
      _count: { select: { photos: true } },
    },
    orderBy: { name: "asc" },
  });
}

async function getPhotos() {
  return db.photo.findMany({
    orderBy: { createdAt: "desc" },
    take: 48,
    include: {
      location: true,
      category: { select: { name: true, slug: true } },
    },
  });
}

export default async function BrowsePage() {
  const [categories, photos] = await Promise.all([getCategories(), getPhotos()]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-10">
      <h1 className="text-3xl font-bold">Browse the archive</h1>

      {/* Category tree */}
      {categories.length > 0 && (
        <section aria-labelledby="regions-heading">
          <h2 id="regions-heading" className="text-lg font-semibold mb-4">
            Regions
          </h2>
          <ul className="flex flex-wrap gap-2" role="list">
            {categories.map((cat) => (
              <li key={cat.id}>
                {cat._count.photos > 0 ? (
                  <Link
                    href={`/browse/${cat.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-1.5 text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                  >
                    {cat.name}
                    <span className="text-xs text-[var(--muted-foreground)]">
                      ({cat._count.photos})
                    </span>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-1.5 text-sm text-[var(--muted-foreground)] opacity-60 cursor-not-allowed">
                    {cat.name}
                    <span className="text-xs">
                      (0)
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Photo grid */}
      <section aria-labelledby="all-photos-heading">
        <h2 id="all-photos-heading" className="text-lg font-semibold mb-4">
          All photos
        </h2>

        {photos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] py-20 text-center text-[var(--muted-foreground)]">
            <p>No photos in the archive yet.</p>
            <p className="mt-1 text-sm">
              <Link href="/login" className="text-[var(--primary)] underline">
                Sign in
              </Link>{" "}
              as a Creator to add the first photo.
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
      </section>
    </div>
  );
}

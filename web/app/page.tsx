import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";

async function getRecentPhotos() {
  try {
    return await db.photo.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        location: true,
        category: { select: { name: true, slug: true } },
        uploader: { select: { name: true } },
      },
    });
  } catch {
    return [];
  }
}

async function getRootCategories() {
  try {
    return await db.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            _count: { select: { photos: true } },
          },
        },
        _count: { select: { photos: true } },
      },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [photos, categories] = await Promise.all([
    getRecentPhotos(),
    getRootCategories(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-[var(--muted)] border-b border-[var(--border)] py-16 px-4">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Discover the history of your place
          </h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            A community archive of historical photographs. Browse, search, and
            share images documenting how places have changed over time.
          </p>
          <form action="/search" method="get" role="search" className="flex gap-2 max-w-xl mx-auto">
            <label htmlFor="search-q" className="sr-only">
              Search photos
            </label>
            <input
              id="search-q"
              name="q"
              type="search"
              placeholder="Search by title, location, tag…"
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm focus-visible:outline-[var(--primary)]"
            />
            <button
              type="submit"
              className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-14">
        {/* Categories */}
        {categories.length > 0 && (
          <section aria-labelledby="categories-heading">
            <h2 id="categories-heading" className="text-2xl font-semibold mb-6">
              Browse by region
            </h2>
            <ul
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
              role="list"
            >
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/browse/${cat.slug}`}
                    className="group block rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4 hover:border-[var(--primary)] hover:bg-[var(--background)] transition-colors focus-visible:outline-[var(--primary)]"
                  >
                    <span className="font-semibold">{cat.name}</span>
                    <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                      {(() => {
                        const total = cat._count.photos + cat.children.reduce((acc, child) => acc + (child._count?.photos || 0), 0);
                        return `${total} ${total === 1 ? "photo" : "photos"}`;
                      })()}
                    </span>
                    {cat.children.length > 0 && (
                      <ul className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-40 group-hover:opacity-100 group-hover:mt-2 transition-all duration-300 ease-in-out space-y-0.5" aria-label={`Districts – ${cat.name}`}>
                        {cat.children.slice(0, 3).map((child) => (
                          <li key={child.id} className="text-xs text-[var(--muted-foreground)]">
                            {child.name}
                          </li>
                        ))}
                        {cat.children.length > 3 && (
                          <li className="text-xs text-[var(--muted-foreground)]">
                            +{cat.children.length - 3} more
                          </li>
                        )}
                      </ul>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Recent photos */}
        <section aria-labelledby="recent-heading">
          <div className="flex items-center justify-between mb-6">
            <h2 id="recent-heading" className="text-2xl font-semibold">
              Recently added
            </h2>
            <Link href="/browse" className="text-sm text-[var(--primary)] hover:underline">
              View all →
            </Link>
          </div>

          {photos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] py-20 text-center text-[var(--muted-foreground)]">
              <p className="text-lg">No photos in the archive yet.</p>
              <p className="mt-2 text-sm">
                Sign in as a Creator to add the first photo.
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
                    className="group block bg-[var(--background)] rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-colors focus-visible:outline-[var(--primary)]"
                  >
                    <div className="relative aspect-[4/3] bg-[var(--muted)]">
                      <Image
                        src={photo.url}
                        alt=""
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm truncate text-[var(--foreground)]">{photo.title}</p>
                      {photo.location?.city && (
                        <p className="text-xs text-[var(--muted-foreground)] truncate">
                          {photo.location.city}
                          {photo.takenAtYear ? `, ${photo.takenAtYear}` : ""}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

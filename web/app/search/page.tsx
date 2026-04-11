import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return { title: q ? `"${q}" – Search – Local Archive` : "Search – Local Archive" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const where: Prisma.PhotoWhereInput = query
    ? {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { tags: { some: { tag: { name: { contains: query, mode: "insensitive" } } } } },
          { location: { city: { contains: query, mode: "insensitive" } } },
          { location: { region: { contains: query, mode: "insensitive" } } },
        ],
      }
    : {};

  const photos = await db.photo.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 48,
    include: {
      location: true,
      category: { select: { name: true, slug: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      {/* Search form */}
      <form action="/search" method="get" role="search" className="flex gap-2 max-w-2xl">
        <label htmlFor="search-q" className="sr-only">
          Search photos
        </label>
        <input
          id="search-q"
          name="q"
          type="search"
          defaultValue={query}
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

      {/* Results heading */}
      <div>
        {query ? (
          <h1 className="text-2xl font-bold">
            {photos.length === 0
              ? `No results for "${query}"`
              : `${photos.length} result${photos.length === 1 ? "" : "s"} for "${query}"`}
          </h1>
        ) : (
          <h1 className="text-2xl font-bold">Search the archive</h1>
        )}
      </div>

      {/* Results grid */}
      {photos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] py-20 text-center text-[var(--muted-foreground)]">
          {query ? (
            <>
              <p>No photos matched your search.</p>
              <p className="mt-1 text-sm">
                Try different keywords or{" "}
                <Link href="/browse" className="text-[var(--primary)] underline">
                  browse all photos
                </Link>
                .
              </p>
            </>
          ) : (
            <p>Enter a search term above to find photos.</p>
          )}
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

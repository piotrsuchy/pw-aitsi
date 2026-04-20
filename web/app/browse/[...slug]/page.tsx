import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const category = await db.category.findUnique({
    where: { slug: slug[slug.length - 1] },
  });
  return { title: category ? `${category.name} – Local Archive` : "Not found" };
}

export default async function BrowseCategoryPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const currentSlug = slug[slug.length - 1];

  const category = await db.category.findUnique({
    where: { slug: currentSlug },
    include: {
      parent: { select: { name: true, slug: true } },
      children: {
        select: { 
          id: true, 
          name: true, 
          slug: true,
          _count: { select: { photos: true } }
        },
      },
    },
  });

  if (!category) notFound();

  // Include photos from this category and all direct children
  const childIds = category.children.map((c) => c.id);
  const photos = await db.photo.findMany({
    where: { categoryId: { in: [category.id, ...childIds] } },
    orderBy: { createdAt: "desc" },
    take: 48,
    include: {
      location: true,
      category: { select: { name: true, slug: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
          <li>
            <Link href="/browse" className="hover:text-[var(--foreground)] transition-colors">
              Browse
            </Link>
          </li>
          {category.parent && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/browse/${category.parent.slug}`}
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  {category.parent.name}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-[var(--foreground)] font-medium">
            {category.name}
          </li>
        </ol>
      </nav>

      <div>
        <h1 className="text-3xl font-bold">{category.name}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {photos.length} {photos.length === 1 ? "photo" : "photos"}
        </p>
      </div>

      {/* Sub-categories */}
      {category.children.length > 0 && (
        <section aria-labelledby="subcategories-heading">
          <h2 id="subcategories-heading" className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
            Districts
          </h2>
          <ul className="flex flex-wrap gap-2" role="list">
            {category.children.map((child) => (
              <li key={child.id}>
                {child._count.photos > 0 ? (
                  <Link
                    href={`/browse/${child.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-1.5 text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                  >
                    {child.name}
                    <span className="text-xs text-[var(--muted-foreground)]">
                      ({child._count.photos})
                    </span>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-1.5 text-sm text-[var(--muted-foreground)] opacity-60 cursor-not-allowed">
                    {child.name}
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
      {photos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] py-20 text-center text-[var(--muted-foreground)]">
          <p>No photos in this category yet.</p>
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
                    {photo.category?.name ?? ""}
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

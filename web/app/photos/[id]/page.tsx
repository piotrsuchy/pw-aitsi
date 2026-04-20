import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { PhotoActions } from "./photo-actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photo = await db.photo.findUnique({ where: { id }, select: { title: true } });
  return { title: photo ? `${photo.title} – Local Archive` : "Not found" };
}

export default async function PhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [photo, session, categories] = await Promise.all([
    db.photo.findUnique({
      where: { id },
      include: {
        uploader: { select: { id: true, name: true } },
        category: true,
        location: true,
        tags: { include: { tag: true } },
      },
    }),
    auth(),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!photo) notFound();

  const canEdit =
    session &&
    !session.user.blocked &&
    (session.user.id === photo.uploaderId || session.user.role === "ADMIN");

  function formatDate() {
    if (!photo.takenAtYear) return null;
    if (photo.datePrecision === "YEAR") return `${photo.takenAtYear}`;
    if (photo.datePrecision === "MONTH" && photo.takenAtMonth) {
      return `${photo.takenAtMonth}/${photo.takenAtYear}`;
    }
    if (photo.datePrecision === "DAY" && photo.takenAtMonth && photo.takenAtDay) {
      return `${photo.takenAtDay}/${photo.takenAtMonth}/${photo.takenAtYear}`;
    }
    return `${photo.takenAtYear}`;
  }

  const dateStr = formatDate();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
          <li>
            <Link href="/browse" className="hover:text-[var(--foreground)] transition-colors">
              Browse
            </Link>
          </li>
          {photo.category && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/browse/${photo.category.slug}`}
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  {photo.category.name}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-[var(--foreground)] font-medium truncate max-w-[200px]">
            {photo.title}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Image */}
        <div className="relative w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)] aspect-[4/3]">
          <Image
            src={photo.url}
            alt={photo.title}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 640px"
            priority
          />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{photo.title}</h1>
            {photo.description && (
              <p className="mt-2 text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">
                {photo.description}
              </p>
            )}
          </div>

          <dl className="space-y-2 text-sm">
            {photo.category && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-[var(--muted-foreground)]">Category</dt>
                <dd>
                  <Link
                    href={`/browse/${photo.category.slug}`}
                    className="text-[var(--primary)] hover:underline"
                  >
                    {photo.category.name}
                  </Link>
                </dd>
              </div>
            )}

            {dateStr && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-[var(--muted-foreground)]">Date</dt>
                <dd>{dateStr}</dd>
              </div>
            )}

            {photo.location?.city && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-[var(--muted-foreground)]">City</dt>
                <dd>{photo.location.city}</dd>
              </div>
            )}

            {photo.location?.region && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-[var(--muted-foreground)]">Region</dt>
                <dd>{photo.location.region}</dd>
              </div>
            )}

            {photo.location?.district && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-[var(--muted-foreground)]">District</dt>
                <dd>{photo.location.district}</dd>
              </div>
            )}

            {photo.uploader?.name && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-[var(--muted-foreground)]">Uploaded by</dt>
                <dd>{photo.uploader.name}</dd>
              </div>
            )}
          </dl>

          {photo.tags.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                Tags
              </p>
              <ul className="flex flex-wrap gap-1.5" role="list">
                {photo.tags.map(({ tag }) => (
                  <li key={tag.id}>
                    <Link
                      href={`/search?q=${encodeURIComponent(tag.name)}`}
                      className="inline-block rounded-full border border-[var(--border)] px-3 py-1 text-xs hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                    >
                      {tag.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {canEdit && (
            <PhotoActions
              photoId={photo.id}
              initial={{
                title: photo.title,
                description: photo.description,
                categoryId: photo.categoryId,
                takenAtYear: photo.takenAtYear,
                takenAtMonth: photo.takenAtMonth,
                takenAtDay: photo.takenAtDay,
                datePrecision: photo.datePrecision,
                location: photo.location,
                tags: photo.tags.map((t) => t.tag.name).join(", "),
              }}
              categories={categories}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

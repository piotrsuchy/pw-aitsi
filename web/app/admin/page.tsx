import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserTable } from "./user-table";
import { CategoryTable } from "./category-table";

export const metadata = { title: "Admin – Local Archive" };

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const [recentPhotos, users] = await Promise.all([
    db.photo.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        uploader: { select: { id: true, name: true, email: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    db.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, role: true, blocked: true },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      include: {
        parent: { select: { name: true } },
        _count: { select: { photos: true, children: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-12">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Recent uploads */}
      <section aria-labelledby="recent-heading">
        <h2 id="recent-heading" className="text-xl font-semibold mb-4">
          Recent uploads
        </h2>

        {recentPhotos.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">No photos uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Photo</th>
                  <th className="px-4 py-3 text-left font-semibold">Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Uploader</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {recentPhotos.map((photo) => (
                  <tr key={photo.id} className="hover:bg-[var(--muted)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-16 overflow-hidden rounded-md bg-[var(--muted)]">
                        <Image
                          src={photo.url}
                          alt={photo.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/photos/${photo.id}`}
                        className="font-medium text-[var(--primary)] hover:underline"
                      >
                        {photo.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">
                      {photo.uploader?.name ?? photo.uploader?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">
                      {photo.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">
                      {photo.createdAt.toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="users-heading">
        <h2 id="users-heading" className="text-xl font-semibold mb-4">
          User management
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Change a user&apos;s role or block their access. Click <strong>Save</strong> per row to apply.
        </p>
        <UserTable initialUsers={users} />
      </section>

      {/* Category management */}
      <section aria-labelledby="categories-heading">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="categories-heading" className="text-xl font-semibold">
              Category management
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Add new regions or districts, or delete empty categories. Only categories containing 0 photos and 0 subcategories can be deleted.
            </p>
          </div>
          <Link
            href="/admin/categories/new"
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition-opacity whitespace-nowrap ml-4"
          >
            Add category
          </Link>
        </div>
        <CategoryTable initialCategories={categories} />
      </section>
    </div>
  );
}

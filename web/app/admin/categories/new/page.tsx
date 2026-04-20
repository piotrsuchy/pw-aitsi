import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AddCategoryForm } from "./add-category-form";

export const metadata = { title: "Add Category – Local Archive" };

export default async function AddCategoryPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const topLevelCategories = await db.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add new category</h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          Expand the archive taxonomy by creating a new regional category or a specific district.
        </p>
      </div>

      <AddCategoryForm parentCategories={topLevelCategories} />
    </div>
  );
}

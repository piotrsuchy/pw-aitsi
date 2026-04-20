"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent: { name: string } | null;
  _count: { photos: number; children: number };
};

export function CategoryTable({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function deleteCategory(category: CategoryRow) {
    if (!confirm(`Are you sure you want to delete the category "${category.name}"?`)) return;

    setSaving((s) => ({ ...s, [category.id]: true }));
    setErrors((e) => ({ ...e, [category.id]: "" }));

    const res = await fetch(`/api/categories/${category.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setCategories((cs) => cs.filter((c) => c.id !== category.id));
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setErrors((e) => ({ ...e, [category.id]: data.error || "Failed to delete" }));
    }
    
    setSaving((s) => ({ ...s, [category.id]: false }));
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] mt-4">
      <table className="w-full text-sm">
        <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Name</th>
            <th className="px-4 py-3 text-left font-semibold">Slug / URL</th>
            <th className="px-4 py-3 text-left font-semibold">Parent Region</th>
            <th className="px-4 py-3 text-right font-semibold">Photos / Sub-categories</th>
            <th className="px-4 py-3 text-right font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {categories.map((cat) => {
            const isDeletable = cat._count.photos === 0 && cat._count.children === 0;

            return (
              <tr key={cat.id} className="hover:bg-[var(--muted)] transition-colors">
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">{cat.slug}</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">
                  {cat.parent?.name ?? <span className="italic">Top-level</span>}
                </td>
                <td className="px-4 py-3 text-right text-[var(--muted-foreground)]">
                  {cat._count.photos} photos, {cat._count.children} subcategories
                </td>
                <td className="px-4 py-3 text-right space-y-1">
                  <button
                    onClick={() => deleteCategory(cat)}
                    disabled={saving[cat.id] || !isDeletable}
                    title={!isDeletable ? "Cannot delete category containing photos or subcategories" : "Delete category"}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:bg-[var(--muted)] disabled:text-[var(--muted-foreground)] disabled:cursor-not-allowed transition-colors"
                  >
                    {saving[cat.id] ? "Deleting…" : "Delete"}
                  </button>
                  {errors[cat.id] && (
                    <p className="text-xs text-red-600 block mt-1">{errors[cat.id]}</p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

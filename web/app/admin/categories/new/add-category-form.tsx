"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddCategoryForm({ parentCategories }: { parentCategories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    parentId: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError(null);

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        parentId: form.parentId || null,
      }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to create category");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-6">
      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Category Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm focus-visible:outline-[var(--primary)]"
          placeholder="e.g. Gdansk"
          required
        />
      </div>

      <div>
        <label htmlFor="parentId" className="block text-sm font-medium mb-1">
          Parent Category (Region)
        </label>
        <p className="text-xs text-[var(--muted-foreground)] mb-3">
          Leave blank to create a new top-level region. Select an existing region to create a subcategory (like a district or city).
        </p>
        <select
          id="parentId"
          value={form.parentId}
          onChange={(e) => setForm({ ...form, parentId: e.target.value })}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm focus-visible:outline-[var(--primary)]"
        >
          <option value="">— Create as top-level Region —</option>
          {parentCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {saving ? "Creating…" : "Create Category"}
      </button>
    </form>
  );
}

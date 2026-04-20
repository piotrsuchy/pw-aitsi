"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/app/generated/prisma/client";

type LocationData = {
  region?: string | null;
  city?: string | null;
  district?: string | null;
  lat?: number | null;
  lng?: number | null;
};

type PhotoActionsProps = {
  photoId: string;
  initial: {
    title: string;
    description?: string | null;
    categoryId?: string | null;
    takenAtYear?: number | null;
    takenAtMonth?: number | null;
    takenAtDay?: number | null;
    location?: LocationData | null;
    tags?: string;
  };
  categories: Pick<Category, "id" | "name">[];
};

export function PhotoActions({ photoId, initial, categories }: PhotoActionsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: initial.title,
    description: initial.description ?? "",
    categoryId: initial.categoryId ?? "",
    takenAtYear: initial.takenAtYear?.toString() ?? "",
    takenAtMonth: initial.takenAtMonth?.toString() ?? "",
    takenAtDay: initial.takenAtDay?.toString() ?? "",
    region: initial.location?.region ?? "",
    city: initial.location?.city ?? "",
    district: initial.location?.district ?? "",
    lat: initial.location?.lat?.toString() ?? "",
    lng: initial.location?.lng?.toString() ?? "",
    tags: initial.tags ?? "",
  });

  async function handleDelete() {
    if (!confirm("Delete this photo? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/browse");
    } else {
      setError("Failed to delete photo.");
      setDeleting(false);
    }
  }

  async function handleSave() {
    if (form.takenAtMonth && !form.takenAtYear) { setError("Year is required if month is provided."); return; }
    if (form.takenAtDay && !form.takenAtMonth) { setError("Month is required if day is provided."); return; }

    setSaving(true);
    setError(null);

    const body: Record<string, unknown> = {
      title: form.title,
      description: form.description || null,
      categoryId: form.categoryId || null,
      takenAtYear: form.takenAtYear ? parseInt(form.takenAtYear) : null,
      takenAtMonth: form.takenAtMonth ? parseInt(form.takenAtMonth) : null,
      takenAtDay: form.takenAtDay ? parseInt(form.takenAtDay) : null,
      datePrecision: 
        (form.takenAtDay && form.takenAtMonth && form.takenAtYear) ? "DAY" 
        : (form.takenAtMonth && form.takenAtYear) ? "MONTH" 
        : form.takenAtYear ? "YEAR" : null,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    if (form.region || form.city || form.district || form.lat || form.lng) {
      body.location = {
        region: form.region || null,
        city: form.city || null,
        district: form.district || null,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
      };
    }

    const res = await fetch(`/api/photos/${photoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      setIsEditing(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save changes.");
    }
  }

  function field(label: string, key: keyof typeof form, type = "text") {
    return (
      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
          {label}
        </label>
        <input
          type={type}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-[var(--primary)]"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setIsEditing((v) => !v)}
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)] transition-colors"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>

      {isEditing && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-6 space-y-4">
          <h3 className="font-semibold">Edit photo</h3>

          {field("Title *", "title")}

          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Category
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-[var(--primary)]"
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {field("Year", "takenAtYear", "number")}
            {field("Month", "takenAtMonth", "number")}
            {field("Day", "takenAtDay", "number")}
          </div>

          <div className="pt-2">
            {field("Tags (comma separated)", "tags")}
          </div>

          <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider pt-2">
            Location
          </p>
          <div className="grid grid-cols-2 gap-3">
            {field("Region", "region")}
            {field("City", "city")}
            {field("District", "district")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field("Latitude", "lat", "number")}
            {field("Longitude", "lng", "number")}
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
            className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      )}
    </div>
  );
}

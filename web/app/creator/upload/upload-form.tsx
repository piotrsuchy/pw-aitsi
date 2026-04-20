"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Category = {
  id: string;
  name: string;
  children: { id: string; name: string }[];
};

export function UploadForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    takenAtYear: "",
    takenAtMonth: "",
    takenAtDay: "",
    datePrecision: "",
    region: "",
    city: "",
    district: "",
    lat: "",
    lng: "",
    tags: "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const file = fileRef.current?.files?.[0];
    if (!file) { setError("Please select an image file."); return; }
    if (!form.title.trim()) { setError("Title is required."); return; }

    setUploading(true);

    // Step 1: upload file
    const fd = new FormData();
    fd.append("file", file);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
    if (!uploadRes.ok) {
      const data = await uploadRes.json().catch(() => ({}));
      setError(data.error ?? "File upload failed.");
      setUploading(false);
      return;
    }
    const { url } = await uploadRes.json();

    // Step 2: create photo record
    const tagList = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const hasLocation =
      form.region || form.city || form.district || form.lat || form.lng;

    const body = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      url,
      categoryId: form.categoryId || null,
      takenAtYear: form.takenAtYear ? parseInt(form.takenAtYear) : null,
      takenAtMonth: form.takenAtMonth ? parseInt(form.takenAtMonth) : null,
      takenAtDay: form.takenAtDay ? parseInt(form.takenAtDay) : null,
      datePrecision: form.datePrecision || null,
      location: hasLocation
        ? {
            region: form.region || null,
            city: form.city || null,
            district: form.district || null,
            lat: form.lat ? parseFloat(form.lat) : null,
            lng: form.lng ? parseFloat(form.lng) : null,
          }
        : undefined,
      tags: tagList,
    };

    const photoRes = await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setUploading(false);

    if (!photoRes.ok) {
      const data = await photoRes.json().catch(() => ({}));
      setError(data.error ?? "Failed to save photo record.");
      return;
    }

    const photo = await photoRes.json();
    router.push(`/photos/${photo.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl" noValidate>
      {error && (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
          {error}
        </div>
      )}

      {/* File picker */}
      <div>
        <label className="block text-sm font-medium mb-2" htmlFor="file-input">
          Image <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="file-input"
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          required
          className="block w-full text-sm text-[var(--muted-foreground)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[var(--primary-foreground)] hover:file:opacity-90"
        />
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">JPEG, PNG, WebP or GIF · max 10 MB</p>
        {preview && (
          <div className="relative mt-3 h-48 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]">
            <Image src={preview} alt="Preview" fill className="object-contain" />
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          required
          placeholder="A brief descriptive title"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-[var(--primary)]"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          placeholder="Historical context, story, or notes about this photo"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-[var(--primary)]"
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">
          Category / Region
        </label>
        <select
          id="category"
          value={form.categoryId}
          onChange={(e) => set("categoryId", e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-[var(--primary)]"
        >
          <option value="">— Select category —</option>
          {categories.map((parent) => (
            <optgroup key={parent.id} label={parent.name}>
              {parent.children.length > 0 && (
                <option value={parent.id}>All of {parent.name}</option>
              )}
              {parent.children.length === 0 && (
                <option value={parent.id}>{parent.name}</option>
              )}
              {parent.children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Date */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Date depicted</legend>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="year" className="block text-xs text-[var(--muted-foreground)] mb-1">Year</label>
            <input
              id="year"
              type="number"
              min={1800}
              max={new Date().getFullYear()}
              value={form.takenAtYear}
              onChange={(e) => set("takenAtYear", e.target.value)}
              placeholder="e.g. 1923"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-[var(--primary)]"
            />
          </div>
          <div>
            <label htmlFor="month" className="block text-xs text-[var(--muted-foreground)] mb-1">Month</label>
            <input
              id="month"
              type="number"
              min={1}
              max={12}
              value={form.takenAtMonth}
              onChange={(e) => set("takenAtMonth", e.target.value)}
              placeholder="1–12"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-[var(--primary)]"
            />
          </div>
          <div>
            <label htmlFor="day" className="block text-xs text-[var(--muted-foreground)] mb-1">Day</label>
            <input
              id="day"
              type="number"
              min={1}
              max={31}
              value={form.takenAtDay}
              onChange={(e) => set("takenAtDay", e.target.value)}
              placeholder="1–31"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-[var(--primary)]"
            />
          </div>
        </div>
        <div>
          <label htmlFor="precision" className="block text-xs text-[var(--muted-foreground)] mb-1">Date precision</label>
          <select
            id="precision"
            value={form.datePrecision}
            onChange={(e) => set("datePrecision", e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-[var(--primary)]"
          >
            <option value="">— Select precision —</option>
            <option value="YEAR">Year only</option>
            <option value="MONTH">Year + Month</option>
            <option value="DAY">Full date</option>
          </select>
        </div>
      </fieldset>

      {/* Location */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Location</legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="region" className="block text-xs text-[var(--muted-foreground)] mb-1">Region</label>
            <input
              id="region"
              type="text"
              value={form.region}
              onChange={(e) => set("region", e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-[var(--primary)]"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-xs text-[var(--muted-foreground)] mb-1">City</label>
            <input
              id="city"
              type="text"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-[var(--primary)]"
            />
          </div>
          <div>
            <label htmlFor="district" className="block text-xs text-[var(--muted-foreground)] mb-1">District</label>
            <input
              id="district"
              type="text"
              value={form.district}
              onChange={(e) => set("district", e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-[var(--primary)]"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lat" className="block text-xs text-[var(--muted-foreground)] mb-1">Latitude</label>
            <input
              id="lat"
              type="number"
              step="any"
              value={form.lat}
              onChange={(e) => set("lat", e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-[var(--primary)]"
            />
          </div>
          <div>
            <label htmlFor="lng" className="block text-xs text-[var(--muted-foreground)] mb-1">Longitude</label>
            <input
              id="lng"
              type="number"
              step="any"
              value={form.lng}
              onChange={(e) => set("lng", e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-[var(--primary)]"
            />
          </div>
        </div>
      </fieldset>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium mb-1">
          Tags
        </label>
        <input
          id="tags"
          type="text"
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder="e.g. bridge, pre-war, tram (comma-separated)"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-[var(--primary)]"
        />
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {uploading ? "Uploading…" : "Upload photo"}
      </button>
    </form>
  );
}

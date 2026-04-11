"use client";

import { useState } from "react";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: "VIEWER" | "CREATOR" | "ADMIN";
  blocked: boolean;
};

export function UserTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function saveUser(user: UserRow) {
    setSaving((s) => ({ ...s, [user.id]: true }));
    setErrors((e) => ({ ...e, [user.id]: "" }));

    const [roleRes, blockRes] = await Promise.all([
      fetch(`/api/users/${user.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: user.role }),
      }),
      fetch(`/api/users/${user.id}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: user.blocked }),
      }),
    ]);

    setSaving((s) => ({ ...s, [user.id]: false }));

    if (!roleRes.ok || !blockRes.ok) {
      setErrors((e) => ({ ...e, [user.id]: "Failed to save. Try again." }));
    }
  }

  function updateUser(id: string, patch: Partial<UserRow>) {
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Name</th>
            <th className="px-4 py-3 text-left font-semibold">Email</th>
            <th className="px-4 py-3 text-left font-semibold">Role</th>
            <th className="px-4 py-3 text-left font-semibold">Blocked</th>
            <th className="px-4 py-3 text-left font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-[var(--muted)] transition-colors">
              <td className="px-4 py-3">{user.name ?? "—"}</td>
              <td className="px-4 py-3 text-[var(--muted-foreground)]">{user.email}</td>
              <td className="px-4 py-3">
                <select
                  value={user.role}
                  onChange={(e) =>
                    updateUser(user.id, { role: e.target.value as UserRow["role"] })
                  }
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs focus-visible:outline-[var(--primary)]"
                >
                  <option value="VIEWER">Viewer</option>
                  <option value="CREATOR">Creator</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </td>
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={user.blocked}
                  onChange={(e) => updateUser(user.id, { blocked: e.target.checked })}
                  aria-label={`Block ${user.name ?? user.email}`}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
              </td>
              <td className="px-4 py-3 space-y-1">
                <button
                  onClick={() => saveUser(user)}
                  disabled={saving[user.id]}
                  className="rounded-md bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {saving[user.id] ? "Saving…" : "Save"}
                </button>
                {errors[user.id] && (
                  <p className="text-xs text-red-600">{errors[user.id]}</p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

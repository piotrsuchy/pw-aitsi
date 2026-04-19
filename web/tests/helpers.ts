import { NextRequest } from "next/server";

/** Create a NextRequest for use in route handler tests. */
export function makeReq(
  url: string,
  { method = "GET", body }: { method?: string; body?: unknown } = {}
) {
  return new NextRequest(new URL(url, "http://localhost"), {
    method,
    ...(body != null && {
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
  });
}

/** Wrap route params the way Next.js passes them (async). */
export function makeParams<T extends Record<string, string>>(p: T) {
  return { params: Promise.resolve(p) };
}

/** Minimal session shape returned by auth(). */
export function makeSession(
  overrides: { role?: string; blocked?: boolean; id?: string } = {}
) {
  return {
    user: {
      id: overrides.id ?? "user-1",
      role: overrides.role ?? "VIEWER",
      blocked: overrides.blocked ?? false,
      name: "Test User",
      email: "test@example.com",
      image: null,
    },
  };
}

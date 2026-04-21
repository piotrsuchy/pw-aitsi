import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { ThemeSwitcher } from "./theme-switcher";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
      >
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
        >
          Local Archive
        </Link>

        <ul className="flex items-center gap-1 text-sm font-medium" role="list">
          <li>
            <Link
              href="/browse"
              className="rounded-md px-3 py-2 hover:bg-[var(--muted)] transition-colors"
            >
              Browse
            </Link>
          </li>
          <li>
            <Link
              href="/search"
              className="rounded-md px-3 py-2 hover:bg-[var(--muted)] transition-colors"
            >
              Search
            </Link>
          </li>
          {session?.user.role === "ADMIN" && (
            <li>
              <Link
                href="/admin"
                className="rounded-md px-3 py-2 hover:bg-[var(--muted)] transition-colors"
              >
                Admin
              </Link>
            </li>
          )}
          {(session?.user.role === "CREATOR" ||
            session?.user.role === "ADMIN") && (
            <>
              <li>
                <Link
                  href="/creator/my-photos"
                  className="rounded-md px-3 py-2 hover:bg-[var(--muted)] transition-colors"
                >
                  My photos
                </Link>
              </li>

              <li>
                <Link
                  href="/creator/upload"
                  className="rounded-md bg-[var(--primary)] px-3 py-2 text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
                >
                  Add photo
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />

          {session ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--muted)] transition-colors"
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--muted)] transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

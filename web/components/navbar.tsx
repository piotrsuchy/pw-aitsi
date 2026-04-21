import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { ThemeSwitcher } from "./theme-switcher";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
      >
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
        >
          Local Archive
        </Link>

        <ul className="flex items-center gap-1 text-sm font-medium" role="list">
          <li>
            <Link
              href="/browse"
              className="rounded-md px-3 py-2 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              Browse
            </Link>
          </li>
          <li>
            <Link
              href="/search"
              className="rounded-md px-3 py-2 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              Search
            </Link>
          </li>
          {session?.user.role === "ADMIN" && (
            <li>
              <Link
                href="/admin"
                className="rounded-md px-3 py-2 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
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
                  className="rounded-md px-3 py-2 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  My photos
                </Link>
              </li>

              <li>
                <Link
                  href="/creator/upload"
                  className="rounded-md bg-blue-700 dark:bg-blue-600 px-3 py-2 text-white dark:text-zinc-950 hover:opacity-90 transition-opacity"
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
                className="rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

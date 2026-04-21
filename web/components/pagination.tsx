"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function Pagination({ 
  totalPages, 
  currentPage 
}: { 
  totalPages: number; 
  currentPage: number; 
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function buildLink(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  }

  return (
    <nav className="flex items-center justify-center gap-4 mt-10" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link
          href={buildLink(currentPage - 1)}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)] transition-colors focus-visible:outline-[var(--primary)]"
        >
          Previous
        </Link>
      ) : (
        <button disabled className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium opacity-50 cursor-not-allowed">
          Previous
        </button>
      )}

      <span className="text-sm font-medium text-[var(--muted-foreground)]">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={buildLink(currentPage + 1)}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)] transition-colors focus-visible:outline-[var(--primary)]"
        >
          Next
        </Link>
      ) : (
        <button disabled className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium opacity-50 cursor-not-allowed">
          Next
        </button>
      )}
    </nav>
  );
}

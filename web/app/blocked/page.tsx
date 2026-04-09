export const metadata = { title: "Account blocked – Local Archive" };

export default function BlockedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
          Account blocked
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Your account has been blocked by an administrator. Contact support if
          you believe this is a mistake.
        </p>
        <a
          href="/"
          className="inline-block text-[var(--primary)] underline hover:no-underline"
        >
          Back to home
        </a>
      </div>
    </main>
  );
}

import Link from "next/link";

export const inputClass =
  "w-full rounded-xl border border-taupe-200 bg-cream-50 px-4 py-2.5 text-ink outline-none transition-colors placeholder:text-taupe-400 focus:border-sage-500";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-cream-200 to-cream-50 px-4 py-14">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-4 inline-flex items-center text-sm font-medium text-sage-700 hover:text-sage-900">
          返回主页 · Back to Home
        </Link>
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2.5 text-ink"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-700 text-cream-50">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21c4-2.5 6-5.5 6-9a6 6 0 0 0-12 0c0 3.5 2 6.5 6 9Z" />
              <path d="M12 12c0-2.5 1-4.5 3-6" />
            </svg>
          </span>
          <span className="font-serif text-lg font-semibold">香气读懂你的心</span>
        </Link>

        <div className="rounded-[1.5rem] border border-taupe-200/60 bg-cream-50 p-7 shadow-card sm:p-9">
          <h1 className="font-serif text-2xl font-semibold text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-taupe-600">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <div className="mt-5 text-center text-sm text-taupe-600">{footer}</div>
        )}
      </div>
    </main>
  );
}

import Link from "next/link";

/** Shown when Supabase env vars are not set, so the membership area degrades
 *  gracefully instead of crashing. */
export default function NotConfigured() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream-100 px-4 py-16 text-center">
      <div className="max-w-md">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          会员系统尚未启用 · Membership not configured
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-taupe-600">
          需要先设置 Supabase 环境变量（见 <code>.env.example</code> 与 README）。
          The membership area needs the Supabase environment variables to be set.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-sage-700 px-6 py-2.5 text-sm font-medium text-cream-50 hover:bg-sage-800"
        >
          ← 返回首页 · Back to site
        </Link>
      </div>
    </main>
  );
}

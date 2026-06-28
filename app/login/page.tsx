"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/public-config";
import { getErrorMessage } from "@/lib/get-error-message";
import { AuthShell, inputClass } from "@/components/membership/AuthShell";
import NotConfigured from "@/components/membership/NotConfigured";
import AdminBrandMark from "@/components/admin/AdminBrandMark";

export const dynamic = "force-dynamic";

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/member";
  if (value.startsWith("/login") || value.startsWith("/register")) return "/member";
  if (value === "/admin") return "/admin/dashboard";
  return value;
}

export default function LoginPage() {
  const router = useRouter();
  const [next, setNext] = useState("/member");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isAdminLogin = next.startsWith("/admin") || next.startsWith("/staff");

  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("next");
    setNext(getSafeNext(n));
  }, []);

  if (!isSupabaseConfigured) return <NotConfigured />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        setError("请输入 Email。Email is required.");
        return;
      }
      if (!password) {
        setError("请输入密码。Password is required.");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) throw error;

      router.replace(getSafeNext(next));
    } catch (loginError) {
      console.error("Login error:", loginError);
      setError(getErrorMessage(loginError));
    } finally {
      setLoading(false);
    }
  }

  if (isAdminLogin) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_30%_10%,#f8ecd2_0%,#f7f1e6_28%,#ecdfcb_100%)] px-5 pb-10 pt-[calc(env(safe-area-inset-top)+2.25rem)] text-ink">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col">
          <Link href="/" className="inline-flex w-fit items-center rounded-full border border-taupe-200/70 bg-cream-50/70 px-4 py-2 text-sm font-semibold text-sage-700 shadow-sm">
            返回主页 · Back to Home
          </Link>

          <section className="flex flex-1 flex-col justify-center">
            <div className="mb-8 text-center">
              <AdminBrandMark size="lg" className="mx-auto" />
              <h1 className="mt-6 font-serif text-3xl font-semibold leading-tight text-ink">香气读懂你的心</h1>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.32em] text-sage-700">Admin App</p>
              <p className="mx-auto mt-5 max-w-xs text-sm leading-6 text-taupe-600">
                登录后直接进入手机后台，管理预约、会员积分与扫码服务。
              </p>
            </div>

            <form onSubmit={onSubmit} className="rounded-[1.75rem] border border-cream-50/70 bg-cream-50/88 p-5 shadow-[0_24px_70px_-38px_rgba(31,61,46,0.55)] backdrop-blur">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-taupe-700">Email</label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-h-14 w-full rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-base text-ink outline-none transition-colors placeholder:text-taupe-400 focus:border-sage-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-taupe-700">密码 · Password</label>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-h-14 w-full rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-base text-ink outline-none transition-colors placeholder:text-taupe-400 focus:border-sage-500"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-sage-50 px-3 py-2 text-xs font-medium text-sage-800">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sage-700 text-cream-50">✓</span>
                保持登录状态，减少下次打开等待时间
              </div>

              {error && <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex min-h-14 w-full items-center justify-center rounded-full bg-sage-800 px-6 text-base font-semibold text-cream-50 shadow-[0_18px_38px_-22px_rgba(31,61,46,0.95)] transition-colors hover:bg-sage-900 disabled:opacity-70"
              >
                {loading ? "正在进入后台…" : "登录 Admin App"}
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  return (
    <AuthShell
      title="登录 · Log in"
      subtitle="登录查看你的香气会员中心与专属推荐码。"
      footer={
        <>
          还没有账号？{" "}
          <Link href="/register" className="font-medium text-sage-700 hover:underline">
            注册成为会员 · Register
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-taupe-700">
            Email
          </label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-taupe-700">
            密码 · Password
          </label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-sage-700 px-6 py-3 text-base font-medium text-cream-50 transition-colors hover:bg-sage-800 disabled:opacity-60"
        >
          {loading ? "登录中…" : "登录 · Log in"}
        </button>
      </form>
    </AuthShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AuthShell, inputClass } from "@/components/membership/AuthShell";
import NotConfigured from "@/components/membership/NotConfigured";

export const dynamic = "force-dynamic";

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/member";
  if (value.startsWith("/login") || value.startsWith("/register")) return "/member";
  return value;
}

export default function LoginPage() {
  const router = useRouter();
  const [next, setNext] = useState("/member");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("next");
    setNext(getSafeNext(n));
  }, []);

  if (!isSupabaseConfigured) return <NotConfigured />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.push(getSafeNext(next));
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

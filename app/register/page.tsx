"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/public-config";
import { AuthShell, inputClass } from "@/components/membership/AuthShell";
import NotConfigured from "@/components/membership/NotConfigured";

export const dynamic = "force-dynamic";

function readRefCookie(): string {
  const m = document.cookie.match(/(?:^|;\s*)bsa_ref=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ref, setRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("ref");
    setRef((fromUrl || readRefCookie() || "").toUpperCase());
  }, []);

  if (!isSupabaseConfigured) return <NotConfigured />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          referred_by_code: ref.trim().toUpperCase() || null,
        },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (data.session) {
      router.push("/member");
    } else {
      setInfo("注册成功！请前往邮箱确认后再登录。Account created — please confirm via email, then log in.");
    }
  }

  return (
    <AuthShell
      title="注册成为会员 · Register"
      subtitle="注册即获得专属推荐码与 +10 会员积分。"
      footer={
        <>
          已经是会员？{" "}
          <Link href="/login" className="font-medium text-sage-700 hover:underline">
            登录 · Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-taupe-700">姓名 · Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-taupe-700">电话 · Phone</label>
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="01x-xxx xxxx" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-taupe-700">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-taupe-700">密码 · Password</label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-taupe-700">
            推荐码 · Referral code <span className="text-taupe-400">（可选 / optional）</span>
          </label>
          <input value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} className={inputClass} placeholder="ABCD1234" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-sage-700">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-sage-700 px-6 py-3 text-base font-medium text-cream-50 transition-colors hover:bg-sage-800 disabled:opacity-60"
        >
          {loading ? "注册中…" : "注册 · Register"}
        </button>
      </form>
    </AuthShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/public-config";
import { getErrorMessage } from "@/lib/get-error-message";
import { AuthShell, inputClass } from "@/components/membership/AuthShell";
import NotConfigured from "@/components/membership/NotConfigured";

export const dynamic = "force-dynamic";

type ReferralValidationResponse = {
  valid?: boolean;
  error?: string;
};

function readRefCookie(): string {
  const m = document.cookie.match(/(?:^|;\s*)bsa_ref=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

function formatRegisterErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);
  const lower = message.toLowerCase();

  if (
    lower.includes("user already registered") ||
    lower.includes("already registered") ||
    lower.includes("already been registered") ||
    lower.includes("email address already") ||
    (lower.includes("duplicate") && lower.includes("email"))
  ) {
    return "这个 Email 已经注册，请直接登录。";
  }

  if (lower.includes("database error saving new user")) {
    return "注册资料无法写入会员系统，请检查 Email / 电话是否已经注册，或稍后再试。";
  }

  return message === "{}" ? "注册失败，请稍后再试。" : message;
}

async function validateReferralCode(code: string): Promise<ReferralValidationResponse> {
  const response = await fetch(`/api/referral/validate?code=${encodeURIComponent(code)}`, {
    method: "GET",
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as ReferralValidationResponse;

  if (!response.ok) {
    throw new Error(body.error || `Referral validation failed (${response.status})`);
  }

  return body;
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
  const [warning, setWarning] = useState<string | null>(null);
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
    setWarning(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    let referralCode = ref.trim().toUpperCase();

    if (!trimmedName) {
      setError("请输入姓名。Name is required.");
      return;
    }
    if (!trimmedPhone) {
      setError("请输入电话 / WhatsApp。Phone is required.");
      return;
    }
    if (!trimmedEmail) {
      setError("请输入 Email。Email is required.");
      return;
    }
    if (trimmedPassword.length < 6) {
      setError("密码至少需要 6 位。Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (referralCode) {
        try {
          const referral = await validateReferralCode(referralCode);
          if (!referral.valid) {
            setWarning("Referral code not found. We will continue without a referral code.");
            referralCode = "";
          }
        } catch (referralError) {
          console.error("Register referral validation error:", referralError);
          setWarning(`${getErrorMessage(referralError)} We will continue without a referral code.`);
          referralCode = "";
        }
      }

      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        options: {
          data: {
            name: trimmedName,
            phone: trimmedPhone,
            referred_by_code: referralCode || null,
          },
        },
      });

      if (signUpError) throw signUpError;

      const identities = data.user?.identities;
      if (Array.isArray(identities) && identities.length === 0) {
        setError("这个 Email 已经注册，请直接登录。");
        return;
      }

      if (data.session) {
        router.push("/member");
      } else {
        setInfo("注册成功！请前往邮箱确认后再登录。Account created — please confirm via email, then log in.");
      }
    } catch (registerError) {
      console.error("Register error:", registerError);
      setError(formatRegisterErrorMessage(registerError));
    } finally {
      setLoading(false);
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

        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {warning && <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">{warning}</p>}
        {info && <p className="rounded-xl bg-sage-50 px-3 py-2 text-sm text-sage-700">{info}</p>}

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

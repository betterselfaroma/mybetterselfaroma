import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import NotConfigured from "@/components/membership/NotConfigured";
import { getUser, requireMember } from "@/lib/supabase/auth";
import { PortalHeader } from "@/components/membership/PortalHeader";
import { Card, PageTitle } from "@/components/membership/ui";
import BookForm from "@/components/membership/BookForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LINKS = [
  { href: "/member", label: "会员中心" },
  { href: "/member/referral", label: "推荐中心" },
  { href: "/member/rewards", label: "积分兑换" },
  { href: "/book", label: "预约" },
];

const PACKAGE_INFO = [
  { price: "RM60", name: "摸香状态测试体验", note: "适合第一次体验" },
  { price: "RM150", name: "专属特调精油方案", note: "包含 RM60 摸香测试 + RM90 专属精油调配" },
];

export default async function BookPage() {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const user = await getUser();

  // Logged-out: show a friendly gate instead of redirecting away.
  if (!user) {
    return (
      <div className="min-h-screen bg-cream-100 font-sans text-ink">
        <PortalHeader brandHref="/" links={LINKS} />
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <PageTitle title="预约体验" subtitle="Book your experience" />

          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            {PACKAGE_INFO.map((p) => (
              <div key={p.price} className="rounded-2xl border border-taupe-200/70 bg-cream-50 p-5">
                <div className="font-serif text-xl font-semibold text-sage-700">{p.price}</div>
                <div className="mt-1 font-medium text-ink">{p.name}</div>
                <div className="mt-1 text-sm text-taupe-500">{p.note}</div>
              </div>
            ))}
          </div>

          <Card className="text-center">
            <p className="font-serif text-lg font-semibold text-ink">请先登录或注册会员后再预约体验。</p>
            <p className="mt-2 text-sm text-taupe-600">Please log in or register before booking your experience.</p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/login?next=/book"
                className="inline-flex items-center justify-center rounded-full border border-sage-300 bg-cream-50 px-6 py-3 text-sm font-medium text-sage-700 transition-colors hover:border-sage-500"
              >
                登录 · Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-sage-700 px-6 py-3 text-sm font-medium text-cream-50 transition-colors hover:bg-sage-800"
              >
                注册会员 · Register
              </Link>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const customer = await requireMember();

  return (
    <div className="min-h-screen bg-cream-100 font-sans text-ink">
      <PortalHeader brandHref="/member" links={LINKS} points={customer.points_balance} />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <PageTitle
          title="预约体验"
          subtitle="Book your experience · 选择套餐，提交后我们会通过 WhatsApp 与你确认时间。"
        />
        <BookForm defaultPhone={customer.phone ?? ""} />
      </main>
    </div>
  );
}

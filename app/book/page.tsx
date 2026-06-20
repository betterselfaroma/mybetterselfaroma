import { isSupabaseConfigured } from "@/lib/supabase/config";
import NotConfigured from "@/components/membership/NotConfigured";
import { requireMember } from "@/lib/supabase/auth";
import { PortalHeader } from "@/components/membership/PortalHeader";
import { PageTitle } from "@/components/membership/ui";
import BookForm from "@/components/membership/BookForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LINKS = [
  { href: "/member", label: "会员中心" },
  { href: "/member/referral", label: "推荐中心" },
  { href: "/member/rewards", label: "积分兑换" },
  { href: "/book", label: "预约" },
];

export default async function BookPage() {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const customer = await requireMember();

  return (
    <div className="min-h-screen bg-cream-100 font-sans text-ink">
      <PortalHeader brandHref="/member" links={LINKS} points={customer.points_balance} />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <PageTitle
          title="预约体验"
          subtitle="Book your experience · 选择套餐，提交后我们会通过 WhatsApp 与你确认时间。"
        />
        <BookForm />
      </main>
    </div>
  );
}

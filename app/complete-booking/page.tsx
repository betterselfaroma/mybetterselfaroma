import Link from "next/link";
import { redirect } from "next/navigation";
import { completeBookingCheckIn } from "./actions";
import { getUser, requireMember } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import NotConfigured from "@/components/membership/NotConfigured";
import { Badge, Card } from "@/components/membership/ui";
import { pkgLabel } from "@/lib/membership-format";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const POINTS_BY_PACKAGE: Record<string, number> = {
  scent_test: 20,
  custom_blend: 60,
};

function singaporeDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Singapore",
  }).format(new Date(value));
}

function MessageCard({
  title,
  body,
  tone = "invalid",
}: {
  title: string;
  body: string;
  tone?: string;
}) {
  return (
    <main className="min-h-screen bg-cream-100 px-4 py-14 text-ink sm:px-6">
      <div className="mx-auto max-w-xl">
        <Card>
          <Badge status={tone}>{tone}</Badge>
          <h1 className="mt-5 font-serif text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-3 text-sm leading-7 text-taupe-600">{body}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/member" className="rounded-full bg-sage-700 px-5 py-3 text-center text-sm font-semibold text-cream-50 hover:bg-sage-800">
              返回会员中心 · Member Center
            </Link>
            <Link href="/" className="rounded-full border border-sage-700/30 px-5 py-3 text-center text-sm font-semibold text-sage-800 hover:border-sage-700">
              返回主页 · Back to Home
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}

export default async function CompleteBookingPage({
  searchParams,
}: {
  searchParams?: { token?: string; status?: string };
}) {
  if (!isSupabaseConfigured) return <NotConfigured />;

  const token = typeof searchParams?.token === "string" ? searchParams.token.trim() : "";
  const requestedStatus = typeof searchParams?.status === "string" ? searchParams.status : "";

  if (!token) {
    return (
      <MessageCard
        title="这个完成打卡链接无效或不存在。"
        body="This completion check-in link is invalid or does not exist."
      />
    );
  }

  const user = await getUser();
  if (!user) {
    const next = `/complete-booking?token=${encodeURIComponent(token)}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const customer = await requireMember();
  const supabase = createAdminClient();
  const { data: tokenRow } = await supabase
    .from("booking_completion_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow || tokenRow.customer_id !== customer.id || requestedStatus === "invalid") {
    return (
      <MessageCard
        title="这个完成打卡链接无效或不存在。"
        body="This completion check-in link is invalid or does not exist."
      />
    );
  }

  if (tokenRow.status === "active" && new Date(tokenRow.expires_at).getTime() <= Date.now()) {
    await supabase
      .from("booking_completion_tokens")
      .update({ status: "expired" })
      .eq("id", tokenRow.id)
      .eq("status", "active");
    tokenRow.status = "expired";
  }

  if (requestedStatus === "success" && tokenRow.status === "used" && tokenRow.used_by_customer_id === customer.id) {
    return (
      <MessageCard
        title="打卡成功，你的会员记录已更新。"
        body="Check-in completed. Your member record has been updated. Your points have been added to your account."
        tone="completed"
      />
    );
  }

  if (tokenRow.status === "used" || requestedStatus === "used") {
    return (
      <MessageCard
        title="这个完成打卡链接已经使用过。"
        body="This completion check-in link has already been used."
        tone="used"
      />
    );
  }

  if (tokenRow.status === "expired" || requestedStatus === "expired") {
    return (
      <MessageCard
        title="这个完成打卡链接已过期，请联系工作人员重新生成。"
        body="This completion check-in link has expired. Please ask our team to generate a new one."
        tone="expired"
      />
    );
  }

  if (tokenRow.status !== "active") {
    return (
      <MessageCard
        title="这个完成打卡链接无效或不存在。"
        body="This completion check-in link is invalid or does not exist."
      />
    );
  }

  const points = POINTS_BY_PACKAGE[tokenRow.package_type] ?? 0;

  return (
    <main className="min-h-screen bg-cream-100 px-4 py-14 text-ink sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-600">Booking Completion QR</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">确认完成体验 · Confirm Booking Completion</h1>
          <p className="mt-3 text-sm leading-7 text-taupe-600">
            请确认这是你本人完成的线下体验。确认后，系统会记录本次完成，并自动加入对应会员积分。
          </p>

          <dl className="mt-7 grid gap-4 rounded-2xl bg-cream-100 p-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-taupe-500">会员 · Member</dt>
              <dd className="mt-1 font-semibold text-ink">{customer.name || customer.email}</dd>
              <dd className="text-xs text-taupe-500">{customer.email}</dd>
            </div>
            <div>
              <dt className="text-taupe-500">项目 · Package</dt>
              <dd className="mt-1 font-semibold text-sage-700">{pkgLabel(tokenRow.package_type)}</dd>
            </div>
            <div>
              <dt className="text-taupe-500">完成日期时间 · Completed at</dt>
              <dd className="mt-1 font-semibold text-ink">{singaporeDateTime(new Date())}</dd>
            </div>
            <div>
              <dt className="text-taupe-500">本次积分 · Points</dt>
              <dd className="mt-1 font-semibold text-sage-700">+{points} points</dd>
            </div>
          </dl>

          <form action={completeBookingCheckIn} className="mt-7">
            <input type="hidden" name="token" value={token} />
            <button className="w-full rounded-full bg-sage-700 px-6 py-3.5 text-base font-semibold text-cream-50 shadow-soft hover:bg-sage-800">
              确认完成打卡 · Confirm Check-in
            </button>
          </form>

          <Link href="/member" className="mt-5 inline-block text-sm font-medium text-sage-700 hover:underline">
            返回会员中心 · Back to Member Center
          </Link>
        </Card>
      </div>
    </main>
  );
}

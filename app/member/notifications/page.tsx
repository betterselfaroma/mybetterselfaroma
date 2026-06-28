import Link from "next/link";
import { requireMember } from "@/lib/supabase/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { BOOKING_STABLE_SELECT, bookingPackageLabel } from "@/lib/admin-mobile";
import { Badge, Card, EmptyState, PageTitle } from "@/components/membership/ui";
import {
  formatSingaporeDate,
  formatSingaporeTimeRange,
  getBookingEnd,
  getBookingStart,
  todayInSingapore,
} from "@/lib/booking-config";
import {
  BOOKING_STATUS_LABEL,
  REDEMPTION_STATUS_LABEL,
  REWARD_STATUS_LABEL,
  fmtDate,
} from "@/lib/membership-format";
import type { Booking, RewardRedemption, ReferralReward } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type NoticeTone = "important" | "info" | "success" | "muted";
type NoticeCategory = "action" | "booking" | "reward" | "referral";

type Notice = {
  id: string;
  category: NoticeCategory;
  title: string;
  body: string;
  meta: string;
  tone: NoticeTone;
  href?: string;
  actionLabel?: string;
};

type RedemptionRow = RewardRedemption & {
  product_id?: string | null;
  points_cost?: number | null;
};

type PageProps = {
  searchParams?: {
    category?: string;
  };
};

const CATEGORY_FILTERS = [
  { value: "all", label: "全部 · All" },
  { value: "action", label: "待处理 · Action" },
  { value: "booking", label: "预约 · Booking" },
  { value: "reward", label: "兑换 · Rewards" },
  { value: "referral", label: "推荐 · Referral" },
];

const VALID_CATEGORY = new Set(CATEGORY_FILTERS.map((filter) => filter.value));

function ownerFilter(customerId: string, authUserId?: string | null) {
  const filters = [`user_id.eq.${customerId}`, `customer_id.eq.${customerId}`];
  if (authUserId) filters.push(`user_id.eq.${authUserId}`);
  return filters.join(",");
}

function toneClass(tone: NoticeTone) {
  if (tone === "important") return "border-gold-300/70 bg-gold-300/15";
  if (tone === "success") return "border-sage-300/70 bg-sage-50";
  if (tone === "muted") return "border-taupe-200/70 bg-cream-100";
  return "border-taupe-200/70 bg-cream-50";
}

export default async function MemberNotificationsPage({ searchParams }: PageProps) {
  const customer = await requireMember();
  const supabase = await createServerSupabase();
  const today = todayInSingapore();
  const selectedCategory = VALID_CATEGORY.has(searchParams?.category ?? "")
    ? searchParams?.category ?? "all"
    : "all";

  const [bookingsRes, redemptionsRes, referralRewardsRes] = await Promise.all([
    supabase
      .from("bookings")
      .select(`${BOOKING_STABLE_SELECT},customer_id`)
      .or(ownerFilter(customer.id, customer.auth_user_id))
      .order("booking_date", { ascending: false })
      .order("booking_time", { ascending: false })
      .limit(20),
    supabase
      .from("reward_redemptions")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("referral_rewards")
      .select("*")
      .eq("referrer_customer_id", customer.id)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  if (bookingsRes.error) console.error("Load member notification bookings failed:", bookingsRes.error);
  if (redemptionsRes.error) console.error("Load member notification redemptions failed:", redemptionsRes.error);
  if (referralRewardsRes.error) console.error("Load member notification referral rewards failed:", referralRewardsRes.error);

  const bookings = (bookingsRes.error ? [] : bookingsRes.data ?? []) as Booking[];
  const redemptions = (redemptionsRes.error ? [] : redemptionsRes.data ?? []) as RedemptionRow[];
  const referralRewards = (referralRewardsRes.error ? [] : referralRewardsRes.data ?? []) as ReferralReward[];
  const notices: Notice[] = [];

  if (!customer.phone) {
    notices.push({
      id: "profile-phone",
      category: "action",
      title: "请补齐 WhatsApp 电话",
      body: "预约提醒和工作人员联系会优先使用会员资料里的电话。",
      meta: "会员资料",
      tone: "important",
      href: "/member#member-profile",
      actionLabel: "更新资料",
    });
  }

  if (!customer.qr_token) {
    notices.push({
      id: "member-qr",
      category: "action",
      title: "会员 QR 尚未准备好",
      body: "到店扫码需要会员 QR Token。请刷新页面，或让管理员在会员列表生成。",
      meta: "会员 QR",
      tone: "important",
      href: "/member#member-qr",
      actionLabel: "查看 QR",
    });
  }

  bookings.forEach((booking) => {
    const start = getBookingStart(booking) ?? booking.created_at;
    const end = getBookingEnd(booking);
    const bookingDate = booking.booking_date ?? "";
    const isUpcoming = bookingDate >= today && ["pending", "confirmed"].includes(booking.status);
    const isCompleted = booking.status === "completed";
    const isCancelled = booking.status === "cancelled";

    if (!isUpcoming && !isCompleted && !isCancelled) return;

    notices.push({
      id: `booking-${booking.id}`,
      category: "booking",
      title: isUpcoming ? "即将到来的预约" : isCompleted ? "预约已完成" : "预约已取消",
      body: `${bookingPackageLabel(booking)} · ${formatSingaporeDate(start)} · ${formatSingaporeTimeRange(start, end)}`,
      meta: BOOKING_STATUS_LABEL[booking.status] ?? booking.status,
      tone: isUpcoming ? "important" : isCompleted ? "success" : "muted",
      href: `/member/bookings/${booking.id}`,
      actionLabel: isUpcoming ? "查看预约" : "查看记录",
    });
  });

  redemptions.forEach((redemption) => {
    const points = Number(redemption.points_cost ?? redemption.points_used ?? 0);
    notices.push({
      id: `redemption-${redemption.id}`,
      category: "reward",
      title: "积分兑换状态更新",
      body: `${fmtDate(redemption.created_at)} · −${points} pts`,
      meta: REDEMPTION_STATUS_LABEL[redemption.status] ?? redemption.status,
      tone: redemption.status === "completed" ? "success" : redemption.status === "cancelled" ? "muted" : "info",
      href: `/member/rewards/${redemption.id}`,
      actionLabel: "查看详情",
    });
  });

  referralRewards.forEach((reward) => {
    notices.push({
      id: `referral-reward-${reward.id}`,
      category: "referral",
      title: "推荐奖励状态更新",
      body: `${reward.reward_value} TNG PIN · ${fmtDate(reward.created_at)}`,
      meta: REWARD_STATUS_LABEL[reward.status] ?? reward.status,
      tone: reward.status === "issued" ? "success" : reward.status === "cancelled" ? "muted" : "info",
      href: "/member/referral",
      actionLabel: "查看推荐",
    });
  });

  const filteredNotices = selectedCategory === "all"
    ? notices
    : notices.filter((notice) => notice.category === selectedCategory);
  const limitedNotices = filteredNotices.slice(0, 30);
  const noticeCount = (category: string) => (
    category === "all"
      ? notices.length
      : notices.filter((notice) => notice.category === category).length
  );

  return (
    <div className="space-y-6">
      <PageTitle
        title="通知中心"
        subtitle="Member Notifications · 查看预约、兑换、推荐奖励和会员资料提醒。"
      />

      {(bookingsRes.error || redemptionsRes.error || referralRewardsRes.error) && (
        <Card className="border-gold-300/60 bg-gold-300/15">
          <p className="text-sm font-semibold text-ink">部分通知暂时无法载入</p>
          <div className="mt-2 space-y-1 text-sm leading-6 text-taupe-700">
            {bookingsRes.error && <p>预约：{bookingsRes.error.message}</p>}
            {redemptionsRes.error && <p>兑换：{redemptionsRes.error.message}</p>}
            {referralRewardsRes.error && <p>推荐奖励：{referralRewardsRes.error.message}</p>}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORY_FILTERS.map((filter) => (
            <Link
              key={filter.value}
              href={filter.value === "all" ? "/member/notifications" : `/member/notifications?category=${filter.value}`}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                selectedCategory === filter.value
                  ? "bg-sage-700 text-cream-50"
                  : "border border-taupe-200 bg-cream-50 text-sage-700"
              }`}
            >
              {filter.label} ({noticeCount(filter.value)})
            </Link>
          ))}
        </div>
      </Card>

      {limitedNotices.length === 0 ? (
        <Card>
          <EmptyState>目前没有新的会员通知 · No notifications yet</EmptyState>
        </Card>
      ) : (
        <div className="grid gap-3">
          {limitedNotices.map((notice) => (
            <article key={notice.id} className={`rounded-[1.35rem] border p-4 shadow-sm ${toneClass(notice.tone)}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-ink">{notice.title}</p>
                  <p className="mt-1 text-sm leading-6 text-taupe-600">{notice.body}</p>
                  <div className="mt-2">
                    <Badge status={notice.tone === "success" ? "completed" : notice.tone === "important" ? "pending" : "confirmed"}>
                      {notice.meta}
                    </Badge>
                  </div>
                </div>
                {notice.href && notice.actionLabel && (
                  <Link href={notice.href} className="shrink-0 rounded-full bg-sage-700 px-4 py-2 text-center text-xs font-bold text-cream-50">
                    {notice.actionLabel}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

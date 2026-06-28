import Link from "next/link";
import { Badge, EmptyState } from "./ui";
import { bookingPackageLabel } from "@/lib/admin-mobile";
import {
  BOOKING_STATUS_LABEL,
  LEDGER_LABEL,
  REWARD_STATUS_LABEL,
  fmtDate,
} from "@/lib/membership-format";
import type { Booking, PointsLedgerEntry, ReferralReward } from "@/lib/supabase/types";

const EXPERIENCE_POINTS: Record<string, number> = {
  scent_test: 20,
  custom_blend: 60,
};

function ActivityCard({
  title,
  href,
  action,
  children,
}: {
  title: string;
  href: string;
  action: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.35rem] border border-taupe-200/70 bg-cream-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-lg font-semibold text-ink">{title}</h3>
        <Link href={href} className="shrink-0 text-xs font-bold text-sage-700 hover:underline">
          {action}
        </Link>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function MiniList({ children }: { children: React.ReactNode }) {
  return <ul className="divide-y divide-taupe-200/60">{children}</ul>;
}

function MiniRow({
  href,
  title,
  meta,
  right,
}: {
  href?: string;
  title: string;
  meta: string;
  right?: React.ReactNode;
}) {
  const body = (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-xs text-taupe-500">{meta}</p>
      </div>
      {right ? <div className="shrink-0 text-right">{right}</div> : null}
    </div>
  );

  return href ? (
    <li>
      <Link href={href} className="block">{body}</Link>
    </li>
  ) : (
    <li>{body}</li>
  );
}

export default function MemberRecentActivity({
  ledger,
  rewards,
  completedBookings,
  bookings,
}: {
  ledger: PointsLedgerEntry[];
  rewards: ReferralReward[];
  completedBookings: Booking[];
  bookings: Booking[];
}) {
  const recentLedger = ledger.slice(0, 3);
  const recentRewards = rewards.slice(0, 3);
  const recentCompleted = completedBookings.slice(0, 3);
  const recentBookings = bookings.slice(0, 3);

  return (
    <section className="rounded-[1.65rem] border border-taupe-200/70 bg-cream-50 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Recent Activity</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">最近活动</h2>
          <p className="mt-2 text-sm leading-6 text-taupe-600">
            积分、奖励、体验和预约记录集中在这里，详细内容可进入对应页面查看。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/member/points" className="rounded-full border border-sage-300 px-4 py-2 text-xs font-bold text-sage-700">
            积分
          </Link>
          <Link href="/member/bookings" className="rounded-full border border-sage-300 px-4 py-2 text-xs font-bold text-sage-700">
            预约
          </Link>
          <Link href="/member/notifications" className="rounded-full bg-sage-700 px-4 py-2 text-xs font-bold text-cream-50">
            通知
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ActivityCard title="积分记录" href="/member/points" action="全部">
          {recentLedger.length === 0 ? (
            <EmptyState>暂无积分记录</EmptyState>
          ) : (
            <MiniList>
              {recentLedger.map((entry) => (
                <MiniRow
                  key={entry.id}
                  title={LEDGER_LABEL[entry.type] ?? entry.type}
                  meta={fmtDate(entry.created_at)}
                  right={
                    <span className={`font-serif text-xl font-semibold ${entry.points >= 0 ? "text-sage-700" : "text-taupe-500"}`}>
                      {entry.points >= 0 ? "+" : ""}{entry.points}
                    </span>
                  }
                />
              ))}
            </MiniList>
          )}
        </ActivityCard>

        <ActivityCard title="TnG PIN 奖励" href="/member/referral" action="推荐中心">
          {recentRewards.length === 0 ? (
            <EmptyState>暂无推荐奖励</EmptyState>
          ) : (
            <MiniList>
              {recentRewards.map((reward) => (
                <MiniRow
                  key={reward.id}
                  title={`${reward.reward_value} TnG PIN`}
                  meta={fmtDate(reward.created_at)}
                  right={<Badge status={reward.status}>{REWARD_STATUS_LABEL[reward.status] ?? reward.status}</Badge>}
                />
              ))}
            </MiniList>
          )}
        </ActivityCard>

        <ActivityCard title="完成体验" href="/member/bookings?status=completed" action="记录">
          {recentCompleted.length === 0 ? (
            <EmptyState>暂无完成体验</EmptyState>
          ) : (
            <MiniList>
              {recentCompleted.map((booking) => {
                const packageKey = booking.package_code || "scent_test";
                return (
                  <MiniRow
                    key={booking.id}
                    href={`/member/bookings/${booking.id}`}
                    title={bookingPackageLabel(booking)}
                    meta={fmtDate(booking.booking_date ?? booking.created_at)}
                    right={<span className="text-sm font-bold text-sage-700">+{EXPERIENCE_POINTS[packageKey] ?? 0} pts</span>}
                  />
                );
              })}
            </MiniList>
          )}
        </ActivityCard>

        <ActivityCard title="最近预约" href="/member/bookings" action="全部">
          {recentBookings.length === 0 ? (
            <EmptyState>暂无预约记录</EmptyState>
          ) : (
            <MiniList>
              {recentBookings.map((booking) => (
                <MiniRow
                  key={booking.id}
                  href={`/member/bookings/${booking.id}`}
                  title={bookingPackageLabel(booking)}
                  meta={fmtDate(booking.booking_date ?? booking.created_at)}
                  right={<Badge status={booking.status}>{BOOKING_STATUS_LABEL[booking.status] ?? booking.status}</Badge>}
                />
              ))}
            </MiniList>
          )}
        </ActivityCard>
      </div>
    </section>
  );
}

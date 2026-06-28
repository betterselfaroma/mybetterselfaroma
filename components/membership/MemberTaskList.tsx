import Link from "next/link";
import type { ReactNode } from "react";
import { bookingPackageLabel } from "@/lib/admin-mobile";
import {
  formatSingaporeDate,
  formatSingaporeTimeRange,
  getBookingEnd,
  getBookingStart,
  todayInSingapore,
} from "@/lib/booking-config";
import type { Booking, Customer } from "@/lib/supabase/types";

export default function MemberTaskList({
  customer,
  bookings,
  memberQrReady,
}: {
  customer: Customer;
  bookings: Booking[];
  memberQrReady: boolean;
}) {
  const today = todayInSingapore();
  const upcoming = bookings
    .filter((booking) => ["pending", "confirmed"].includes(booking.status))
    .filter((booking) => !booking.booking_date || booking.booking_date >= today)
    .sort((a, b) => `${a.booking_date ?? ""} ${a.booking_time ?? ""}`.localeCompare(`${b.booking_date ?? ""} ${b.booking_time ?? ""}`))[0];
  const tasks: ReactNode[] = [];

  if (!customer.phone) {
    tasks.push(
      <TaskItem
        key="phone"
        title="补齐 WhatsApp 电话"
        body="预约提醒和联系会优先使用你的会员电话。"
        actionHref="#member-profile"
        actionLabel="更新资料"
      />,
    );
  }

  if (!memberQrReady) {
    tasks.push(
      <TaskItem
        key="qr"
        title="会员 QR 尚未准备好"
        body="请刷新页面，或让管理员在会员列表生成 QR Token。"
        actionHref="#member-qr"
        actionLabel="查看 QR"
      />,
    );
  }

  if (upcoming) {
    const start = getBookingStart(upcoming) ?? upcoming.created_at;
    const end = getBookingEnd(upcoming);
    tasks.push(
      <TaskItem
        key="booking"
        title={`下一场预约：${bookingPackageLabel(upcoming)}`}
        body={`${formatSingaporeDate(start)} · ${formatSingaporeTimeRange(start, end)}`}
        actionHref={`/member/bookings/${upcoming.id}`}
        actionLabel="查看详情"
        secondaryHref={`/book?reschedule=${upcoming.id}`}
        secondaryLabel="修改预约"
      />,
    );
  }

  if (Number(customer.points_balance ?? customer.points ?? 0) > 0) {
    tasks.push(
      <TaskItem
        key="rewards"
        title="积分可用于兑换"
        body={`你目前有 ${customer.points_balance ?? customer.points ?? 0} points，可查看可兑换商品。`}
        actionHref="/member/points"
        actionLabel="积分明细"
        secondaryHref="/member/rewards"
        secondaryLabel="积分兑换"
      />,
    );
  }

  if (tasks.length === 0) {
    tasks.push(
      <TaskItem
        key="all-good"
        title="会员资料已准备好"
        body="你可以直接预约体验、出示 QR 或分享推荐码。"
        actionHref="/book"
        actionLabel="预约体验"
      />,
    );
  }

  return (
    <section className="rounded-[1.5rem] border border-taupe-200/70 bg-cream-50 p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Today</p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-ink">待处理事项 · Member Tasks</h2>
        </div>
        <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-bold text-sage-700">
          {tasks.length}
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {tasks}
      </div>
    </section>
  );
}

function TaskItem({
  title,
  body,
  actionHref,
  actionLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <article className="rounded-2xl bg-cream-100 px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-ink">{title}</p>
          <p className="mt-1 text-sm leading-6 text-taupe-600">{body}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href={actionHref} className="rounded-full bg-sage-700 px-4 py-2 text-xs font-bold text-cream-50">
            {actionLabel}
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link href={secondaryHref} className="rounded-full border border-gold-400/70 px-4 py-2 text-xs font-bold text-sage-800">
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

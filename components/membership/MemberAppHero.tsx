import Link from "next/link";

export default function MemberAppHero({
  name,
  points,
  referralCode,
  referralCount,
  bookingCount,
  qrReady,
}: {
  name: string | null;
  points: number;
  referralCode: string;
  referralCount: number;
  bookingCount: number;
  qrReady: boolean;
}) {
  const displayName = name?.trim() || "会员";

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-sage-700/15 bg-sage-900 text-cream-50 shadow-[0_24px_60px_rgba(31,61,46,0.22)]">
      <div className="relative px-5 py-6 sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/70 to-transparent" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full border border-gold-300/20" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-gold-300/10 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">
            Member App
          </p>
          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-serif text-2xl font-semibold leading-tight text-cream-50 sm:text-4xl">
                欢迎回来，{displayName}
              </h1>
              <p className="mt-2 text-sm leading-6 text-cream-100/78">
                这里可以出示会员 QR、预约体验、查看积分、通知与推荐奖励。
              </p>
            </div>

            <div className="rounded-3xl border border-cream-50/12 bg-cream-50/10 px-5 py-4 text-left shadow-inner sm:min-w-40">
              <div className="text-xs uppercase tracking-[0.16em] text-cream-100/65">Points</div>
              <div className="mt-1 font-serif text-4xl font-semibold text-gold-100">{points}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl bg-cream-50/10 px-3 py-3">
              <div className="text-[11px] text-cream-100/60">推荐码</div>
              <div className="mt-1 truncate font-semibold tracking-[0.08em] text-cream-50">{referralCode}</div>
            </div>
            <div className="rounded-2xl bg-cream-50/10 px-3 py-3">
              <div className="text-[11px] text-cream-100/60">成功推荐</div>
              <div className="mt-1 font-semibold text-cream-50">{referralCount}</div>
            </div>
            <div className="rounded-2xl bg-cream-50/10 px-3 py-3">
              <div className="text-[11px] text-cream-100/60">预约记录</div>
              <div className="mt-1 font-semibold text-cream-50">{bookingCount}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link
              href="#member-qr"
              className="rounded-full bg-cream-50 px-4 py-3 text-center text-sm font-semibold text-sage-900 shadow-sm transition hover:bg-gold-100"
            >
              出示 QR
            </Link>
            <Link
              href="/member/points"
              className="rounded-full border border-cream-50/35 px-4 py-3 text-center text-sm font-semibold text-cream-50 transition hover:bg-cream-50/10"
            >
              积分明细
            </Link>
            <Link
              href="/book"
              className="rounded-full border border-cream-50/35 px-4 py-3 text-center text-sm font-semibold text-cream-50 transition hover:bg-cream-50/10"
            >
              预约体验
            </Link>
            <Link
              href="/member/bookings"
              className="rounded-full border border-cream-50/20 px-4 py-3 text-center text-sm font-semibold text-cream-50/90 transition hover:bg-cream-50/10"
            >
              预约记录
            </Link>
            <Link
              href="/member/notifications"
              className="rounded-full border border-cream-50/20 px-4 py-3 text-center text-sm font-semibold text-cream-50/90 transition hover:bg-cream-50/10"
            >
              通知中心
            </Link>
            <Link
              href="/member/referral"
              className="rounded-full border border-cream-50/20 px-4 py-3 text-center text-sm font-semibold text-cream-50/90 transition hover:bg-cream-50/10"
            >
              推荐奖励
            </Link>
            <Link
              href="/member/rewards"
              className="rounded-full border border-cream-50/20 px-4 py-3 text-center text-sm font-semibold text-cream-50/90 transition hover:bg-cream-50/10"
            >
              积分兑换
            </Link>
          </div>

          {!qrReady && (
            <div className="mt-4 rounded-2xl border border-gold-300/35 bg-gold-300/12 px-4 py-3 text-sm text-gold-100">
              QR Token 尚未准备好，请刷新页面或让管理员在会员列表生成。
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

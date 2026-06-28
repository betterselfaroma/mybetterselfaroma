import Link from "next/link";
import { Card } from "./ui";
import CopyButton from "@/components/member/CopyButton";

export default function MemberReferralCard({
  referralCode,
  referralLink,
}: {
  referralCode: string;
  referralLink: string;
}) {
  return (
    <Card className="border-gold-400/40 bg-gradient-to-br from-cream-50 via-cream-50 to-gold-300/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Referral</p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-ink">我的推荐码 · Your referral code</h2>
          <p className="mt-2 text-sm leading-6 text-taupe-600">
            分享给朋友，朋友完成首次 RM60 或 RM150 体验后，你可获得 RM10 TnG PIN 与会员积分奖励。
          </p>
        </div>
        <Link href="/member/referral" className="shrink-0 rounded-full border border-sage-300 px-4 py-2 text-sm font-semibold text-sage-700">
          推荐中心
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <span className="rounded-xl border border-gold-400/50 bg-gold-300/15 px-5 py-3 font-serif text-2xl font-bold tracking-[0.15em] text-sage-800">
          {referralCode}
        </span>
        <CopyButton text={referralLink} label="复制推荐链接" copiedLabel="已复制！" toast="已复制推荐链接" />
      </div>
      <p className="mt-3 break-all text-xs text-taupe-500">{referralLink}</p>
    </Card>
  );
}

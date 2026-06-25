// Stable package code -> displayed price. Change prices HERE only.
// Legacy RM-string keys are kept so any pre-migration booking rows still render.
export const PACKAGE_PRICE: Record<string, string> = {
  scent_test: "RM60",
  custom_blend: "RM150",
  // legacy fallbacks
  RM49: "RM60",
  RM66: "RM60",
  RM129: "RM150",
  RM136: "RM150",
};

export const PACKAGE_LABEL: Record<string, string> = {
  scent_test: "RM60 · 摸香状态测试体验",
  custom_blend: "RM150 · 专属特调精油方案",
  // legacy fallbacks
  RM49: "RM60 · 摸香状态测试体验",
  RM66: "RM60 · 摸香状态测试体验",
  RM129: "RM150 · 专属特调精油方案",
  RM136: "RM150 · 专属特调精油方案",
};

export const pkgPrice = (t: string): string => PACKAGE_PRICE[t] ?? t;
export const pkgLabel = (t: string): string => PACKAGE_LABEL[t] ?? t;

export const LEDGER_LABEL: Record<string, string> = {
  signup_bonus: "注册奖励 · Signup bonus",
  purchase_rm49: "完成 RM60 · RM60 completed",
  purchase_rm129: "完成 RM150 · RM150 completed",
  referral_rm49: "推荐 RM60 · Referral RM60",
  referral_rm129: "推荐 RM150 · Referral RM150",
  redeem: "积分兑换 · Redeemed",
  manual_adjustment: "后台调整 · Adjustment",
};

export const REWARD_STATUS_LABEL: Record<string, string> = {
  pending: "待审核 · Pending",
  approved: "已审核 · Approved",
  issued: "已发放 · Issued",
  cancelled: "已取消 · Cancelled",
};

export const BOOKING_STATUS_LABEL: Record<string, string> = {
  pending: "待确认 · Pending",
  booked: "已预约 · Booked",
  confirmed: "已确认 · Confirmed",
  completed: "已完成 · Completed",
  cancelled: "已取消 · Cancelled",
  no_show: "未出席 · No-show",
};

export const REDEMPTION_STATUS_LABEL: Record<string, string> = {
  pending: "待审核 · Pending",
  approved: "已批准 · Approved",
  completed: "已完成 · Completed",
  cancelled: "已取消 · Cancelled",
};

export function fmtDate(d: string | null): string {
  if (!d) return "—";
  return d.slice(0, 10);
}

export const LEDGER_LABEL: Record<string, string> = {
  signup_bonus: "注册奖励 · Signup bonus",
  purchase_rm49: "完成 RM49 · RM49 completed",
  purchase_rm129: "完成 RM129 · RM129 completed",
  referral_rm49: "推荐 RM49 · Referral RM49",
  referral_rm129: "推荐 RM129 · Referral RM129",
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
  confirmed: "已确认 · Confirmed",
  completed: "已完成 · Completed",
  cancelled: "已取消 · Cancelled",
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

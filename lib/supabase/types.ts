// Stable package codes — decoupled from the displayed price so future price
// changes only touch the price map (lib/membership-format.ts), never the DB.
export type PackageType = "scent_test" | "custom_blend";
export type BookingStatus = "pending" | "booked" | "confirmed" | "completed" | "cancelled" | "no_show";
export type BookingCompletionTokenStatus = "active" | "used" | "expired" | "cancelled";
export type RewardStatus = "pending" | "approved" | "issued" | "cancelled";
export type RedemptionStatus = "pending" | "approved" | "completed" | "cancelled";
export type LedgerType =
  | "signup_bonus"
  | "purchase_rm49"
  | "purchase_rm129"
  | "referral_rm49"
  | "referral_rm129"
  | "redeem"
  | "manual_adjustment";

export interface Customer {
  id: string;
  auth_user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  referral_code: string;
  referred_by_code: string | null;
  points_balance: number;
  points: number | null;
  qr_token: string | null;
  role: "member" | "staff" | "admin" | string;
  is_admin: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  user_id: string | null;
  package_name: string | null;
  package_code: string | null;
  package_type: PackageType;
  amount: number;
  status: BookingStatus;
  booking_date: string | null;
  booking_time: string | null;
  contact: string | null;
  start_time: string | null;
  end_time: string | null;
  completed_at: string | null;
  notes: string | null;
  source: string;
  booking_qr_token: string | null;
  booking_qr_created_at: string | null;
  completion_token_id: string | null;
  created_by_admin_email: string | null;
  points_awarded: boolean;
  referral_reward_created: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingCompletionToken {
  id: string;
  token: string;
  customer_id: string;
  package_type: PackageType;
  amount: number;
  status: BookingCompletionTokenStatus;
  expires_at: string;
  used_at: string | null;
  used_by_customer_id: string | null;
  created_by_admin_email: string | null;
  created_at: string;
}

export interface ReferralReward {
  id: string;
  referrer_customer_id: string;
  referred_customer_id: string;
  booking_id: string;
  reward_type: string;
  reward_value: string;
  status: RewardStatus;
  tng_pin_code: string | null;
  issued_at: string | null;
  created_at: string;
}

export interface PointsLedgerEntry {
  id: string;
  customer_id: string;
  points: number;
  type: LedgerType;
  description: string | null;
  related_booking_id: string | null;
  related_referral_reward_id: string | null;
  created_at: string;
}

export interface PointsTransaction {
  id: string;
  user_id: string | null;
  points: number;
  type: "earn" | "redeem";
  reason: string | null;
  created_at: string;
}

export interface Reward {
  id: string;
  name_cn: string;
  name_en: string;
  points_required: number;
  reward_type: string;
  reward_value: string;
  is_active: boolean;
  created_at: string;
}

export interface RewardRedemption {
  id: string;
  customer_id: string;
  reward_id: string;
  points_used: number;
  status: RedemptionStatus;
  admin_notes: string | null;
  created_at: string;
  completed_at: string | null;
}

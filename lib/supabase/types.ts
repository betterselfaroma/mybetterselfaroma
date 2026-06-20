export type PackageType = "RM49" | "RM129";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
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
  is_admin: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  package_type: PackageType;
  status: BookingStatus;
  booking_date: string | null;
  notes: string | null;
  points_awarded: boolean;
  referral_reward_created: boolean;
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

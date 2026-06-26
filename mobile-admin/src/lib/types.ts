export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type TransactionType = "earn" | "redeem" | "adjust";

export type Customer = {
  id: string;
  auth_user_id?: string | null;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  referral_code?: string | null;
  points_balance?: number | null;
  points?: number | null;
  qr_token?: string | null;
  role?: string | null;
  is_admin?: boolean | null;
  created_at?: string | null;
};

export type Booking = {
  id: string;
  user_id?: string | null;
  package_name?: string | null;
  package_code?: string | null;
  amount?: number | null;
  booking_date?: string | null;
  booking_time?: string | null;
  contact?: string | null;
  notes?: string | null;
  status: BookingStatus | string;
  created_at?: string | null;
};

export type PointsTransaction = {
  id: string;
  user_id?: string | null;
  customer_id?: string | null;
  points: number;
  type: TransactionType | string;
  reason?: string | null;
  description?: string | null;
  created_at?: string | null;
};

export type OperatorProfile = {
  userId: string;
  email: string | null;
  customer: Customer | null;
  canAccessAdmin: boolean;
};

export type DashboardStats = {
  todayBookingsCount: number;
  pendingBookingsCount: number;
  todayMembersCount: number;
  totalMembersCount: number;
  todayPointsIssued: number;
  todayBookings: Booking[];
};

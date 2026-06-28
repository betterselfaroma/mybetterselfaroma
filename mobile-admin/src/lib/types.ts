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
  customer_id?: string | null;
  user_id?: string | null;
  package_type?: string | null;
  package_name?: string | null;
  package_code?: string | null;
  amount?: number | null;
  booking_date?: string | null;
  booking_time?: string | null;
  contact?: string | null;
  notes?: string | null;
  points_awarded?: boolean | null;
  referral_reward_created?: boolean | null;
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

export type RewardProduct = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  points_cost: number;
  stock: number;
  active: boolean;
  sort_order?: number | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type RewardRedemption = {
  id: string;
  customer_id?: string | null;
  product_id?: string | null;
  points_cost?: number | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string | null;
  completed_at?: string | null;
};

export type CmsSection = {
  id: string;
  page_slug: string;
  section_key: string;
  section_type: string;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  image_url?: string | null;
  button_text?: string | null;
  button_url?: string | null;
  data?: Record<string, unknown> | null;
  sort_order?: number | null;
  visible?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SiteSetting = {
  id: string;
  setting_key: string;
  setting_value?: Record<string, unknown> | null;
  updated_at?: string | null;
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

export type DashboardMetric = {
  value: number;
  error?: string;
};

export type DashboardOverview = {
  metrics: {
    todayBookings: DashboardMetric;
    pendingBookings: DashboardMetric;
    todayMembers: DashboardMetric;
    totalMembers: DashboardMetric;
    todayPointsIssued: DashboardMetric;
  };
  todayBookings: Booking[];
  errors: string[];
};

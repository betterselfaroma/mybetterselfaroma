import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requireStaff } from "@/lib/supabase/auth";
import NotConfigured from "@/components/membership/NotConfigured";
import { PortalHeader } from "@/components/membership/PortalHeader";
import { PageTitle } from "@/components/membership/ui";
import StaffScanClient from "@/components/staff/StaffScanClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LINKS = [
  { href: "/staff/scan", label: "扫码" },
  { href: "/admin", label: "后台管理" },
  { href: "/admin/bookings", label: "预约" },
  { href: "/admin/points", label: "积分" },
];

export default async function StaffScanPage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  if (!isSupabaseConfigured) return <NotConfigured />;
  await requireStaff("/staff/scan");

  const initialToken = typeof searchParams?.token === "string" ? searchParams.token : "";

  return (
    <div className="min-h-screen bg-cream-100 font-sans text-ink">
      <PortalHeader brandHref="/staff/scan" links={LINKS} isAdmin />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PageTitle
          title="扫描会员二维码 · Scan Member QR"
          subtitle="店员可扫描会员中心二维码，查看会员资料、积分与预约记录，并执行积分调整或预约 check-in。"
        />
        <StaffScanClient initialToken={initialToken} />
      </main>
    </div>
  );
}

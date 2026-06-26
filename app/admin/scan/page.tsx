import { PageTitle } from "@/components/membership/ui";
import StaffScanClient from "@/components/staff/StaffScanClient";

export const dynamic = "force-dynamic";

export default function AdminScanPage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  const initialToken = typeof searchParams?.token === "string" ? searchParams.token : "";

  return (
    <div className="space-y-5">
      <PageTitle
        title="扫码 · Scan"
        subtitle="打开手机摄像头扫描会员 QR Code，查看资料、积分与预约。"
      />
      <StaffScanClient initialToken={initialToken} />
    </div>
  );
}

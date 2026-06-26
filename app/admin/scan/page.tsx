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
      <div className="rounded-[1.75rem] bg-sage-800 px-5 py-5 text-cream-50 shadow-[0_26px_60px_-38px_rgba(31,61,46,0.85)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-300">Scan Member QR</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight">扫码服务</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-cream-100/82">
          打开摄像头扫描会员 QR，快速查看资料、积分与预约。
        </p>
      </div>
      <StaffScanClient initialToken={initialToken} />
    </div>
  );
}

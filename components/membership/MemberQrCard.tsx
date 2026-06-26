"use client";

import { QRCodeSVG } from "qrcode.react";

export default function MemberQrCard({
  value,
  token,
}: {
  value: string | null;
  token: string | null;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
      <div className="mx-auto rounded-2xl border border-taupe-200 bg-cream-50 p-4 shadow-sm md:mx-0">
        {value ? (
          <QRCodeSVG
            value={value}
            size={210}
            level="M"
            includeMargin
            bgColor="#FBF9F2"
            fgColor="#1F3D2E"
          />
        ) : (
          <div className="flex h-[210px] w-[210px] items-center justify-center rounded-xl bg-cream-100 text-center text-sm text-taupe-500">
            QR token not ready
          </div>
        )}
      </div>

      <div>
        <h2 className="font-serif text-xl font-semibold text-ink">会员二维码 · Member QR Code</h2>
        <p className="mt-2 text-sm leading-6 text-taupe-600">
          到店时向工作人员出示此二维码。工作人员扫码后可以查看会员资料、积分和预约记录。
          <br />
          Show this QR code to our team in-store for member lookup, points and booking check-in.
        </p>
        {token ? (
          <p className="mt-4 break-all rounded-xl bg-cream-100 px-3 py-2 font-mono text-xs text-taupe-500">
            {token}
          </p>
        ) : (
          <p className="mt-4 rounded-xl border border-gold-300/60 bg-gold-300/15 px-3 py-2 text-sm text-taupe-700">
            请先在 Supabase 运行会员二维码 migration，然后刷新页面。
          </p>
        )}
      </div>
    </div>
  );
}

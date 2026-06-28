"use client";

import { QRCodeSVG } from "qrcode.react";
import CopyButton from "@/components/member/CopyButton";

export default function MemberQrCard({
  value,
  token,
}: {
  value: string | null;
  token: string | null;
}) {
  return (
    <section
      id="member-qr"
      className="scroll-mt-28 overflow-hidden rounded-[1.75rem] border border-taupe-200/70 bg-cream-50 shadow-sm"
    >
      <div className="grid gap-0 md:grid-cols-[minmax(260px,340px)_1fr] md:items-stretch">
        <div className="bg-gradient-to-br from-sage-900 via-sage-800 to-sage-700 p-5 text-cream-50 sm:p-7">
          <div className="mx-auto flex max-w-[290px] flex-col items-center">
            <div className="rounded-[1.5rem] border border-cream-50/16 bg-cream-50 p-3 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
              {value ? (
                <QRCodeSVG
                  value={value}
                  size={236}
                  level="M"
                  includeMargin
                  bgColor="#FBF9F2"
                  fgColor="#1F3D2E"
                />
              ) : (
                <div className="flex h-[236px] w-[236px] items-center justify-center rounded-xl bg-cream-100 text-center text-sm text-taupe-500">
                  QR token not ready
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-cream-50/12 px-3 py-1.5 text-cream-50">到店出示</span>
              <span className="rounded-full bg-cream-50/12 px-3 py-1.5 text-cream-50">Staff Scan</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Member QR</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight text-ink">
            会员二维码 · Member QR Code
          </h2>
          <p className="mt-3 text-sm leading-7 text-taupe-600">
            到店时打开此二维码给工作人员扫描，即可快速确认会员资料、积分与预约记录。
            <br />
            Show this QR code in-store for member lookup, points and booking check-in.
          </p>

          {token ? (
            <div className="mt-5 space-y-3 rounded-2xl border border-taupe-200/70 bg-cream-100/70 p-4">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-taupe-400">Secure token</div>
                <p className="mt-2 break-all font-mono text-xs leading-5 text-taupe-600">{token}</p>
              </div>
              {value && (
                <>
                  <div className="break-all rounded-xl bg-cream-50 px-3 py-2 font-mono text-[11px] leading-5 text-taupe-500">
                    {value}
                  </div>
                  <CopyButton text={value} label="复制会员 QR 链接" copiedLabel="已复制" toast="会员 QR 链接已复制" />
                </>
              )}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-gold-300/60 bg-gold-300/15 p-4 text-sm leading-6 text-taupe-700">
              请先在 Supabase 运行会员二维码 migration，或让管理员在会员列表生成 QR Token。
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

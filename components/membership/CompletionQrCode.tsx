"use client";

import { QRCodeSVG } from "qrcode.react";

export default function CompletionQrCode({ value }: { value: string }) {
  return (
    <div className="inline-flex rounded-2xl border border-taupe-200 bg-cream-50 p-4 shadow-sm">
      <QRCodeSVG
        value={value}
        size={220}
        level="M"
        includeMargin
        bgColor="#FBF9F2"
        fgColor="#1F3D2E"
      />
    </div>
  );
}

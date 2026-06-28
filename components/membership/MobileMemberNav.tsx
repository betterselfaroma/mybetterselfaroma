"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/member", label: "中心", en: "Home", icon: "M12 3l2.2 5.3 5.8.5-4.4 3.8 1.3 5.6L12 16.8 7.1 18.8l1.3-5.6L4 9.4l5.8-.5L12 3Z" },
  { href: "/book", label: "预约", en: "Book", icon: "M5 5h14v16H5zM8 3v4M16 3v4M5 9h14" },
  { href: "/member#member-qr", label: "QR", en: "Scan", primary: true, icon: "M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h2v2h-2zM17 17h2v2h-2zM14 18h2v1h-2z" },
  { href: "/member/points", label: "积分", en: "Points", icon: "M12 3v18M7 7.5h7a3 3 0 0 1 0 6H10a3 3 0 0 0 0 6h7" },
  { href: "/member/rewards", label: "兑换", en: "Rewards", icon: "M4 9h16M5 9v11h14V9M12 9v11M8 6c0-1.5 2-2 4 3 2-5 4-4.5 4-3 0 2-4 3-4 3s-4-1-4-3Z" },
];

export default function MobileMemberNav({ points }: { points?: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 rounded-[1.55rem] border border-sage-900/10 bg-cream-50/95 px-2 py-2 shadow-[0_22px_60px_-26px_rgba(31,61,46,0.55)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5 items-end gap-1">
        {ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/member" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[54px] flex-col items-center justify-center rounded-2xl text-[10px] font-bold leading-tight transition ${
                item.primary
                  ? "-mt-8 bg-sage-800 text-cream-50 shadow-[0_18px_36px_-18px_rgba(31,61,46,0.8)]"
                  : active
                    ? "bg-sage-100 text-sage-800"
                    : "text-taupe-500"
              }`}
            >
              <span className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full ${item.primary ? "text-gold-300" : ""}`}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
              </span>
              <span>{item.label}</span>
              <span className="text-[9px] font-medium opacity-70">{item.en}</span>
            </Link>
          );
        })}
      </div>
      {points != null && (
        <div className="pointer-events-none absolute -top-3 right-4 rounded-full bg-gold-300 px-2.5 py-1 text-[10px] font-black text-sage-900 shadow-sm">
          {points} pts
        </div>
      )}
    </nav>
  );
}

import Link from "next/link";
import { Card } from "@/components/membership/ui";

export const dynamic = "force-dynamic";

const CONTENT_TOOLS = [
  { href: "/admin/content", label: "内容管理", sub: "Content sections" },
  { href: "/admin/media", label: "图片素材", sub: "Upload, copy URL, delete old media" },
  { href: "/admin/settings/site", label: "网站设置", sub: "Brand, contact, SEO" },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.65rem] bg-forest-depth p-5 text-cream-50 shadow-[0_24px_64px_-38px_rgba(31,61,46,0.82)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold-300">Settings</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold">应用设置</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-cream-100/80">
          内容管理、图片素材、手机安装、缓存、安全权限和 Android App 说明集中在这里，Dashboard 保持日常操作入口。
        </p>
      </div>

      <Card className="rounded-[1.65rem] border-gold-300/40 bg-gradient-to-br from-cream-50 via-cream-50 to-gold-300/10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Website Content</p>
            <h2 className="mt-1 font-serif text-xl font-semibold text-ink">网站内容管理 CMS</h2>
            <p className="mt-2 text-sm leading-6 text-taupe-600">
              首页内容、图片上传和网站基础资料都从这里进入，不再放在 Admin 首页。
            </p>
          </div>
          <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-bold text-sage-700">Admin only</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {CONTENT_TOOLS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-sage-200 bg-sage-50 px-4 py-4 text-sm font-semibold text-sage-800 transition hover:border-sage-500 hover:bg-cream-50"
            >
              {item.label}
              <span className="mt-1 block text-xs font-medium leading-5 text-taupe-600">{item.sub}</span>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <SettingsInfoCard title="安装到手机主屏幕" eyebrow="PWA Install">
          <p>iPhone Safari：点击分享按钮 → 添加到主屏幕。</p>
          <p>Android Chrome：点击浏览器菜单 → Add to Home Screen / Install App。</p>
          <p>部署后请使用 HTTPS：<span className="font-mono text-xs text-sage-700">https://scentknowsyou.com/admin</span></p>
        </SettingsInfoCard>

        <SettingsInfoCard title="清除旧缓存" eyebrow="Cache">
          <p>如果手机仍显示旧错误，先卸载旧 PWA / APK，再重新安装。</p>
          <p>Android：Settings → Apps → Scent Admin → Storage & cache → Clear storage。</p>
          <p>Chrome：Site settings → scentknowsyou.com → Clear & reset。</p>
        </SettingsInfoCard>

        <SettingsInfoCard title="权限保护" eyebrow="Security">
          <p>Admin PWA 使用现有登录系统保护。</p>
          <p>只有 ADMIN_EMAILS、customers.is_admin 或 customers.role 为 admin/staff 的账号可以进入后台。</p>
          <p>不要把 service role key 放进前端或手机 App。</p>
        </SettingsInfoCard>

        <SettingsInfoCard title="后续 Android App" eyebrow="Native">
          <p>保留当前 PWA，同时继续使用 native-admin 作为真正手机 App 方向。</p>
          <p>Android App 使用 Supabase anon key + RLS，不使用 service role key。</p>
          <p>Debug APK 前请先运行 native 检查。</p>
        </SettingsInfoCard>
      </div>
    </div>
  );
}

function SettingsInfoCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-[1.65rem]">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">{eyebrow}</p>
      <h2 className="mt-1 font-serif text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-6 text-taupe-700">{children}</div>
    </Card>
  );
}

import Link from "next/link";
import { Card } from "@/components/membership/ui";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.65rem] bg-cream-50/90 p-5 shadow-[0_20px_58px_-38px_rgba(82,67,47,0.5)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold-600">Settings</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">应用设置</h1>
        <p className="mt-2 text-sm leading-6 text-taupe-600">安装、权限、缓存和后续 Android App 迁移说明。</p>
      </div>

      <Card className="rounded-[1.65rem]">
        <h2 className="font-serif text-xl font-semibold text-ink">网站内容管理 CMS</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link href="/admin/content" className="rounded-2xl border border-sage-200 bg-sage-50 px-4 py-4 text-sm font-semibold text-sage-800 hover:border-sage-500">
            内容管理
            <span className="mt-1 block text-xs font-medium text-taupe-600">Content</span>
          </Link>
          <Link href="/admin/media" className="rounded-2xl border border-sage-200 bg-sage-50 px-4 py-4 text-sm font-semibold text-sage-800 hover:border-sage-500">
            图片素材
            <span className="mt-1 block text-xs font-medium text-taupe-600">Media</span>
          </Link>
          <Link href="/admin/settings/site" className="rounded-2xl border border-sage-200 bg-sage-50 px-4 py-4 text-sm font-semibold text-sage-800 hover:border-sage-500">
            网站设置
            <span className="mt-1 block text-xs font-medium text-taupe-600">Site Settings</span>
          </Link>
        </div>
      </Card>

      <Card className="rounded-[1.65rem]">
        <h2 className="font-serif text-xl font-semibold text-ink">安装到手机主屏幕</h2>
        <div className="mt-3 space-y-3 text-sm leading-6 text-taupe-700">
          <p>iPhone Safari：点击分享按钮 → 添加到主屏幕。</p>
          <p>Android Chrome：点击浏览器菜单 → Add to Home Screen / Install App。</p>
          <p>部署后请使用 HTTPS：<span className="font-mono text-xs text-sage-700">https://scentknowsyou.com/admin</span></p>
        </div>
      </Card>

      <Card className="rounded-[1.65rem]">
        <h2 className="font-serif text-xl font-semibold text-ink">清除旧缓存</h2>
        <div className="mt-3 space-y-3 text-sm leading-6 text-taupe-700">
          <p>如果手机仍显示旧错误，先卸载旧 PWA / APK，再重新安装。</p>
          <p>Android：Settings → Apps → Scent Admin → Storage & cache → Clear storage。</p>
          <p>Chrome：Site settings → scentknowsyou.com → Clear & reset。</p>
        </div>
      </Card>

      <Card className="rounded-[1.65rem]">
        <h2 className="font-serif text-xl font-semibold text-ink">权限保护</h2>
        <p className="mt-3 text-sm leading-6 text-taupe-700">
          Admin PWA 使用现有登录系统保护。只有 ADMIN_EMAILS、customers.is_admin 或 customers.role 为 admin/staff 的账号可以进入后台。
        </p>
      </Card>

      <Card className="rounded-[1.65rem]">
        <h2 className="font-serif text-xl font-semibold text-ink">后续 Capacitor Android</h2>
        <div className="mt-3 space-y-3 text-sm leading-6 text-taupe-700">
          <p>1. 保留当前 PWA，先确认线上 Admin 手机流程稳定。</p>
          <p>2. 使用 Capacitor 建立真正 Android 壳，接入原生 Splash、Status Bar、Camera 权限。</p>
          <p>3. 迁移计划已整理到 docs/capacitor-admin-app-plan.md。</p>
        </div>
      </Card>
    </div>
  );
}

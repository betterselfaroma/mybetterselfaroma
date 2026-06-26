import { Card, PageTitle } from "@/components/membership/ui";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-5">
      <PageTitle title="设置 · Settings" subtitle="Admin PWA setup and mobile usage" />

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">安装到手机主屏幕</h2>
        <div className="mt-3 space-y-3 text-sm leading-6 text-taupe-700">
          <p>iPhone Safari：点击分享按钮 → 添加到主屏幕。</p>
          <p>Android Chrome：点击浏览器菜单 → Add to Home Screen / Install App。</p>
          <p>部署后请使用 HTTPS：<span className="font-mono text-xs text-sage-700">https://scentknowsyou.com/admin</span></p>
        </div>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">权限保护</h2>
        <p className="mt-3 text-sm leading-6 text-taupe-700">
          Admin PWA 使用现有登录系统保护。只有 ADMIN_EMAILS、customers.is_admin 或 customers.role 为 admin/staff 的账号可以进入后台。
        </p>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">后续 Android APK</h2>
        <div className="mt-3 space-y-3 text-sm leading-6 text-taupe-700">
          <p>1. 先部署并确认 PWA manifest、service worker、HTTPS 都正常。</p>
          <p>2. 使用 Bubblewrap / PWABuilder 把 PWA 包装成 Android APK。</p>
          <p>3. 之后再配置应用图标、启动图和签名 keystore。</p>
        </div>
      </Card>
    </div>
  );
}

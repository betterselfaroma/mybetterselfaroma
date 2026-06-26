import type { OperatorProfile } from "../lib/types";

export default function Settings({ profile }: { profile: OperatorProfile }) {
  return (
    <section className="page-stack">
      <div className="page-title">
        <span>Settings</span>
        <h1>应用设置</h1>
        <p>Capacitor Android 本地 App 框架。</p>
      </div>
      <article className="data-card">
        <h3>当前用户</h3>
        <p>{profile.email}</p>
        <p className="muted">role: {profile.customer?.role ?? (profile.customer?.is_admin ? "admin" : "member")}</p>
      </article>
      <article className="data-card">
        <h3>App 体验</h3>
        <p>此版本使用本地 Vite dist 打包进 Capacitor，不使用线上 server.url 套壳。</p>
      </article>
      <article className="data-card">
        <h3>权限安全</h3>
        <p>普通 member 无法进入后台；积分和预约操作依赖 Supabase RLS / RPC / admin policies。</p>
      </article>
    </section>
  );
}

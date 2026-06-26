import { useState } from "react";
import type { FormEvent } from "react";
import BrandMark from "../components/BrandMark";

export default function Login({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      console.error("Mobile admin login failed:", err);
      setError(err instanceof Error ? err.message : "Login failed.");
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-hero">
        <BrandMark size="lg" />
        <h1>香气读懂你的心</h1>
        <p className="app-kicker">ADMIN APP</p>
        <p className="muted">登录后管理预约、会员积分和扫码服务。</p>
      </section>

      <form className="login-card" onSubmit={submit}>
        <label>
          <span>Email</span>
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          <span>密码 · Password</span>
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <div className="remember-row">✓ 保持登录状态，减少下次启动等待</div>
        {error && <p className="error-box">{error}</p>}
        <button className="primary-button full" type="submit" disabled={loading}>
          {loading ? "正在进入后台…" : "登录 Admin App"}
        </button>
      </form>
    </main>
  );
}

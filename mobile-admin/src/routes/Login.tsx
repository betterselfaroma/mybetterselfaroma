import { useState } from "react";
import type { FormEvent } from "react";
import BrandMark from "../components/BrandMark";
import AppButton from "../components/mobile/AppButton";
import AppInput from "../components/mobile/AppInput";
import ErrorState from "../components/mobile/ErrorState";
import { getErrorMessage, logAppError } from "../lib/errors";

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
      await onLogin(email.trim().toLowerCase(), password);
    } catch (err) {
      logAppError("Mobile admin login failed", err);
      setError(getErrorMessage(err, "Login failed"));
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
        <AppInput label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <AppInput label="密码 · Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="remember-row">✓ 保持登录状态，减少下次启动等待</div>
        {error && <ErrorState title="登录失败" message="无法进入 Admin App。" details={error} />}
        <AppButton full type="submit" loading={loading}>
          登录 Admin App
        </AppButton>
      </form>
    </main>
  );
}

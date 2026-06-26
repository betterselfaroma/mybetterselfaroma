import BrandMark from "./BrandMark";

export default function LoadingScreen({ text = "正在准备后台…" }: { text?: string }) {
  return (
    <main className="splash-screen">
      <BrandMark size="lg" />
      <h1>香气读懂你的心</h1>
      <p className="app-kicker">ADMIN APP</p>
      <div className="loading-bar"><span /></div>
      <p className="muted">{text}</p>
    </main>
  );
}

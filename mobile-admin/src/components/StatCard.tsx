export default function StatCard({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </article>
  );
}

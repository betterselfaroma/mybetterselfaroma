export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-taupe-200/60 bg-cream-50 p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-taupe-200/60 bg-cream-50 p-5 text-center shadow-sm">
      <div className="font-serif text-3xl font-semibold text-sage-700">{value}</div>
      <div className="mt-1 text-xs leading-snug text-taupe-500">{label}</div>
    </div>
  );
}

const TONES: Record<string, string> = {
  pending: "bg-gold-300/30 text-gold-600",
  approved: "bg-sage-100 text-sage-700",
  confirmed: "bg-sage-100 text-sage-700",
  issued: "bg-sage-700 text-cream-50",
  completed: "bg-sage-700 text-cream-50",
  cancelled: "bg-taupe-200 text-taupe-600",
};

export function Badge({ status, children }: { status: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[status] ?? "bg-taupe-100 text-taupe-600"}`}>
      {children}
    </span>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="font-serif text-3xl font-semibold text-ink">{title}</h1>
      {subtitle && <p className="mt-2 text-sm leading-relaxed text-taupe-600">{subtitle}</p>}
    </div>
  );
}

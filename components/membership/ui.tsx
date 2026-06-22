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

export function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-taupe-200/60 bg-cream-50 p-5 text-center shadow-sm">
      {icon && (
        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 text-sage-600 ring-1 ring-taupe-200/60">
          {icon}
        </div>
      )}
      <div className="font-serif text-3xl font-semibold text-sage-700">{value}</div>
      <div className="mt-1 text-xs leading-snug text-taupe-500">{label}</div>
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-taupe-200 bg-cream-100/60 px-5 py-8 text-center text-sm text-taupe-500">
      {children}
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

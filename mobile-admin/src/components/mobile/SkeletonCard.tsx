export default function SkeletonCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "skeleton-card compact" : "skeleton-card"}>
      <span />
      <span />
      {!compact && <span />}
    </div>
  );
}

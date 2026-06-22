export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100">
      <span className="inline-flex items-center gap-3 text-sm text-taupe-500">
        <svg viewBox="0 0 24 24" className="h-5 w-5 animate-spin text-sage-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 3a9 9 0 1 0 9 9" />
        </svg>
        加载中…
      </span>
    </div>
  );
}

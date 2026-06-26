export default function BrandMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const className = size === "lg" ? "brand-mark brand-mark-lg" : size === "sm" ? "brand-mark brand-mark-sm" : "brand-mark";
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 39C15.5 33.8 12 27.8 12 21.5 12 13.9 19 9.7 24 7.8c5 1.9 12 6.1 12 13.7 0 6.3-3.5 12.3-12 17.5Z" strokeWidth="2.8" />
        <path d="M24 32c0-9.2 3.3-16.1 10-20.8" strokeWidth="2.2" />
        <path d="M17 25.8c4.6-4.8 10.6-4.6 15 1.3" strokeWidth="2" />
      </svg>
    </span>
  );
}

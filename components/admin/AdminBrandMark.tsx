export default function AdminBrandMark({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = {
    sm: "h-9 w-9 rounded-2xl",
    md: "h-12 w-12 rounded-[1.35rem]",
    lg: "h-20 w-20 rounded-[1.8rem]",
  }[size];

  const leafClass = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-11 w-11",
  }[size];

  return (
    <span
      className={[
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_18%,#f6ead0_0%,#d6bd8a_22%,#34543f_58%,#1f3d2e_100%)] text-cream-50 shadow-[0_16px_36px_-20px_rgba(31,61,46,0.75)] ring-1 ring-gold-300/35",
        sizeClass,
        className,
      ].join(" ")}
      aria-hidden="true"
    >
      <span className="absolute inset-[12%] rounded-full border border-gold-300/30" />
      <svg
        viewBox="0 0 48 48"
        className={leafClass}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24 39c8.2-5 12.2-10.8 12.2-18.1A12.2 12.2 0 0 0 11.8 20.9C11.8 28.2 15.8 34 24 39Z" strokeWidth="2.6" />
        <path d="M24 29.5c0-8.6 3.2-15.2 9.2-19.8" strokeWidth="2.2" />
        <path d="M19.5 19.5c3.9.2 6.8 1.6 8.8 4.4" strokeWidth="1.9" />
      </svg>
      <span className="absolute bottom-2 left-1/2 h-px w-8 -translate-x-1/2 bg-gold-300/65" />
    </span>
  );
}

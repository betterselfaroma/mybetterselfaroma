/**
 * Centered section heading with thin flanking rules and a small ornament,
 * matching the premium editorial style of the brand design comps.
 */
export default function SectionHeading({
  eyebrow,
  title,
  intro,
  tone = "dark",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  tone?: "dark" | "light";
}) {
  const titleColor = tone === "light" ? "text-cream-50" : "text-ink";
  const introColor = tone === "light" ? "text-cream-200/85" : "text-taupe-600";
  const ruleColor = tone === "light" ? "bg-cream-200/40" : "bg-taupe-300/70";
  const eyebrowColor = tone === "light" ? "text-gold-300" : "text-gold-600";

  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="flex items-center justify-center gap-4">
        <span className={`h-px w-10 ${ruleColor} sm:w-16`} />
        <span className="text-gold-500" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M12 3c1.2 3 3 4.4 5.5 5.5C15 9.6 13.2 11 12 14c-1.2-3-3-4.4-5.5-5.5C9 7.4 10.8 6 12 3Z" />
          </svg>
        </span>
        <span className={`h-px w-10 ${ruleColor} sm:w-16`} />
      </div>

      {eyebrow && (
        <p className={`mt-5 text-xs font-semibold uppercase tracking-[0.22em] ${eyebrowColor}`}>
          {eyebrow}
        </p>
      )}

      <h2 className={`mt-3 font-serif text-[2rem] font-semibold leading-[1.15] sm:text-[2.6rem] ${titleColor}`}>
        {title}
      </h2>
      {intro && (
        <p className={`mx-auto mt-4 max-w-xl text-base leading-relaxed sm:text-[1.05rem] ${introColor}`}>
          {intro}
        </p>
      )}
    </div>
  );
}

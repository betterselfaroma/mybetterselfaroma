export default function AppPage({
  eyebrow,
  title,
  description,
  hero = false,
  children,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  hero?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="page-stack">
      {title && (
        <div className={hero ? "hero-card" : "page-title"}>
          {eyebrow && <span>{eyebrow}</span>}
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

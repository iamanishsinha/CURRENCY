export function Board({ title, aside, children, className = "" }: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-hairline dark:border-hairline-night">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {aside}
      </div>
      <div>{children}</div>
    </section>
  );
}

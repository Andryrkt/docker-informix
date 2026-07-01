type ViewSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function ViewSection({ title, children, className }: ViewSectionProps) {
  return (
    <div className={className}>
      <div className="pb-3 space-y-1">
        <h3 className="text-base font-bold">{title}</h3>
        <div className="h-1 bg-brand-primary" />
      </div>

      {children}
    </div>
  );
}

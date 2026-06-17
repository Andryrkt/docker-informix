import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageHeaderProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

function PageHeader({
  icon,
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
        className,
      )}
    >
      <div>
        <div className="flex items-center gap-3 text-global-primary">
          {icon}
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </section>
  );
}

export default PageHeader;

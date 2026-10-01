import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
export function Panel({
  title,
  icon: Icon,
  href,
  action,
  children,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  href?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel", className)}>
      <div className="panel-heading">
        <h2>
          {Icon && <Icon size={14} />}
          {title}
        </h2>
        {href ? (
          <Link
            href={href}
            className="panel-link"
            aria-label={`View ${title.toLowerCase()}`}
          >
            <ArrowUpRight size={15} />
          </Link>
        ) : (
          action
        )}
      </div>
      {children}
    </section>
  );
}

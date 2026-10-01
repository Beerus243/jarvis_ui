import { cn, label } from "@/lib/utils";
export function StatusBadge({
  status,
  children,
  className,
}: {
  status: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("status-badge", `status-${status}`, className)}>
      <span className="status-dot" />
      {children ?? label(status)}
    </span>
  );
}

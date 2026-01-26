import clsx from "clsx";
import React from "react";

type StatusTone = "neutral" | "pending" | "success" | "danger";

type StatusBadgeProps = {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
};

const toneClasses: Record<StatusTone, string> = {
  neutral: "bg-[var(--sr-neutralBg)] text-[var(--sr-neutral)]",
  pending: "bg-[var(--sr-warningBg)] text-[var(--sr-warning)]",
  success: "bg-[var(--sr-successBg)] text-[var(--sr-success)]",
  danger: "bg-[var(--sr-dangerBg)] text-[var(--sr-danger)]",
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ tone, children, className }) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
};

export default StatusBadge;

import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "ghost" | "secondary";

type CTAButtonProps = {
  href: string;
  label: string;
  icon?: ReactNode;
  variant?: Variant;
};

const variantClassNames: Record<Variant, string> = {
  primary:
    "bg-amber-400 text-slate-900 shadow-lg shadow-amber-300/50 hover:bg-amber-300",
  ghost:
    "border border-slate-300 text-slate-900 hover:border-amber-300 hover:bg-amber-50",
  secondary:
    "bg-slate-900 text-amber-100 hover:bg-slate-800 shadow-md shadow-slate-900/30",
};

export default function CtaButton({
  href,
  label,
  variant = "primary",
  icon,
}: CTAButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${variantClassNames[variant]}`}
    >
      <span>{label}</span>
      {icon}
    </Link>
  );
}

import clsx from "clsx";
import Link from "next/link";
import React from "react";

type PrimaryButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
};

const baseClasses =
  "inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold bg-srAccent text-[var(--sr-onAccent)] hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-srAccent/40";

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  href,
  onClick,
  className,
  style,
  type = "button",
}) => {
  const classes = clsx(baseClasses, className);

  if (href) {
    return (
      <Link href={href} className={classes} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} style={style}>
      {children}
    </button>
  );
};

export default PrimaryButton;

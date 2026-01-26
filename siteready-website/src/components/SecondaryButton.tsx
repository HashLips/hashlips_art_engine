import clsx from "clsx";
import Link from "next/link";
import React from "react";

type SecondaryButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
  target?: string;
  rel?: string;
  disabled?: boolean;
};

const baseClasses =
  "inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-medium border border-srAccent text-srPrimary bg-srCard hover:bg-srAccent hover:text-[var(--sr-onAccent)] transition focus:outline-none focus:ring-2 focus:ring-srAccent/40";

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  href,
  onClick,
  className,
  style,
  target,
  rel,
  disabled,
  type = "button",
}) => {
  const classes = clsx(baseClasses, className);

  if (href) {
    return (
      <Link href={href} className={classes} style={style} target={target} rel={rel}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} style={style} disabled={disabled}>
      {children}
    </button>
  );
};

export default SecondaryButton;

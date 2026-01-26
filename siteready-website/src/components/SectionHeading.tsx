import clsx from "clsx";
import React from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  align = "center",
}) => {
  const alignment =
    align === "left" ? "items-start text-left" : "items-center text-center";

  return (
    <div className={clsx("flex flex-col gap-3 mb-12 md:mb-14", alignment)}>
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-srMuted">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-3xl md:text-4xl font-semibold text-srPrimary">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-srMuted max-w-2xl">{subtitle}</p>
      ) : null}
    </div>
  );
};

export default SectionHeading;

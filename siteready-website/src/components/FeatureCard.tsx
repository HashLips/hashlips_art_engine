import clsx from "clsx";
import React from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  className,
}) => {
  return (
    <div
      className={clsx(
        "bg-srCard border border-srBorder rounded-xl p-6 shadow-sm flex flex-col gap-3",
        className,
      )}
    >
      {icon ? (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-srTeal/10 text-srTeal">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-srPrimary">{title}</h3>
      <p className="text-sm text-srMuted">{description}</p>
    </div>
  );
};

export default FeatureCard;

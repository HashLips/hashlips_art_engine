import clsx from "clsx";
import React from "react";

interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  className?: string;
}

const StepCard: React.FC<StepCardProps> = ({
  stepNumber,
  title,
  description,
  className,
}) => {
  return (
    <div
      className={clsx(
        "bg-srCard border border-srBorder rounded-xl p-6 shadow-sm flex gap-4",
        className,
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-srPrimary text-white text-sm font-semibold">
        {stepNumber}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-srPrimary">{title}</h3>
        <p className="text-sm text-srMuted">{description}</p>
      </div>
    </div>
  );
};

export default StepCard;

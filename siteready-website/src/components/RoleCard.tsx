import clsx from "clsx";
import React from "react";

interface RoleCardProps {
  title: string;
  description?: string;
  tags?: string[];
  className?: string;
}

const RoleCard: React.FC<RoleCardProps> = ({
  title,
  description,
  tags,
  className,
}) => {
  return (
    <div
      className={clsx(
        "bg-srCard border border-srBorder rounded-xl p-6 shadow-sm flex flex-col gap-3",
        className,
      )}
    >
      <h3 className="text-lg font-semibold text-srPrimary">{title}</h3>
      {description ? <p className="text-sm text-srMuted">{description}</p> : null}
      {tags && tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-srTeal/10 text-srTeal px-3 py-1 text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default RoleCard;

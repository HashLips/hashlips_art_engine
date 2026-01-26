import clsx from "clsx";
import React from "react";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={clsx("rounded-2xl border border-srBorder bg-srCard p-6", className)}
    >
      {children}
    </div>
  );
};

export default Card;

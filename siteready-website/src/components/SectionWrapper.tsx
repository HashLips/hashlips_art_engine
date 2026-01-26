import clsx from "clsx";
import React from "react";

interface SectionWrapperProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id,
  className,
  children,
}) => (
  <section id={id} className={clsx("py-20", className)}>
    <div className="container max-w-6xl mx-auto px-4">{children}</div>
  </section>
);

export default SectionWrapper;

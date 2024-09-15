import React from "react";
import clsx from "clsx";

type SkeletonProps = {
  className?: string;
  aspect?: "square" | "wide" | "tall";
  rounded?: "none" | "sm" | "md" | "lg" | "full";
};

const aspectClasses = {
  square: "aspect-[1/1]",
  wide: "aspect-[16/9]",
  tall: "aspect-[9/16]",
};

const roundedClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  aspect = "square",
  rounded = "md",
}) => {
  return (
    <div
      className={clsx(
        "bg-slate-200",
        aspectClasses[aspect],
        roundedClasses[rounded],
        className
      )}
    />
  );
};

export default Skeleton;
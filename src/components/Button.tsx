import React from "react";
import clsx from "clsx";

type ButtonProps = {
  variant?: "primary" | "secondary";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: "button" | "submit" | "reset";
};

const baseClasses = "rounded-full flex items-center justify-center";

const variantClasses = {
  primary: "bg-black text-white border-black",
  secondary: "bg-white border",
};

const sizeClasses = {
  xs: "px-1.5 py-0.5 text-xs",
  sm: "px-2.5 py-1.5 text-sm",
  md: "px-3.5 py-2 text-base",
  lg: "px-4 py-2.5 text-lg",
  xl: "px-5 py-3 text-xl",
};

const disabledClasses = "opacity-50 cursor-not-allowed";

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  onClick,
  className,
  disabled = false,
  leftIcon,
  rightIcon,
  type = "button",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        { [disabledClasses]: disabled },
        className
      )}
      disabled={disabled}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
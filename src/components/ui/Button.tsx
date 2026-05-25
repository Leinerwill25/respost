"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses = {
  primary:
    "bg-[#C43B2A] hover:bg-[#9B2A1B] active:bg-[#7A1E12] text-white shadow-sm hover:shadow-md",
  secondary:
    "bg-[#F5EDE0] hover:bg-[#E8D5BE] text-[#6B3A1F] border border-[#E8D5BE]",
  ghost: "hover:bg-[#FFF8F3] text-[#6B3A1F] hover:text-[#C43B2A]",
  danger: "bg-[#FAE8E5] hover:bg-[#FDF3F1] text-[#C43B2A] border border-[#FAE8E5] shadow-sm",
  outline:
    "border-2 border-[#C43B2A] text-[#C43B2A] hover:bg-[#FDF3F1] bg-transparent",
};

const sizeClasses = {
  sm: "px-3.5 py-1.5 text-xs rounded-[12px]",
  md: "px-5 py-2.5 text-sm rounded-[12px]",
  lg: "px-6 py-3.5 text-base rounded-[20px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center gap-2 font-semibold
          transition-all duration-200 focus:outline-none focus:ring-2
          focus:ring-[#C43B2A]/30 disabled:opacity-60 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

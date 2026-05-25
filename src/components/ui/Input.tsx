"use client";

import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, leftIcon, rightIcon, helperText, className = "", id, ...props },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-semibold text-[#6B3A1F] font-sans"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A07050]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full py-2.5 border rounded-[12px] text-[#4A2010] bg-white
              placeholder:text-[#A07050]/60 transition-all duration-200 font-sans
              focus:outline-none focus:ring-3 focus:ring-[#FAE8E5] focus:border-[#C43B2A]
              disabled:bg-[#F5EDE0] disabled:cursor-not-allowed
              ${leftIcon ? "pl-10" : "pl-3.5"}
              ${rightIcon ? "pr-10" : "pr-3.5"}
              ${error ? "border-[#C43B2A] focus:ring-[#FAE8E5]" : "border-[#E8D5BE]"}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A07050]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[#C43B2A] font-semibold font-sans">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-[#A07050] font-sans">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

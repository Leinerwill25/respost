"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "primary";
  size?: "sm" | "md";
  dot?: boolean;
}

const variantClasses = {
  default: "bg-[#F5EDE0] text-[#6B3A1F] border border-[#E8D5BE]/60 font-semibold tracking-wider",
  primary: "bg-[#FAE8E5] text-[#C43B2A] border border-[#C43B2A]/20 font-bold uppercase tracking-wider",
  success: "bg-[#EDF7EE] text-[#2E7D32] border border-[#2E7D32]/20 font-bold uppercase tracking-wider",
  warning: "bg-[#FFF3E0] text-[#E65100] border border-[#E65100]/20 font-bold uppercase tracking-wider",
  danger: "bg-[#FAE8E5] text-[#C43B2A] border border-[#C43B2A]/20 font-bold uppercase tracking-wider",
  info: "bg-[#E3F0FF] text-[#1565C0] border border-[#1565C0]/20 font-bold uppercase tracking-wider",
};

const dotColors = {
  default: "bg-[#6B3A1F]",
  primary: "bg-[#C43B2A]",
  success: "bg-[#2E7D32]",
  warning: "bg-[#E65100]",
  danger: "bg-[#C43B2A]",
  info: "bg-[#1565C0]",
};

const sizeClasses = {
  sm: "px-2.5 py-0.5 text-[11px]",
  md: "px-3.5 py-1 text-xs",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}
        />
      )}
      {children}
    </span>
  );
}

"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-[20px] border border-[#E8D5BE] shadow-card
        ${paddingClasses[padding]}
        ${hover ? "hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 bg-[#F5EDE0] rounded-[12px] flex items-center justify-center text-[#C43B2A] shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-landing-display font-semibold text-[#2C1208] text-base md:text-lg">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#A07050] mt-0.5 font-sans font-medium">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

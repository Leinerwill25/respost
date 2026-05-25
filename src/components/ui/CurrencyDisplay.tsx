"use client";

import { convertToBs, formatBs, formatUSD } from "@/lib/currency";

interface CurrencyDisplayProps {
  amountUsd: number;
  euroRate: number;
  showBs?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: { usd: "text-sm font-bold font-display", bs: "text-[11px] font-medium font-sans" },
  md: { usd: "text-base font-bold font-display", bs: "text-xs font-medium font-sans" },
  lg: { usd: "text-xl font-bold font-display", bs: "text-sm font-medium font-sans" },
};

export function CurrencyDisplay({
  amountUsd,
  euroRate,
  showBs = true,
  size = "md",
  className = "",
}: CurrencyDisplayProps) {
  const bsAmount = convertToBs(amountUsd, euroRate);
  const classes = sizeClasses[size];

  return (
    <div className={`flex flex-col ${className}`}>
      <span className={`${classes.usd} text-[#2C1208] leading-tight`}>
        {formatUSD(amountUsd)}
      </span>
      {showBs && (
        <span className={`${classes.bs} text-[#A07050] mt-0.5`}>
          {formatBs(bsAmount)}
        </span>
      )}
    </div>
  );
}

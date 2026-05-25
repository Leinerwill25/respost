"use client";

import { Calculator, Package, BarChart3, Coins } from "lucide-react";

export default function FeaturesBar() {
  const items = [
    {
      icon: <Calculator className="w-8 h-8 text-[#C43B2A]" />,
      label: "COSTOS REALES",
      desc: "Calcula centavo a centavo",
    },
    {
      icon: <Package className="w-8 h-8 text-[#C43B2A]" />,
      label: "INVENTARIO",
      desc: "Descuento automático",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-[#C43B2A]" />,
      label: "REPORTES",
      desc: "Gráficos de ganancias",
    },
    {
      icon: <Coins className="w-8 h-8 text-[#C43B2A]" />,
      label: "DUAL USD/Bs",
      desc: "Tasa EUR del BCV",
    },
  ];

  return (
    <div className="relative z-30 max-w-5xl mx-auto px-4 sm:px-6 -mt-12 sm:-mt-16">
      <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-[0_15px_50px_rgba(44,18,8,0.06)] border border-[#F5E6C8]/40 p-4 sm:p-6 md:p-8 font-landing-sans">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:divide-x md:divide-[#E2E0FF]/40">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-3 sm:p-4 hover:scale-105 transition-transform duration-200"
            >
              <div className="w-14 h-14 bg-[#FFF8F0] rounded-[18px] flex items-center justify-center mb-3.5 border border-[#F5E6C8]/20">
                {item.icon}
              </div>
              <span className="text-xs font-bold text-[#2C1208] tracking-widest uppercase mb-1">
                {item.label}
              </span>
              <span className="text-[11px] text-[#A0714A]">
                {item.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Calculator, Box, RefreshCw, Receipt } from "lucide-react";
import Link from "next/link";

export default function FeatureCards() {
  const cards = [
    {
      icon: <Calculator className="w-6 h-6 text-[#C43B2A]" />,
      title: "Calculadora de Precios",
      desc: "3 métodos para calcular el precio justo de cada postre: por porcentaje, precio fijo o multiplicación.",
      badge: "⭐ Más usada",
      badgeBg: "bg-[#FFF8F0] text-[#D4920A] border-[#F5E6C8]/60",
    },
    {
      icon: <Box className="w-6 h-6 text-[#C43B2A]" />,
      title: "Inventario Inteligente",
      desc: "Cuando produces una torta, el sistema descuenta automáticamente los ingredientes e insumos usados de tu stock.",
      badge: "🔥 Nueva",
      badgeBg: "bg-[#FFF0EF] text-[#C43B2A] border-[#FFF0EF]/60",
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-[#C43B2A]" />,
      title: "Dual USD / Bolívares",
      desc: "Todos tus precios en dólares y en bolívares con la tasa EUR oficial del BCV actualizada en tiempo real automáticamente.",
      badge: "⭐ Favorita",
      badgeBg: "bg-[#FFF8F0] text-[#D4920A] border-[#F5E6C8]/60",
    },
    {
      icon: <Receipt className="w-6 h-6 text-[#C43B2A]" />,
      title: "Registro de Ventas",
      desc: "Cada venta queda registrada con su fecha, hora, tasa del día y la ganancia neta exacta que te quedó.",
      badge: "📊 Esencial",
      badgeBg: "bg-blue-50 text-blue-600 border-blue-100",
    },
  ];

  return (
    <section id="caracteristicas" className="py-20 sm:py-24 bg-[#FDF5EC] font-landing-sans relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Headers */}
        <div className="max-w-xl mx-auto mb-16 text-center space-y-3">
          <span className="text-xs font-bold text-[#C43B2A] tracking-widest uppercase bg-[#FFF0EF] px-3.5 py-1 rounded-full border border-[#C43B2A]/10">
            Herramientas Profesionales
          </span>
          <h2 className="font-landing-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C1208] leading-tight pt-2">
            Lo que más usan las reposteras
          </h2>
          <p className="text-base text-[#6B3A1F]">
            Las funciones indispensables creadas para hacer crecer tu emprendimiento y optimizar tu tiempo.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left mb-12">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(196,59,42,0.04)] border border-[#F5E6C8]/30 landing-feature-card flex flex-col justify-between"
            >
              <div>
                {/* Badge */}
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-[#FFF8F0] rounded-[16px] flex items-center justify-center border border-[#F5E6C8]/30">
                    {card.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${card.badgeBg}`}>
                    {card.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-[#2C1208] mb-3">
                  {card.title}
                </h3>

                {/* Desc */}
                <p className="text-sm text-[#6B3A1F] leading-relaxed mb-4">
                  {card.desc}
                </p>
              </div>

              {/* Action/Indicator decoration */}
              <div className="text-xs font-semibold text-[#C43B2A] hover:underline flex items-center gap-1 mt-2 cursor-pointer">
                Saber más <span className="text-[10px]">→</span>
              </div>
            </div>
          ))}
        </div>

        {/* Button footer */}
        <div className="flex justify-center">
          <Link
            href="/register"
            className="inline-block text-center bg-[#C43B2A] hover:bg-[#9B2A1B] text-white px-8 py-3.5 rounded-[14px] font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200"
          >
            Probar todas las funciones →
          </Link>
        </div>
      </div>
    </section>
  );
}

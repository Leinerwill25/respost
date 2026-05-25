"use client";

import Link from "next/link";
import { Check } from "lucide-react";

export default function PricingSection() {
  const freeFeatures = [
    "Hasta 10 recetas registradas",
    "Hasta 5 insumos/materiales",
    "Calculadora de precios (3 métodos)",
    "Tasa EUR BCV en tiempo real",
    "Registro de ventas (últimos 30 días)",
  ];

  const proFeatures = [
    "Recetas ilimitadas",
    "Insumos y materiales ilimitados",
    "Gestión de inventario completa",
    "Módulo de registro de producción",
    "Generador de presupuestos / cotizaciones",
    "Reportes avanzados y gráficos de ganancia",
    "Historial completo de movimientos",
    "Soporte prioritario por WhatsApp",
  ];

  return (
    <section id="precios" className="py-20 sm:py-24 bg-[#FDF5EC] font-landing-sans relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Headers */}
        <div className="max-w-xl mx-auto mb-16 text-center space-y-3">
          <span className="text-xs font-bold text-[#C43B2A] tracking-widest uppercase bg-[#FFF0EF] px-3.5 py-1 rounded-full border border-[#C43B2A]/10">
            Planes y Precios
          </span>
          <h2 className="font-landing-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C1208] leading-tight pt-2">
            Planes para cada etapa
          </h2>
          <p className="text-base text-[#6B3A1F]">
            Empieza gratis hoy mismo y escala las herramientas a medida que tu negocio crece.
          </p>
        </div>

        {/* Pricing Cards container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {/* Card FREE */}
          <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_rgba(196,59,42,0.03)] border border-[#F5E6C8]/30 flex flex-col justify-between relative text-left">
            <div>
              <div className="mb-6">
                <span className="text-xs font-bold text-[#A0714A] tracking-widest uppercase block mb-1">
                  PLAN BÁSICO
                </span>
                <h3 className="text-2xl font-bold text-[#2C1208]">GRATIS</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-[#2C1208] tracking-tight">$0</span>
                  <span className="text-base text-[#6B3A1F] ml-1 font-medium">/ mes</span>
                </div>
                <span className="text-xs text-[#A0714A] block mt-1 font-medium">Siempre gratis para empezar</span>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-[#E2E0FF]/40 my-6" />

              {/* Features list */}
              <ul className="space-y-4 mb-8">
                {freeFeatures.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-[#6B3A1F] leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#FFF8F0] border border-[#F5E6C8]/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[#C43B2A]" />
                    </div>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <Link href="/register" className="w-full block">
              <span className="w-full block text-center bg-transparent hover:bg-[#FFF0EF] text-[#C43B2A] border-2 border-[#C43B2A] py-3 rounded-[14px] font-bold text-sm transition-all duration-200 cursor-pointer">
                Comenzar gratis
              </span>
            </Link>
          </div>

          {/* Card PRO (Highlighted) */}
          <div className="bg-white rounded-[24px] p-8 shadow-[0_15px_40px_rgba(196,59,42,0.1)] border-2 border-[#C43B2A] flex flex-col justify-between relative text-left">
            {/* Recommendation badge */}
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#C43B2A] text-white text-[10px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-widest shadow-md">
              RECOMENDADO
            </div>

            <div>
              <div className="mb-6">
                <span className="text-xs font-bold text-[#C43B2A] tracking-widest uppercase block mb-1">
                  PLAN PROFESIONAL
                </span>
                <h3 className="text-2xl font-bold text-[#2C1208]">PRO</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-[#2C1208] tracking-tight">$9.99</span>
                  <span className="text-base text-[#6B3A1F] ml-1 font-medium">/ mes</span>
                </div>
                <span className="text-xs text-[#A0714A] block mt-1 font-medium">
                  Facturado mensualmente en USD o Bs
                </span>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-[#E2E0FF]/40 my-6" />

              {/* Features list */}
              <ul className="space-y-4 mb-8">
                {proFeatures.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-[#6B3A1F] leading-snug font-medium">
                    <div className="w-5 h-5 rounded-full bg-[#FFF0EF] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[#C43B2A]" />
                    </div>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <Link href="/register" className="w-full block">
                <span className="w-full block text-center bg-[#C43B2A] hover:bg-[#9B2A1B] text-white py-3.5 rounded-[14px] font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
                  Empezar con PRO →
                </span>
              </Link>
              <p className="text-[10px] text-center text-[#A0714A] leading-normal italic">
                * Precio en bolívares calculado según la tasa EUR BCV vigente al momento de tu suscripción.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

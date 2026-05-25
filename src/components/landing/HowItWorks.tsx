"use client";

import { Check, ClipboardList, Utensils, TrendingUp, Sparkles } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      num: "1",
      title: "REGISTRA TUS INSUMOS",
      desc: "Ingresa tus materiales (harina, huevos, azúcar, empaques), indicando la cantidad que compraste y a qué precio en USD o Bs.",
      icon: <ClipboardList className="w-5 h-5 text-[#C43B2A]" />,
    },
    {
      num: "2",
      title: "CREA TUS RECETAS",
      desc: "Arma cada receta seleccionando los ingredientes y su cantidad. El sistema calcula automáticamente el costo exacto por porción.",
      icon: <Utensils className="w-5 h-5 text-[#C43B2A]" />,
    },
    {
      num: "3",
      title: "VENDE Y GANA MÁS",
      desc: "Registra tus ventas desde el inventario o cotizaciones aprobadas. Visualiza tus ganancias netas y tus reportes de rendimiento.",
      icon: <TrendingUp className="w-5 h-5 text-[#C43B2A]" />,
    },
  ];

  const stats = [
    { label: "Reposteras", value: "+200", icon: "📦" },
    { label: "Recetas registradas", value: "+500", icon: "🧁" },
    { label: "Para empezar", value: "$0", icon: "💵" },
    { label: "Tasa BCV", value: "Realtime", icon: "⭐" },
  ];

  return (
    <section id="como-funciona" className="py-20 sm:py-24 bg-[#FFF8F0] font-landing-sans relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: White panel with steps and stats */}
          <div className="lg:col-span-6 bg-white rounded-[28px] p-6 sm:p-10 shadow-[0_10px_40px_rgba(44,18,8,0.04)] border border-[#F5E6C8]/40 text-left">
            <span className="text-xs font-bold text-[#C43B2A] tracking-widest uppercase bg-[#FFF0EF] px-3.5 py-1 rounded-full border border-[#C43B2A]/10">
              Paso a Paso
            </span>
            <h2 className="font-landing-display text-3xl sm:text-4xl font-bold text-[#2C1208] mt-3 mb-2 leading-tight">
              ¿Cómo funciona?
            </h2>
            <p className="text-base text-[#6B3A1F] mb-8">
              En tres sencillos pasos recuperas el control financiero de tu repostería trabajando desde casa.
            </p>

            {/* Steps list */}
            <div className="space-y-8 mb-10">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FFF8F0] flex items-center justify-center font-bold text-sm text-[#C43B2A] border border-[#F5E6C8]/30 shrink-0 relative">
                    {step.icon}
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#C43B2A] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {step.num}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2C1208] tracking-wider mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#6B3A1F] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#E2E0FF]/40">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center p-2 rounded-[14px] bg-[#FFF8F0]/40">
                  <div className="text-lg mb-1">{stat.icon}</div>
                  <div className="font-bold text-base text-[#2C1208]">{stat.value}</div>
                  <div className="text-[10px] text-[#A0714A] leading-tight font-medium mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Grid 2x2 of images */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {/* Foto 1: Repostera trabajando */}
            <div className="rounded-[20px] overflow-hidden relative shadow-md h-48 sm:h-64 border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=300&q=80"
                alt="Repostera decorando torta"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            {/* Foto 2: Ingredientes */}
            <div className="rounded-[20px] overflow-hidden relative shadow-md h-48 sm:h-64 border-4 border-white mt-4 sm:mt-6">
              <img
                src="https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=300&q=80"
                alt="Ingredientes de pastelería"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Foto 3: Torta bella */}
            <div className="rounded-[20px] overflow-hidden relative shadow-md h-48 sm:h-64 border-4 border-white -mt-4 sm:-mt-6">
              <img
                src="/images/finished_cake.png"
                alt="Torta terminada de alta calidad"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Foto 4: Emprendedora sonriendo */}
            <div className="rounded-[20px] overflow-hidden relative shadow-md h-48 sm:h-64 border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=80"
                alt="Repostera independiente con su negocio"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

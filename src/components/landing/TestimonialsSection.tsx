"use client";

import { Star } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      initials: "MG",
      name: "María González",
      business: "Tortas MG, Caracas",
      text: "Antes calculaba todo en Excel y siempre me equivocaba. Con PastryPro sé exactamente cuánto me cuesta cada torta y cuánto gano. ¡Hasta me di cuenta que vendía una receta a pérdida!",
    },
    {
      initials: "LC",
      name: "Laura Castillo",
      business: "Dulces Laura, Valencia",
      text: "Lo del inventario es una maravilla. Cuando hago mis quesillos el sistema ya me descuenta los huevos y la leche de forma automática. Nunca más me quedé sin ingredientes a mitad de semana.",
    },
    {
      initials: "AP",
      name: "Andrea Pérez",
      business: "Repostería AP, Maracaibo",
      text: "Ver el precio en bolívares actualizado con la tasa del BCV automáticamente me ahorra muchísimo tiempo. Mis clientes me preguntan el precio en Bs y ya lo tengo listo al instante.",
    },
  ];

  return (
    <section id="testimonios" className="py-20 sm:py-24 bg-white font-landing-sans relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Headers */}
        <div className="max-w-xl mx-auto mb-16 text-center space-y-3">
          <span className="text-xs font-bold text-[#C43B2A] tracking-widest uppercase bg-[#FFF0EF] px-3.5 py-1 rounded-full border border-[#C43B2A]/10">
            Historias de Éxito
          </span>
          <h2 className="font-landing-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C1208] leading-tight pt-2">
            Lo que dicen las reposteras
          </h2>
          <p className="text-base text-[#6B3A1F]">
            Emprendedoras que ya profesionalizaron sus costos y ahora ven crecer sus ganancias.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-[#FFF8F0]/60 rounded-[24px] p-6 sm:p-8 border border-[#F5E6C8]/40 hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Rating */}
                <div className="flex text-[#D4920A] gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-sm text-[#6B3A1F] leading-relaxed italic mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-[#E2E0FF]/40">
                <div className="w-10 h-10 rounded-full bg-[#C43B2A] text-white flex items-center justify-center font-bold text-xs shadow-inner">
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2C1208]">{t.name}</h4>
                  <p className="text-xs text-[#A0714A]">{t.business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

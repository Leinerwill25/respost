"use client";

import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="py-16 sm:py-20 bg-[#FDF5EC] font-landing-sans relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-[#C43B2A] rounded-[24px] sm:rounded-[36px] p-8 sm:p-14 md:p-16 text-center text-white relative overflow-hidden shadow-xl">
          {/* Floating Emojis with opacity (Dakingo inspired) */}
          <span className="absolute text-4xl sm:text-5xl top-10 left-10 opacity-30 select-none pointer-events-none animate-float-circle">
            🧁
          </span>
          <span className="absolute text-5xl sm:text-6xl bottom-10 left-16 opacity-25 select-none pointer-events-none animate-float-circle-delayed">
            🎂
          </span>
          <span className="absolute text-4xl sm:text-5xl top-12 right-12 opacity-30 select-none pointer-events-none animate-float-circle-fast">
            🍰
          </span>
          <span className="absolute text-4xl sm:text-5xl bottom-12 right-20 opacity-20 select-none pointer-events-none animate-float-circle">
            🍪
          </span>

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <span className="text-xs sm:text-sm font-extrabold tracking-widest text-[#FFF8F0]/80 uppercase bg-white/10 px-4 py-1.5 rounded-full inline-block border border-white/5">
              ¿Lista para empezar?
            </span>
            <h2 className="font-landing-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
              PastryPro — La herramienta que tu repostería necesitaba
            </h2>
            <p className="text-base sm:text-lg text-[#FFF8F0]/90 leading-relaxed font-normal">
              Controla tus costos de producción. Gestiona tu stock sin sorpresas. Vende con precios reales y haz crecer tu emprendimiento dulce.
            </p>
            
            {/* CTA Button */}
            <div className="pt-4 flex justify-center">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-[#FDF5EC] hover:bg-[#FFF8F0] text-[#C43B2A] px-8 py-4 rounded-[16px] font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 inline-block text-center cursor-pointer"
              >
                Crear mi cuenta gratis — es gratis para siempre →
              </Link>
            </div>
            
            <p className="text-xs text-[#FFF8F0]/70">
              Registro rápido en menos de 1 minuto • No requiere tarjeta de crédito
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

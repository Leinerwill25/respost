"use client";

import Link from "next/link";
import { Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#C43B2A] text-white pt-28 pb-32 md:pt-36 md:pb-40 animate-fade-in-up">
      {/* Decorative Circles (Dakingo style) */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-white/5 -bottom-48 -left-20 pointer-events-none" />
      <div className="absolute w-[250px] h-[250px] rounded-full bg-white/8 -top-10 -right-10 pointer-events-none" />
      <div className="absolute w-[150px] h-[150px] rounded-full bg-white/5 top-1/3 left-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9B2A1B]/60 text-xs font-semibold uppercase tracking-wider text-[#FFF8F0] border border-white/10">
              <span>🆕</span> ¡Ya disponible para reposteras!
            </span>

            {/* Main Heading */}
            <h1 className="font-landing-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
              CONTROLA TUS <br className="hidden sm:inline" />
              COSTOS, <br />
              <span className="font-landing-cursive font-normal italic text-[#FFF8F0] tracking-normal capitalize block mt-2 text-5xl sm:text-6xl lg:text-7xl lowercase">
                y gana más
              </span>
            </h1>

            {/* Subtitle */}
            <p className="font-landing-sans text-lg text-[#FFF8F0]/90 max-w-xl font-normal leading-relaxed">
              Deja el Excel. Calcula precios reales, gestiona tu inventario y
              registra cada venta en un solo lugar. Diseñado especialmente para
              reposteras independientes en Venezuela.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-[#FDF5EC] hover:bg-[#FFF8F0] text-[#C43B2A] px-8 py-4 rounded-[16px] font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 text-center inline-block"
              >
                Comenzar gratis →
              </Link>
              <a
                href="#como-funciona"
                className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white px-8 py-4 rounded-[16px] font-semibold text-base border-2 border-white/60 hover:border-white transition-all duration-200 text-center inline-block"
              >
                Ver demo
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10 w-full lg:w-auto">
              <div className="flex text-[#D4920A] shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="font-landing-sans text-xs text-[#FFF8F0]/80">
                <span className="font-semibold text-white">+200 reposteras</span> confían en PastryPro para su negocio
              </p>
            </div>
          </div>

          {/* Right Column: Floating Dishes (Dakingo style) */}
          <div className="lg:col-span-5 relative h-[380px] sm:h-[450px] w-full flex items-center justify-center lg:justify-end">
            {/* Main dish circle (Cake) */}
            <div className="w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] rounded-full bg-white p-2.5 shadow-2xl relative z-20 animate-float-circle overflow-hidden border border-[#E2E0FF]/10 shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <img
                  src="/images/hero_cake.png"
                  alt="Torta elegante decorada en PastryPro"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Secondary dish circle 1 (Chocolate cake slice, Top Right) */}
            <div className="hidden md:block w-[140px] h-[140px] rounded-full bg-white p-1.5 shadow-2xl absolute top-6 right-2 z-10 animate-float-circle-delayed overflow-hidden border border-[#E2E0FF]/10">
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&q=80"
                  alt="Porción de torta de chocolate"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Secondary dish circle 2 (Cupcakes, Bottom Right/Center) */}
            <div className="hidden md:block w-[130px] h-[130px] rounded-full bg-white p-1.5 shadow-2xl absolute bottom-4 left-6 z-30 animate-float-circle-fast overflow-hidden border border-[#E2E0FF]/10">
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=200&q=80"
                  alt="Cupcakes decorados"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Decorative Gold Badge floating */}
            <div className="absolute top-1/3 left-10 md:left-24 z-30 bg-[#D4920A] text-[#2C1208] text-xs font-bold py-2 px-3.5 rounded-full shadow-lg rotate-12 flex items-center gap-1 border border-[#F5E6C8]/20">
              <span>✨</span> Control total
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

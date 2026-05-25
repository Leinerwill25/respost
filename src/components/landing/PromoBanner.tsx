"use client";

import Link from "next/link";

export default function PromoBanner() {
  const avatars = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80", // face 1
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", // face 2
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80", // face 3
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&q=80", // face 4
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#FDF5EC] font-landing-sans relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-[#FFF8F0] rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 md:p-12 shadow-[0_8px_30px_rgba(196,59,42,0.04)] border border-[#F5E6C8]/60 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          
          {/* Background subtle texture */}
          <div className="absolute w-[200px] h-[200px] rounded-full bg-[#C43B2A]/2 absolute -bottom-24 -right-24 pointer-events-none" />

          {/* Left: Decorative Gold Price Tag SVG with bow */}
          <div className="shrink-0 animate-float-circle">
            <svg
              width="80"
              height="100"
              viewBox="0 0 80 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#D4920A]"
            >
              {/* Bow / Lazo */}
              <path
                d="M40 25C43 15 52 12 55 18C58 24 47 30 40 32C33 30 22 24 25 18C28 12 37 15 40 25Z"
                fill="currentColor"
                opacity="0.85"
              />
              <circle cx="40" cy="32" r="3" fill="#FFF8F0" />
              
              {/* Price Tag Body */}
              <path
                d="M40 36L15 55V85C15 87.7614 17.2386 90 20 90H60C62.7614 90 65 87.7614 65 85V55L40 36Z"
                fill="currentColor"
              />
              {/* Tag Hole */}
              <circle cx="40" cy="46" r="4" fill="#FFF8F0" />
              {/* Decorative dotted lines */}
              <line x1="25" y1="80" x2="55" y2="80" stroke="#FFF8F0" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="25" y1="72" x2="55" y2="72" stroke="#FFF8F0" strokeWidth="1.5" />
              {/* Icon inside Tag */}
              <path
                d="M37 58.5C37 57.6716 37.6716 57 38.5 57H42.5C43.3284 57 44 57.6716 44 58.5V64.5C44 65.3284 43.3284 66 42.5 66H38.5C37.6716 66 37 65.3284 37 64.5V58.5Z"
                fill="#FFF8F0"
              />
              <path d="M40 54V57" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" />
              <path d="M40 66V69" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Center: Copy */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <span className="text-xs font-extrabold tracking-widest text-[#C43B2A] uppercase">
              ¡PRODUCE CON CONFIANZA!
            </span>
            <h3 className="font-landing-display text-2xl sm:text-3xl font-bold text-[#2C1208] leading-tight">
              ¡COMIENZA GRATIS HOY!
            </h3>
            <p className="text-sm text-[#6B3A1F] leading-relaxed max-w-xl">
              Prueba PastryPro sin costo. Registra tus primeras recetas, calcula tus precios reales y descubre cuánto estás ganando (o perdiendo) con cada postre.
            </p>
            <p className="text-xs font-semibold text-[#A0714A]">
              ✨ Sin tarjeta de crédito. Sin letra chica.
            </p>
          </div>

          {/* Right: Button */}
          <div className="shrink-0 w-full md:w-auto flex flex-col items-center gap-4">
            <Link
              href="/register"
              className="w-full md:w-auto bg-[#C43B2A] hover:bg-[#9B2A1B] text-white px-8 py-3.5 rounded-[16px] font-bold text-base shadow-md hover:shadow-lg transition-all duration-200 inline-block text-center whitespace-nowrap"
            >
              Crear mi cuenta gratis →
            </Link>

            {/* Social Avatars inside the box */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {avatars.map((url, idx) => (
                  <div key={idx} className="w-7 h-7 rounded-full border-2 border-white overflow-hidden relative shadow-sm">
                    <img
                      src={url}
                      alt="Avatar de repostera"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <span className="text-[11px] text-[#6B3A1F] font-medium leading-none">
                Únete a <span className="font-bold text-[#C43B2A]">+200</span> reposteras
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

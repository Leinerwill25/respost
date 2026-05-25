"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Footer() {
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert("¡Gracias por suscribirte al newsletter de PastryPro! 🧁");
  };

  return (
    <footer className="bg-[#9B2A1B] text-[#FFF8F0] pt-16 pb-8 font-landing-sans border-t border-white/5 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Main Links columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Col 1: Brand details */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl animate-pulse-soft">🧁</span>
              <span className="font-landing-display text-xl font-bold tracking-tight text-white">
                Pastry<span className="text-[#FDF5EC] font-extrabold">Pro</span>
              </span>
            </Link>
            <p className="text-xs text-[#FFF8F0]/80 leading-relaxed font-normal">
              Gestiona tus costos de producción, inventario y ventas como una profesional de la pastelería.
            </p>
          </div>

          {/* Col 2: Producto */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold tracking-widest text-[#FDF5EC] uppercase">
              PRODUCTO
            </h4>
            <ul className="space-y-2 text-xs text-[#FFF8F0]/80 font-normal">
              <li>
                <a href="#caracteristicas" className="hover:text-white transition-colors">
                  Características
                </a>
              </li>
              <li>
                <a href="#precios" className="hover:text-white transition-colors">
                  Precios
                </a>
              </li>
              <li>
                <span className="opacity-50 cursor-not-allowed">Novedades (Próximamente)</span>
              </li>
              <li>
                <span className="opacity-50 cursor-not-allowed">Plan de desarrollo</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Soporte */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold tracking-widest text-[#FDF5EC] uppercase">
              SOPORTE
            </h4>
            <ul className="space-y-2 text-xs text-[#FFF8F0]/80 font-normal">
              <li>
                <span className="opacity-55 cursor-default">Centro de ayuda</span>
              </li>
              <li>
                <span className="opacity-55 cursor-default">Contáctanos</span>
              </li>
              <li>
                <a
                  href="https://wa.me/584120000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp Soporte
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold tracking-widest text-[#FDF5EC] uppercase">
              LEGAL
            </h4>
            <ul className="space-y-2 text-xs text-[#FFF8F0]/80 font-normal">
              <li>
                <span className="opacity-55 cursor-default">Términos de uso</span>
              </li>
              <li>
                <span className="opacity-55 cursor-default">Privacidad de recetas</span>
              </li>
              <li>
                <span className="opacity-55 cursor-default">Política de cookies</span>
              </li>
            </ul>
          </div>

          {/* Col 5: Newsletter */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <h4 className="text-xs font-extrabold tracking-widest text-[#FDF5EC] uppercase">
              NEWSLETTER
            </h4>
            <p className="text-xs text-[#FFF8F0]/80 leading-normal">
              Recibe tips de gestión, costos y recetas para tu repostería.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 pt-1.5">
              <input
                type="email"
                placeholder="Tu correo"
                required
                className="w-full text-xs bg-white/10 border border-white/15 rounded-[8px] px-2.5 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
              />
              <button
                type="submit"
                className="bg-[#FDF5EC] hover:bg-[#FFF8F0] text-[#C43B2A] p-2 rounded-[8px] flex items-center justify-center shrink-0 border-none transition-all duration-200"
                aria-label="Subscribe"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/10 my-8" />

        {/* Footer bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#FFF8F0]/70 font-normal gap-4">
          <p>© 2026 PastryPro. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Hecho con <span>🧁</span> para reposteras venezolanas independientes.
          </p>
        </div>

      </div>
    </footer>
  );
}

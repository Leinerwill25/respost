"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Características", href: "#caracteristicas" },
    { label: "¿Cómo funciona?", href: "#como-funciona" },
    { label: "Precios", href: "#precios" },
    { label: "Testimonios", href: "#testimonios" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-landing-sans bg-white/95 backdrop-blur-md ${
          isScrolled ? "shadow-md py-3" : "border-b border-[#E2E0FF]/40 py-4"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl animate-pulse-soft">🧁</span>
            <span className="font-landing-display text-xl font-bold text-[#2C1208] tracking-tight">
              Pastry<span className="text-[#C43B2A] font-extrabold">Pro</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#6B3A1F] hover:text-[#C43B2A] transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-[#6B3A1F] hover:text-[#C43B2A] transition-colors duration-200 px-3 py-2"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="bg-[#C43B2A] hover:bg-[#9B2A1B] text-white px-5 py-2.5 rounded-[12px] font-semibold text-sm shadow-sm transition-all duration-200 inline-block text-center"
            >
              Comenzar gratis →
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#2C1208] hover:text-[#C43B2A] transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-x-0 top-[60px] z-40 md:hidden bg-white border-b border-[#E2E0FF]/60 shadow-lg p-5 font-landing-sans transition-all duration-300 transform origin-top ${
          isMobileMenuOpen
            ? "opacity-100 scale-y-100"
            : "opacity-0 scale-y-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-[#6B3A1F] hover:text-[#C43B2A] py-2 border-b border-gray-50 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-3">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-center text-sm font-semibold text-[#6B3A1F] hover:text-[#C43B2A] py-2.5 rounded-[12px] border border-[#E2E0FF]"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full bg-[#C43B2A] hover:bg-[#9B2A1B] text-white py-3 rounded-[12px] font-semibold text-sm shadow-sm transition-all duration-200 text-center block"
            >
              Comenzar gratis →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

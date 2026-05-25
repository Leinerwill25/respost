import type { Metadata } from "next";
import { Nunito, DM_Sans, Dancing_Script } from "next/font/google";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesBar from "@/components/landing/FeaturesBar";
import FeatureCards from "@/components/landing/FeatureCards";
import HowItWorks from "@/components/landing/HowItWorks";
import PromoBanner from "@/components/landing/PromoBanner";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
  weight: ["600", "700", "800", "900"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PastryPro — Gestión de costos y ventas para reposteras",
  description:
    "Calcula el precio real de tus postres, gestiona tu inventario y registra cada venta en USD y Bs con la tasa BCV actualizada. Gratis para empezar.",
  keywords: [
    "repostería",
    "gestión de costos",
    "inventario",
    "ventas",
    "Venezuela",
    "USD",
    "bolívares",
    "tasa BCV",
  ],
  openGraph: {
    title: "PastryPro — Para reposteras que quieren crecer",
    description:
      "La plataforma SaaS que te ayuda a calcular precios reales y gestionar tu repostería.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div
      className={`${nunito.variable} ${dmSans.variable} ${dancingScript.variable} font-landing-sans bg-[#FDF5EC] text-[#2C1208] antialiased min-h-screen`}
    >
      <Navbar />
      <main className="overflow-x-hidden">
        <HeroSection />
        <FeaturesBar />
        <FeatureCards />
        <HowItWorks />
        <PromoBanner />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

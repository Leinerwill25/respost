"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    {
      question: "¿Es realmente gratis para empezar?",
      answer: "Sí. El plan gratis no requiere tarjeta de crédito. Puedes registrarte ahora mismo y empezar a usar PastryPro sin pagar nada. Cuando tu negocio crezca y necesites más funciones, puedes actualizar al plan Pro.",
    },
    {
      question: "¿Cómo funciona la tasa de cambio?",
      answer: "PastryPro se conecta automáticamente al Banco Central de Venezuela (BCV) y obtiene la tasa EUR/Bs actualizada. Todos tus precios y costos se muestran simultáneamente en dólares y en bolívares. La tasa se actualiza periódicamente para que no tengas que preocuparte por devaluaciones.",
    },
    {
      question: "¿Puedo usar PastryPro desde el celular?",
      answer: "¡Totalmente! PastryPro está optimizado al 100% para dispositivos móviles. Puedes registrar el uso de insumos, crear presupuestos o guardar ventas desde la cocina directamente utilizando tu teléfono inteligente.",
    },
    {
      question: "¿Qué pasa si tengo varias reposteras en mi equipo?",
      answer: "Por ahora, cada cuenta es individual para garantizar que tus datos sean privados y 100% de tu pertenencia. En el futuro cercano agregaremos la funcionalidad de multiusuarios y equipos para negocios con múltiples asistentes o socias.",
    },
    {
      question: "¿Los datos de mis recetas son privados?",
      answer: "Sí, de forma absoluta. Tus recetas, costos, inventario y registros de ventas están completamente encriptados y protegidos. Ninguna otra repostera o usuario de la plataforma puede ver ni acceder a tus fórmulas o información comercial.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-20 sm:py-24 bg-[#FDF5EC] font-landing-sans relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-left">
        {/* Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-bold text-[#C43B2A] tracking-widest uppercase bg-[#FFF0EF] px-3.5 py-1 rounded-full border border-[#C43B2A]/10">
            Ayuda y Soporte
          </span>
          <h2 className="font-landing-display text-3xl sm:text-4xl font-bold text-[#2C1208] mt-3">
            Preguntas frecuentes
          </h2>
          <p className="text-sm text-[#6B3A1F] max-w-md mx-auto">
            ¿Tienes alguna duda? Resolvemos las consultas más comunes de las reposteras.
          </p>
        </div>

        {/* FAQ Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-[18px] border border-[#F5E6C8]/40 shadow-[0_2px_12px_rgba(196,59,42,0.02)] overflow-hidden transition-all duration-300"
              >
                {/* Question trigger */}
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-[#2C1208] hover:text-[#C43B2A] transition-colors focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#A0714A] transition-transform duration-300 shrink-0 ml-4 ${
                      isOpen ? "transform rotate-180 text-[#C43B2A]" : ""
                    }`}
                  />
                </button>

                {/* Answer content (Smooth grid transition) */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-5 pt-0 border-t border-gray-50 text-sm text-[#6B3A1F] leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

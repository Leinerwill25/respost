"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  LogOut,
  AlertTriangle,
  TrendingUp,
  User,
  ChevronDown,
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useEuroRate } from "@/hooks/useRates";
import { useStockAlerts } from "@/hooks/useIngredients";
import { formatRelativeDate, isRateStale } from "@/lib/currency";
import { toast } from "sonner";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const { data: rate } = useEuroRate();
  const { data: stockAlerts } = useStockAlerts();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  const rateIsStale = rate ? isRateStale(rate.rate_datetime, 2) : false;
  const alertsCount = stockAlerts?.length ?? 0;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-16 bg-[var(--bg-card)] border-b border-[var(--border-default)] flex items-center px-6 gap-4 sticky top-0 z-20 shadow-sm font-sans">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
        id="header-menu-btn"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Tasa EUR */}
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[13px] font-semibold border transition-colors ${
          rateIsStale
            ? "bg-[var(--warning-bg)] border-[var(--warning)]/20 text-[var(--warning)]"
            : "bg-[var(--red-50)] border-[var(--red-100)] text-[var(--red-600)]"
        }`}
      >
        <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="font-medium hidden sm:inline">Tasa EUR/Bs:</span>
        <span className="font-bold">
          {rate ? rate.rate.toFixed(2) : "—"}
        </span>
        {rate && (
          <span className="text-xs opacity-75 hidden md:inline font-normal">
            • {formatRelativeDate(rate.rate_datetime)}
          </span>
        )}
        {rateIsStale && (
          <AlertTriangle className="w-3.5 h-3.5 text-[#E65100]" />
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Alertas de stock */}
      <div className="relative">
        <button
          onClick={() => setShowAlerts(!showAlerts)}
          className="relative w-9 h-9 flex items-center justify-center rounded-[12px] hover:bg-[#FFF8F3] text-[#6B3A1F] transition-colors"
          id="header-alerts-btn"
        >
          <Bell className="w-5 h-5" />
          {alertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C43B2A] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
              {alertsCount > 9 ? "9+" : alertsCount}
            </span>
          )}
        </button>

        {/* Dropdown de alertas */}
        {showAlerts && (
          <div className="absolute right-0 top-12 w-80 bg-[var(--bg-card)] rounded-[var(--radius-lg)] shadow-lg border border-[var(--border-default)] z-50 overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-[var(--border-default)]">
              <h3 className="font-semibold text-[var(--text-heading)] font-display">
                Alertas de stock ({alertsCount})
              </h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {alertsCount === 0 ? (
                <div className="p-4 text-center text-[var(--text-muted)] text-sm">
                  ✓ Todos los insumos tienen stock suficiente
                </div>
              ) : (
                stockAlerts?.map((alert) => (
                  <Link
                    key={alert.id}
                    href={`/insumos/${alert.id}`}
                    onClick={() => setShowAlerts(false)}
                    className="flex items-start gap-3 p-3 hover:bg-[var(--bg-hover)] border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 text-[var(--warning)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-heading)]">
                        {alert.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Stock: {alert.stock_quantity} {alert.unit} (mín:{" "}
                        {alert.min_stock_alert})
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <div className="p-3 border-t border-[var(--border-default)] bg-[var(--bg-muted)]">
              <Link
                href="/insumos"
                onClick={() => setShowAlerts(false)}
                className="text-xs text-[var(--red-600)] font-semibold hover:underline"
              >
                Ver todos los insumos →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
          id="header-user-btn"
        >
          <div className="w-7 h-7 bg-[var(--red-600)] rounded-full flex items-center justify-center shadow-sm">
            <User className="w-4 h-4 text-white" />
          </div>
          <ChevronDown className="w-3.5 h-3.5 hidden sm:block" />
        </button>

        {showUserMenu && (
          <div className="absolute right-0 top-12 w-44 bg-[var(--bg-card)] rounded-[var(--radius-lg)] shadow-lg border border-[var(--border-default)] z-50 overflow-hidden animate-fade-in">
            <Link
              href="/perfil"
              onClick={() => setShowUserMenu(false)}
              className="flex items-center gap-2 p-3 hover:bg-[var(--bg-hover)] text-sm text-[var(--text-secondary)] transition-colors"
            >
              <User className="w-4 h-4" />
              Mi perfil
            </Link>
            <div className="border-t border-[var(--border-default)]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 p-3 hover:bg-[var(--red-100)] text-sm text-[var(--red-600)] transition-colors"
                id="header-logout-btn"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

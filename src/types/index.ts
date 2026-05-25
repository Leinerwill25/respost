// Global app types for PastryPro

export type IngredientUnit = "g" | "kg" | "ml" | "l" | "unidades";

export type PricingMethod = "percentage" | "fixed" | "multiplication";

export type QuoteStatus = "draft" | "sent" | "approved" | "rejected";

export type SaleType = "inventory" | "quote" | "manual";

export type PaymentMethod =
  | "efectivo_usd"
  | "efectivo_bs"
  | "transferencia"
  | "pago_movil"
  | "zelle"
  | "otro";

export type MovementReason = "compra" | "produccion" | "merma" | "ajuste";

export interface PriceBreakdown {
  materialsCostUsd: number;
  productionCostUsd: number;
  profitUsd: number;
  subtotalUsd: number;
  taxUsd: number;
  salePriceUsd: number;
  pricePerPortionUsd: number;
  salePriceBs?: number;
  pricePerPortionBs?: number;
}

export interface QuoteSection {
  id: string;
  name: string;
  items: QuoteSectionItem[];
}

export interface QuoteSectionItem {
  id: string;
  name: string;
  ingredient_id?: string;
  quantity: number;
  unit?: IngredientUnit;
  price_usd: number;
  is_manual: boolean;
}

export interface StockAlert {
  ingredient_id: string;
  name: string;
  current_stock: number;
  min_stock: number;
  unit: IngredientUnit;
  missing_quantity: number;
  estimated_cost_usd: number;
}

export interface DashboardKPIs {
  sales_month_usd: number;
  sales_month_bs: number;
  profit_month_usd: number;
  profit_month_bs: number;
  inventory_count: number;
  stock_alerts_count: number;
}

export interface RecipeWithIngredients {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string | null;
  portions: number;
  portion_label: string | null;
  pricing_method: PricingMethod;
  cost_production_pct: number | null;
  profit_pct: number | null;
  tax_pct: number | null;
  fixed_cost_usd: number | null;
  fixed_profit_usd: number | null;
  cost_multiplier: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  recipe_ingredients: Array<{
    id: string;
    ingredient_id: string;
    quantity: number;
    notes: string | null;
    ingredients: {
      id: string;
      name: string;
      unit: IngredientUnit;
      package_size: number;
      price_usd: number;
      stock_quantity: number;
    };
  }>;
}

export interface FinishedInventoryWithRecipe {
  id: string;
  user_id: string;
  recipe_id: string;
  production_log_id: string | null;
  quantity_available: number;
  sale_price_usd: number;
  cost_price_usd: number;
  euro_rate_at_production: number;
  created_at: string;
  updated_at: string;
  recipes: {
    id: string;
    name: string;
    portions: number;
    portion_label: string | null;
    image_url: string | null;
  };
}

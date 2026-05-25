// Database types generated from Supabase schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          business_name: string | null;
          email: string;
          avatar_url: string | null;
          plan: "free" | "pro";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          business_name?: string | null;
          email: string;
          avatar_url?: string | null;
          plan?: "free" | "pro";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          business_name?: string | null;
          email?: string;
          avatar_url?: string | null;
          plan?: "free" | "pro";
          created_at?: string;
          updated_at?: string;
        };
      };
      ingredient_categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      ingredients: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          name: string;
          unit: "g" | "kg" | "ml" | "l" | "unidades";
          package_size: number;
          price_usd: number;
          stock_quantity: number;
          min_stock_alert: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          name: string;
          unit: "g" | "kg" | "ml" | "l" | "unidades";
          package_size: number;
          price_usd: number;
          stock_quantity?: number;
          min_stock_alert?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          name?: string;
          unit?: "g" | "kg" | "ml" | "l" | "unidades";
          package_size?: number;
          price_usd?: number;
          stock_quantity?: number;
          min_stock_alert?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ingredient_movements: {
        Row: {
          id: string;
          user_id: string;
          ingredient_id: string;
          movement_type: "IN" | "OUT";
          quantity: number;
          reason: "compra" | "produccion" | "merma" | "ajuste";
          reference_id: string | null;
          reference_label: string | null;
          euro_rate: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ingredient_id: string;
          movement_type: "IN" | "OUT";
          quantity: number;
          reason: "compra" | "produccion" | "merma" | "ajuste";
          reference_id?: string | null;
          reference_label?: string | null;
          euro_rate?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ingredient_id?: string;
          movement_type?: "IN" | "OUT";
          quantity?: number;
          reason?: "compra" | "produccion" | "merma" | "ajuste";
          reference_id?: string | null;
          reference_label?: string | null;
          euro_rate?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      recipes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          category: string | null;
          portions: number;
          portion_label: string | null;
          pricing_method: "percentage" | "fixed" | "multiplication";
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
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          category?: string | null;
          portions?: number;
          portion_label?: string | null;
          pricing_method?: "percentage" | "fixed" | "multiplication";
          cost_production_pct?: number | null;
          profit_pct?: number | null;
          tax_pct?: number | null;
          fixed_cost_usd?: number | null;
          fixed_profit_usd?: number | null;
          cost_multiplier?: number | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          portions?: number;
          portion_label?: string | null;
          pricing_method?: "percentage" | "fixed" | "multiplication";
          cost_production_pct?: number | null;
          profit_pct?: number | null;
          tax_pct?: number | null;
          fixed_cost_usd?: number | null;
          fixed_profit_usd?: number | null;
          cost_multiplier?: number | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      recipe_ingredients: {
        Row: {
          id: string;
          recipe_id: string;
          ingredient_id: string;
          quantity: number;
          notes: string | null;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          ingredient_id: string;
          quantity: number;
          notes?: string | null;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          ingredient_id?: string;
          quantity?: number;
          notes?: string | null;
        };
      };
      production_logs: {
        Row: {
          id: string;
          user_id: string;
          recipe_id: string;
          quantity_produced: number;
          euro_rate: number;
          total_cost_usd: number;
          total_cost_bs: number;
          notes: string | null;
          produced_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recipe_id: string;
          quantity_produced?: number;
          euro_rate: number;
          total_cost_usd: number;
          total_cost_bs: number;
          notes?: string | null;
          produced_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recipe_id?: string;
          quantity_produced?: number;
          euro_rate?: number;
          total_cost_usd?: number;
          total_cost_bs?: number;
          notes?: string | null;
          produced_at?: string;
          created_at?: string;
        };
      };
      finished_inventory: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          recipe_id: string;
          production_log_id?: string | null;
          quantity_available?: number;
          sale_price_usd: number;
          cost_price_usd: number;
          euro_rate_at_production: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recipe_id?: string;
          production_log_id?: string | null;
          quantity_available?: number;
          sale_price_usd?: number;
          cost_price_usd?: number;
          euro_rate_at_production?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          user_id: string;
          client_name: string | null;
          client_contact: string | null;
          title: string;
          quote_type: "postre" | "combo";
          sections: Json;
          subtotal_materials_usd: number;
          pricing_method: "percentage" | "fixed" | "multiplication";
          cost_production_pct: number | null;
          profit_pct: number | null;
          tax_pct: number | null;
          fixed_cost_usd: number | null;
          fixed_profit_usd: number | null;
          cost_multiplier: number | null;
          total_price_usd: number;
          portions: number;
          price_per_portion_usd: number;
          euro_rate: number;
          total_price_bs: number;
          status: "draft" | "sent" | "approved" | "rejected";
          valid_until: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_name?: string | null;
          client_contact?: string | null;
          title: string;
          quote_type?: "postre" | "combo";
          sections?: Json;
          subtotal_materials_usd?: number;
          pricing_method?: "percentage" | "fixed" | "multiplication";
          cost_production_pct?: number | null;
          profit_pct?: number | null;
          tax_pct?: number | null;
          fixed_cost_usd?: number | null;
          fixed_profit_usd?: number | null;
          cost_multiplier?: number | null;
          total_price_usd?: number;
          portions?: number;
          price_per_portion_usd?: number;
          euro_rate?: number;
          total_price_bs?: number;
          status?: "draft" | "sent" | "approved" | "rejected";
          valid_until?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_name?: string | null;
          client_contact?: string | null;
          title?: string;
          quote_type?: "postre" | "combo";
          sections?: Json;
          subtotal_materials_usd?: number;
          pricing_method?: "percentage" | "fixed" | "multiplication";
          cost_production_pct?: number | null;
          profit_pct?: number | null;
          tax_pct?: number | null;
          fixed_cost_usd?: number | null;
          fixed_profit_usd?: number | null;
          cost_multiplier?: number | null;
          total_price_usd?: number;
          portions?: number;
          price_per_portion_usd?: number;
          euro_rate?: number;
          total_price_bs?: number;
          status?: "draft" | "sent" | "approved" | "rejected";
          valid_until?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          user_id: string;
          sale_type: "inventory" | "quote" | "manual";
          finished_inventory_id: string | null;
          quote_id: string | null;
          product_description: string | null;
          quantity: number;
          unit_price_usd: number;
          total_price_usd: number;
          unit_cost_usd: number;
          total_cost_usd: number;
          profit_usd: number;
          profit_pct: number;
          euro_rate: number;
          total_price_bs: number;
          client_name: string | null;
          payment_method:
            | "efectivo_usd"
            | "efectivo_bs"
            | "transferencia"
            | "pago_movil"
            | "zelle"
            | "otro"
            | null;
          sold_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sale_type: "inventory" | "quote" | "manual";
          finished_inventory_id?: string | null;
          quote_id?: string | null;
          product_description?: string | null;
          quantity?: number;
          unit_price_usd: number;
          total_price_usd: number;
          unit_cost_usd?: number;
          total_cost_usd?: number;
          profit_usd?: number;
          profit_pct?: number;
          euro_rate: number;
          total_price_bs: number;
          client_name?: string | null;
          payment_method?:
            | "efectivo_usd"
            | "efectivo_bs"
            | "transferencia"
            | "pago_movil"
            | "zelle"
            | "otro"
            | null;
          sold_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          sale_type?: "inventory" | "quote" | "manual";
          finished_inventory_id?: string | null;
          quote_id?: string | null;
          product_description?: string | null;
          quantity?: number;
          unit_price_usd?: number;
          total_price_usd?: number;
          unit_cost_usd?: number;
          total_cost_usd?: number;
          profit_usd?: number;
          profit_pct?: number;
          euro_rate?: number;
          total_price_bs?: number;
          client_name?: string | null;
          payment_method?:
            | "efectivo_usd"
            | "efectivo_bs"
            | "transferencia"
            | "pago_movil"
            | "zelle"
            | "otro"
            | null;
          sold_at?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      rates: {
        Row: {
          id: string;
          code: string;
          rate: number;
          curr_date: string;
          curr_time: string;
          rate_datetime: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          rate: number;
          curr_date: string;
          curr_time: string;
          rate_datetime: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          rate?: number;
          curr_date?: string;
          curr_time?: string;
          rate_datetime?: string;
          created_at?: string;
        };
      };
    };
    Functions: {
      process_production: {
        Args: {
          p_user_id: string;
          p_recipe_id: string;
          p_quantity_produced: number;
          p_euro_rate: number;
          p_total_cost_usd: number;
          p_total_cost_bs: number;
          p_sale_price_usd: number;
          p_cost_price_usd: number;
          p_notes?: string;
        };
        Returns: string;
      };
      process_sale: {
        Args: {
          p_user_id: string;
          p_sale_type: string;
          p_finished_inventory_id?: string;
          p_quote_id?: string;
          p_product_description?: string;
          p_quantity?: number;
          p_unit_price_usd?: number;
          p_unit_cost_usd?: number;
          p_euro_rate?: number;
          p_client_name?: string;
          p_payment_method?: string;
          p_notes?: string;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

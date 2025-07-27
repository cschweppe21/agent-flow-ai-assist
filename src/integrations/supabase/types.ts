export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_logs: {
        Row: {
          cost_cents: number | null
          created_at: string
          id: string
          request_type: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          cost_cents?: number | null
          created_at?: string
          id?: string
          request_type: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          cost_cents?: number | null
          created_at?: string
          id?: string
          request_type?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      buyer_showings: {
        Row: {
          buyer_id: string
          created_at: string
          feedback: string | null
          id: string
          interest_level: string | null
          listing_id: string
          showing_date: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          feedback?: string | null
          id?: string
          interest_level?: string | null
          listing_id: string
          showing_date: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          feedback?: string | null
          id?: string
          interest_level?: string | null
          listing_id?: string
          showing_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_showings_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_showings_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "past_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_showings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      buyers: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          preferred_areas: string[] | null
          preferred_bathrooms: number | null
          preferred_bedrooms: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          preferred_areas?: string[] | null
          preferred_bathrooms?: number | null
          preferred_bedrooms?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_areas?: string[] | null
          preferred_bathrooms?: number | null
          preferred_bedrooms?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_ratings: {
        Row: {
          client_id: string
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          amount: number
          buyer_id: string | null
          commission_type: string
          created_at: string
          date_earned: string
          description: string | null
          id: string
          listing_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          buyer_id?: string | null
          commission_type?: string
          created_at?: string
          date_earned?: string
          description?: string | null
          id?: string
          listing_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          buyer_id?: string | null
          commission_type?: string
          created_at?: string
          date_earned?: string
          description?: string | null
          id?: string
          listing_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      data_refresh_log: {
        Row: {
          data_source: string
          error_message: string | null
          id: string
          records_updated: number | null
          refresh_completed_at: string | null
          refresh_started_at: string
          status: string
        }
        Insert: {
          data_source: string
          error_message?: string | null
          id?: string
          records_updated?: number | null
          refresh_completed_at?: string | null
          refresh_started_at?: string
          status?: string
        }
        Update: {
          data_source?: string
          error_message?: string | null
          id?: string
          records_updated?: number | null
          refresh_completed_at?: string | null
          refresh_started_at?: string
          status?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          address: string
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          description: string | null
          id: string
          listing_date: string
          mls_number: string | null
          price: number
          sale_date: string | null
          square_feet: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          description?: string | null
          id?: string
          listing_date?: string
          mls_number?: string | null
          price: number
          sale_date?: string | null
          square_feet?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          description?: string | null
          id?: string
          listing_date?: string
          mls_number?: string | null
          price?: number
          sale_date?: string | null
          square_feet?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      market_data: {
        Row: {
          active_listings: number | null
          city: string
          created_at: string
          data_source: string
          days_on_market: number | null
          id: string
          inventory_months: number | null
          median_home_price: number | null
          price_change_percent: number | null
          price_per_sqft: number | null
          sales_volume: number | null
          state: string
          updated_at: string
        }
        Insert: {
          active_listings?: number | null
          city: string
          created_at?: string
          data_source: string
          days_on_market?: number | null
          id?: string
          inventory_months?: number | null
          median_home_price?: number | null
          price_change_percent?: number | null
          price_per_sqft?: number | null
          sales_volume?: number | null
          state: string
          updated_at?: string
        }
        Update: {
          active_listings?: number | null
          city?: string
          created_at?: string
          data_source?: string
          days_on_market?: number | null
          id?: string
          inventory_months?: number | null
          median_home_price?: number | null
          price_change_percent?: number | null
          price_per_sqft?: number | null
          sales_volume?: number | null
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          role: string | null
          subscription_active: boolean | null
          subscription_end_date: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: string | null
          subscription_active?: boolean | null
          subscription_end_date?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: string | null
          subscription_active?: boolean | null
          subscription_end_date?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_change_requests: {
        Row: {
          billing_cycle: string | null
          created_at: string
          current_plan: string
          id: string
          processed_at: string | null
          requested_plan: string
          status: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string
          current_plan: string
          id?: string
          processed_at?: string | null
          requested_plan: string
          status?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string
          current_plan?: string
          id?: string
          processed_at?: string | null
          requested_plan?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          ai_features: boolean | null
          created_at: string
          description: string | null
          display_name: string
          features: Json | null
          id: string
          max_buyers: number | null
          max_listings: number | null
          max_tasks: number | null
          name: string
          price_monthly: number
          price_yearly: number | null
          priority_support: boolean | null
          updated_at: string
        }
        Insert: {
          ai_features?: boolean | null
          created_at?: string
          description?: string | null
          display_name: string
          features?: Json | null
          id?: string
          max_buyers?: number | null
          max_listings?: number | null
          max_tasks?: number | null
          name: string
          price_monthly?: number
          price_yearly?: number | null
          priority_support?: boolean | null
          updated_at?: string
        }
        Update: {
          ai_features?: boolean | null
          created_at?: string
          description?: string | null
          display_name?: string
          features?: Json | null
          id?: string
          max_buyers?: number | null
          max_listings?: number | null
          max_tasks?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          priority_support?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          listing_id: string | null
          priority: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          listing_id?: string | null
          priority?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          listing_id?: string | null
          priority?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          business_name: string | null
          category: string
          created_at: string
          email: string | null
          id: string
          is_preferred: boolean | null
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          business_name?: string | null
          category: string
          created_at?: string
          email?: string | null
          id?: string
          is_preferred?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string | null
          category?: string
          created_at?: string
          email?: string | null
          id?: string
          is_preferred?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      past_clients: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          last_transaction_date: string | null
          name: string | null
          notes: string | null
          phone: string | null
          status: string | null
          total_commission: number | null
          total_transactions: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_plan_limits: {
        Args: { user_id: string }
        Returns: Json
      }
      log_security_event: {
        Args: { event_type: string; event_data?: Json; target_user_id?: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          body: string | null
          campaign_id: string | null
          created_at: string
          cta: string | null
          headline: string
          id: string
          image_color: string | null
          status: string
          target_url: string | null
        }
        Insert: {
          body?: string | null
          campaign_id?: string | null
          created_at?: string
          cta?: string | null
          headline: string
          id?: string
          image_color?: string | null
          status?: string
          target_url?: string | null
        }
        Update: {
          body?: string | null
          campaign_id?: string | null
          created_at?: string
          cta?: string | null
          headline?: string
          id?: string
          image_color?: string | null
          status?: string
          target_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          balance_usd: number
          created_at: string
          id: string
          payout_details: Json | null
          payout_method: string | null
          referral_code: string
          total_clicks: number
          total_sales: number
          total_signups: number
          user_id: string
        }
        Insert: {
          balance_usd?: number
          created_at?: string
          id?: string
          payout_details?: Json | null
          payout_method?: string | null
          referral_code: string
          total_clicks?: number
          total_sales?: number
          total_signups?: number
          user_id: string
        }
        Update: {
          balance_usd?: number
          created_at?: string
          id?: string
          payout_details?: Json | null
          payout_method?: string | null
          referral_code?: string
          total_clicks?: number
          total_sales?: number
          total_signups?: number
          user_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          body: string
          cover_color: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          seo_keywords: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          cover_color?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          seo_keywords?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          cover_color?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          seo_keywords?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          audience: string | null
          budget_usd: number | null
          channel: string
          created_at: string
          created_by: string | null
          email_html: string | null
          end_at: string | null
          id: string
          last_sent_at: string | null
          name: string
          notes: string | null
          sent_count: number
          start_at: string | null
          status: string
          subject: string | null
        }
        Insert: {
          audience?: string | null
          budget_usd?: number | null
          channel: string
          created_at?: string
          created_by?: string | null
          email_html?: string | null
          end_at?: string | null
          id?: string
          last_sent_at?: string | null
          name: string
          notes?: string | null
          sent_count?: number
          start_at?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          audience?: string | null
          budget_usd?: number | null
          channel?: string
          created_at?: string
          created_by?: string | null
          email_html?: string | null
          end_at?: string | null
          id?: string
          last_sent_at?: string | null
          name?: string
          notes?: string | null
          sent_count?: number
          start_at?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          country: string | null
          created_at: string
          email: string
          id: string
          lottery_slug: string | null
          message: string | null
          name: string | null
          source: string | null
          status: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          email: string
          id?: string
          lottery_slug?: string | null
          message?: string | null
          name?: string | null
          source?: string | null
          status?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          lottery_slug?: string | null
          message?: string | null
          name?: string | null
          source?: string | null
          status?: string
        }
        Relationships: []
      }
      lotteries: {
        Row: {
          accent_color: string
          country: string
          created_at: string
          currency: string
          current_jackpot_usd: number
          description: string | null
          draw_days: string
          id: string
          is_active: boolean
          name: string
          next_draw_at: string | null
          region: string
          rules: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          accent_color?: string
          country: string
          created_at?: string
          currency?: string
          current_jackpot_usd?: number
          description?: string | null
          draw_days: string
          id?: string
          is_active?: boolean
          name: string
          next_draw_at?: string | null
          region: string
          rules?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          accent_color?: string
          country?: string
          created_at?: string
          currency?: string
          current_jackpot_usd?: number
          description?: string | null
          draw_days?: string
          id?: string
          is_active?: boolean
          name?: string
          next_draw_at?: string | null
          region?: string
          rules?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      lottery_results: {
        Row: {
          bonus_numbers: number[]
          created_at: string
          draw_date: string
          id: string
          jackpot_usd: number
          lottery_id: string
          numbers: number[]
          winners_count: number
        }
        Insert: {
          bonus_numbers?: number[]
          created_at?: string
          draw_date: string
          id?: string
          jackpot_usd?: number
          lottery_id: string
          numbers?: number[]
          winners_count?: number
        }
        Update: {
          bonus_numbers?: number[]
          created_at?: string
          draw_date?: string
          id?: string
          jackpot_usd?: number
          lottery_id?: string
          numbers?: number[]
          winners_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "lottery_results_lottery_id_fkey"
            columns: ["lottery_id"]
            isOneToOne: false
            referencedRelation: "lotteries"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_intents: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          kind: string
          metadata: Json
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          kind: string
          metadata?: Json
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referral_clicks: {
        Row: {
          affiliate_id: string
          country: string | null
          created_at: string
          id: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          affiliate_id: string
          country?: string | null
          created_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          affiliate_id?: string
          country?: string | null
          created_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_clicks_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          bonus_numbers: number[]
          created_at: string
          draw_date: string | null
          id: string
          lottery_id: string
          numbers: number[]
          payment_source: string
          price_cents: number
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bonus_numbers?: number[]
          created_at?: string
          draw_date?: string | null
          id?: string
          lottery_id: string
          numbers?: number[]
          payment_source: string
          price_cents: number
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bonus_numbers?: number[]
          created_at?: string
          draw_date?: string | null
          id?: string
          lottery_id?: string
          numbers?: number[]
          payment_source?: string
          price_cents?: number
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_lottery_id_fkey"
            columns: ["lottery_id"]
            isOneToOne: false
            referencedRelation: "lotteries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount_cents: number
          balance_after_cents: number
          created_at: string
          description: string | null
          id: string
          kind: string
          reference_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          balance_after_cents: number
          created_at?: string
          description?: string | null
          id?: string
          kind: string
          reference_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          balance_after_cents?: number
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          reference_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance_cents: number
          created_at: string
          currency: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_cents?: number
          created_at?: string
          currency?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_cents?: number
          created_at?: string
          currency?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      credit_wallet: {
        Args: {
          _amount_cents: number
          _description: string
          _reference: string
          _user_id: string
        }
        Returns: number
      }
      debit_wallet: {
        Args: {
          _amount_cents: number
          _description: string
          _reference: string
          _user_id: string
        }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "affiliate" | "user"
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
    Enums: {
      app_role: ["admin", "affiliate", "user"],
    },
  },
} as const

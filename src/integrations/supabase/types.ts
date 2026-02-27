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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          description: string
          entity_id: string | null
          entity_type: string
          id: string
          new_values: Json | null
          old_values: Json | null
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          description: string
          entity_id?: string | null
          entity_type: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
        }
        Relationships: []
      }
      adviser_fees: {
        Row: {
          adviser_name: string
          client_id: string
          created_at: string
          effective_from: string | null
          effective_to: string | null
          fee_type: string
          frequency: string
          id: string
          notes: string | null
          rate: number
          status: string
          updated_at: string
          wrapper: string
        }
        Insert: {
          adviser_name: string
          client_id: string
          created_at?: string
          effective_from?: string | null
          effective_to?: string | null
          fee_type?: string
          frequency?: string
          id?: string
          notes?: string | null
          rate?: number
          status?: string
          updated_at?: string
          wrapper?: string
        }
        Update: {
          adviser_name?: string
          client_id?: string
          created_at?: string
          effective_from?: string | null
          effective_to?: string | null
          fee_type?: string
          frequency?: string
          id?: string
          notes?: string | null
          rate?: number
          status?: string
          updated_at?: string
          wrapper?: string
        }
        Relationships: [
          {
            foreignKeyName: "adviser_fees_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_file_entries: {
        Row: {
          amount: number
          bank_file_id: string
          created_at: string
          description: string | null
          entry_date: string
          id: string
          matched_account_id: string | null
          matched_client_id: string | null
          reference: string | null
          status: string
          transaction_type: string | null
        }
        Insert: {
          amount: number
          bank_file_id: string
          created_at?: string
          description?: string | null
          entry_date: string
          id?: string
          matched_account_id?: string | null
          matched_client_id?: string | null
          reference?: string | null
          status?: string
          transaction_type?: string | null
        }
        Update: {
          amount?: number
          bank_file_id?: string
          created_at?: string
          description?: string | null
          entry_date?: string
          id?: string
          matched_account_id?: string | null
          matched_client_id?: string | null
          reference?: string | null
          status?: string
          transaction_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_file_entries_bank_file_id_fkey"
            columns: ["bank_file_id"]
            isOneToOne: false
            referencedRelation: "bank_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_file_entries_matched_account_id_fkey"
            columns: ["matched_account_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_file_entries_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_files: {
        Row: {
          created_at: string
          filename: string
          id: string
          matched_count: number | null
          status: string
          total_amount: number | null
          total_entries: number | null
          unmatched_count: number | null
          upload_date: string
        }
        Insert: {
          created_at?: string
          filename: string
          id?: string
          matched_count?: number | null
          status?: string
          total_amount?: number | null
          total_entries?: number | null
          unmatched_count?: number | null
          upload_date?: string
        }
        Update: {
          created_at?: string
          filename?: string
          id?: string
          matched_count?: number | null
          status?: string
          total_amount?: number | null
          total_entries?: number | null
          unmatched_count?: number | null
          upload_date?: string
        }
        Relationships: []
      }
      bce_events: {
        Row: {
          bce_type: string
          client_id: string
          created_at: string
          crystallised_amount: number
          event_date: string
          id: string
          lta_percentage: number | null
          notes: string | null
          tax_free_lump_sum: number | null
        }
        Insert: {
          bce_type: string
          client_id: string
          created_at?: string
          crystallised_amount?: number
          event_date?: string
          id?: string
          lta_percentage?: number | null
          notes?: string | null
          tax_free_lump_sum?: number | null
        }
        Update: {
          bce_type?: string
          client_id?: string
          created_at?: string
          crystallised_amount?: number
          event_date?: string
          id?: string
          lta_percentage?: number | null
          notes?: string | null
          tax_free_lump_sum?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bce_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaries: {
        Row: {
          allocation_pct: number
          client_id: string
          contact_details: string | null
          created_at: string
          date_of_birth: string | null
          id: string
          name: string
          notes: string | null
          relationship: string
          updated_at: string
        }
        Insert: {
          allocation_pct?: number
          client_id: string
          contact_details?: string | null
          created_at?: string
          date_of_birth?: string | null
          id?: string
          name: string
          notes?: string | null
          relationship: string
          updated_at?: string
        }
        Update: {
          allocation_pct?: number
          client_id?: string
          contact_details?: string | null
          created_at?: string
          date_of_birth?: string | null
          id?: string
          name?: string
          notes?: string | null
          relationship?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_accounts: {
        Row: {
          account_number: string | null
          account_type: string
          cash_balance: number | null
          client_id: string
          created_at: string
          id: string
          opened_date: string | null
          status: string
          total_value: number | null
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          account_type: string
          cash_balance?: number | null
          client_id: string
          created_at?: string
          id?: string
          opened_date?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          account_type?: string
          cash_balance?: number | null
          client_id?: string
          created_at?: string
          id?: string
          opened_date?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_accounts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          adviser: string | null
          annual_allowance_used: number
          city: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          employment_status: string | null
          first_name: string
          id: string
          last_name: string
          marital_status: string | null
          mpaa_triggered: boolean
          nationality: string | null
          ni_number: string | null
          notes: string | null
          phone: string | null
          postcode: string | null
          risk_profile: string | null
          status: string
          tax_residency: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          adviser?: string | null
          annual_allowance_used?: number
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          employment_status?: string | null
          first_name: string
          id?: string
          last_name: string
          marital_status?: string | null
          mpaa_triggered?: boolean
          nationality?: string | null
          ni_number?: string | null
          notes?: string | null
          phone?: string | null
          postcode?: string | null
          risk_profile?: string | null
          status?: string
          tax_residency?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          adviser?: string | null
          annual_allowance_used?: number
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          employment_status?: string | null
          first_name?: string
          id?: string
          last_name?: string
          marital_status?: string | null
          mpaa_triggered?: boolean
          nationality?: string | null
          ni_number?: string | null
          notes?: string | null
          phone?: string | null
          postcode?: string | null
          risk_profile?: string | null
          status?: string
          tax_residency?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fee_schedules: {
        Row: {
          active: boolean
          created_at: string
          frequency: string
          id: string
          max_fee: number | null
          min_fee: number | null
          name: string
          rate: number
          type: string
          updated_at: string
          wrapper: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          frequency?: string
          id?: string
          max_fee?: number | null
          min_fee?: number | null
          name: string
          rate?: number
          type?: string
          updated_at?: string
          wrapper?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          frequency?: string
          id?: string
          max_fee?: number | null
          min_fee?: number | null
          name?: string
          rate?: number
          type?: string
          updated_at?: string
          wrapper?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          account_id: string
          allocation_pct: number | null
          client_id: string
          cost_basis: number | null
          created_at: string
          current_value: number | null
          fund_name: string
          id: string
          isin: string | null
          sedol: string | null
          status: string | null
          unit_price: number | null
          units: number | null
          updated_at: string
        }
        Insert: {
          account_id: string
          allocation_pct?: number | null
          client_id: string
          cost_basis?: number | null
          created_at?: string
          current_value?: number | null
          fund_name: string
          id?: string
          isin?: string | null
          sedol?: string | null
          status?: string | null
          unit_price?: number | null
          units?: number | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          allocation_pct?: number | null
          client_id?: string
          cost_basis?: number | null
          created_at?: string
          current_value?: number | null
          fund_name?: string
          id?: string
          isin?: string | null
          sedol?: string | null
          status?: string | null
          unit_price?: number | null
          units?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_orders: {
        Row: {
          account_id: string | null
          account_type: string | null
          client_id: string | null
          client_name: string | null
          created_at: string
          id: string
          instrument: string
          price: number
          quantity: number
          settlement_date: string | null
          side: string
          status: string
          updated_at: string
          value: number
        }
        Insert: {
          account_id?: string | null
          account_type?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          id?: string
          instrument: string
          price?: number
          quantity?: number
          settlement_date?: string | null
          side?: string
          status?: string
          updated_at?: string
          value?: number
        }
        Update: {
          account_id?: string | null
          account_type?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          id?: string
          instrument?: string
          price?: number
          quantity?: number
          settlement_date?: string | null
          side?: string
          status?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "trade_orders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          client_id: string
          created_at: string
          description: string | null
          effective_date: string | null
          id: string
          notes: string | null
          reference: string | null
          running_balance: number | null
          status: string
          tax_relief_amount: number | null
          tax_year: string | null
          transaction_type: string
          updated_at: string
        }
        Insert: {
          account_id: string
          amount: number
          client_id: string
          created_at?: string
          description?: string | null
          effective_date?: string | null
          id?: string
          notes?: string | null
          reference?: string | null
          running_balance?: number | null
          status?: string
          tax_relief_amount?: number | null
          tax_year?: string | null
          transaction_type: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount?: number
          client_id?: string
          created_at?: string
          description?: string | null
          effective_date?: string | null
          id?: string
          notes?: string | null
          reference?: string | null
          running_balance?: number | null
          status?: string
          tax_relief_amount?: number | null
          tax_year?: string | null
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

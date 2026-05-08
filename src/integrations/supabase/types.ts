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
      client_documents: {
        Row: {
          client_id: string
          created_at: string
          document_type: string
          filename: string
          id: string
          mime_type: string | null
          notes: string | null
          size_bytes: number | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          document_type?: string
          filename: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          size_bytes?: number | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          document_type?: string
          filename?: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          size_bytes?: number | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: []
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
      consent_records: {
        Row: {
          client_id: string
          consent_type: string
          created_at: string
          granted: boolean
          granted_at: string | null
          id: string
          notes: string | null
          updated_at: string
          withdrawn_at: string | null
        }
        Insert: {
          client_id: string
          consent_type: string
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
          withdrawn_at?: string | null
        }
        Update: {
          client_id?: string
          consent_type?: string
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      contributions: {
        Row: {
          account_id: string
          client_id: string
          contribution_type: string
          created_at: string
          effective_date: string
          gross_amount: number
          id: string
          net_amount: number
          notes: string | null
          reference: string | null
          relief_method: string
          status: string
          tax_relief: number
          tax_year: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          client_id: string
          contribution_type?: string
          created_at?: string
          effective_date?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          notes?: string | null
          reference?: string | null
          relief_method?: string
          status?: string
          tax_relief?: number
          tax_year?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          client_id?: string
          contribution_type?: string
          created_at?: string
          effective_date?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          notes?: string | null
          reference?: string | null
          relief_method?: string
          status?: string
          tax_relief?: number
          tax_year?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      crystallisation_segments: {
        Row: {
          account_id: string
          bce_event_id: string
          client_id: string
          created_at: string
          crystallised_amount: number
          drawdown_type: string
          id: string
          pcls_amount: number
          residual_fund: number
          segment_type: string
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          bce_event_id: string
          client_id: string
          created_at?: string
          crystallised_amount?: number
          drawdown_type?: string
          id?: string
          pcls_amount?: number
          residual_fund?: number
          segment_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          bce_event_id?: string
          client_id?: string
          created_at?: string
          crystallised_amount?: number
          drawdown_type?: string
          id?: string
          pcls_amount?: number
          residual_fund?: number
          segment_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crystallisation_segments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crystallisation_segments_bce_event_id_fkey"
            columns: ["bce_event_id"]
            isOneToOne: false
            referencedRelation: "bce_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crystallisation_segments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      death_benefit_payments: {
        Row: {
          beneficiary_id: string | null
          beneficiary_name: string
          client_id: string
          created_at: string
          death_claim_id: string
          gross_amount: number
          id: string
          net_amount: number
          notes: string | null
          paid_date: string | null
          payment_type: string
          status: string
          tax_amount: number
          updated_at: string
        }
        Insert: {
          beneficiary_id?: string | null
          beneficiary_name: string
          client_id: string
          created_at?: string
          death_claim_id: string
          gross_amount?: number
          id?: string
          net_amount?: number
          notes?: string | null
          paid_date?: string | null
          payment_type?: string
          status?: string
          tax_amount?: number
          updated_at?: string
        }
        Update: {
          beneficiary_id?: string | null
          beneficiary_name?: string
          client_id?: string
          created_at?: string
          death_claim_id?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          notes?: string | null
          paid_date?: string | null
          payment_type?: string
          status?: string
          tax_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      death_claims: {
        Row: {
          cause_of_death: string | null
          client_id: string
          created_at: string
          date_of_death: string
          id: string
          notes: string | null
          notified_date: string
          pre_75: boolean
          status: string
          total_pot_value: number
          updated_at: string
        }
        Insert: {
          cause_of_death?: string | null
          client_id: string
          created_at?: string
          date_of_death: string
          id?: string
          notes?: string | null
          notified_date?: string
          pre_75?: boolean
          status?: string
          total_pot_value?: number
          updated_at?: string
        }
        Update: {
          cause_of_death?: string | null
          client_id?: string
          created_at?: string
          date_of_death?: string
          id?: string
          notes?: string | null
          notified_date?: string
          pre_75?: boolean
          status?: string
          total_pot_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      fee_charges: {
        Row: {
          account_id: string
          amount: number
          basis: string
          charged_date: string
          client_id: string
          created_at: string
          description: string | null
          fee_type: string
          id: string
          period_end: string | null
          period_start: string | null
          rate: number
          reference: string | null
          status: string
          total: number
          updated_at: string
          vat: number
        }
        Insert: {
          account_id: string
          amount?: number
          basis?: string
          charged_date?: string
          client_id: string
          created_at?: string
          description?: string | null
          fee_type?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          rate?: number
          reference?: string | null
          status?: string
          total?: number
          updated_at?: string
          vat?: number
        }
        Update: {
          account_id?: string
          amount?: number
          basis?: string
          charged_date?: string
          client_id?: string
          created_at?: string
          description?: string | null
          fee_type?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          rate?: number
          reference?: string | null
          status?: string
          total?: number
          updated_at?: string
          vat?: number
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
      integration_log: {
        Row: {
          created_at: string
          duration_ms: number | null
          endpoint: string
          error_message: string | null
          id: string
          provider: string
          request_payload: Json | null
          response_payload: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          endpoint: string
          error_message?: string | null
          id?: string
          provider: string
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          endpoint?: string
          error_message?: string | null
          id?: string
          provider?: string
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string
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
      kyc_records: {
        Row: {
          address_check: boolean | null
          checked_at: string | null
          client_id: string
          created_at: string
          id: string
          identity_check: boolean | null
          pep_sanctions_check: boolean | null
          provider: string
          raw_result: Json | null
          reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address_check?: boolean | null
          checked_at?: string | null
          client_id: string
          created_at?: string
          id?: string
          identity_check?: boolean | null
          pep_sanctions_check?: boolean | null
          provider?: string
          raw_result?: Json | null
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address_check?: boolean | null
          checked_at?: string | null
          client_id?: string
          created_at?: string
          id?: string
          identity_check?: boolean | null
          pep_sanctions_check?: boolean | null
          provider?: string
          raw_result?: Json | null
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      market_prices: {
        Row: {
          created_at: string
          currency: string
          fund_name: string | null
          id: string
          isin: string | null
          price: number
          price_date: string
          sedol: string | null
          source: string
          symbol: string
        }
        Insert: {
          created_at?: string
          currency?: string
          fund_name?: string | null
          id?: string
          isin?: string | null
          price?: number
          price_date?: string
          sedol?: string | null
          source?: string
          symbol: string
        }
        Update: {
          created_at?: string
          currency?: string
          fund_name?: string | null
          id?: string
          isin?: string | null
          price?: number
          price_date?: string
          sedol?: string | null
          source?: string
          symbol?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          client_id: string | null
          created_at: string
          display_name: string | null
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      statements: {
        Row: {
          account_id: string | null
          client_id: string
          closing_value: number
          contributions_total: number
          created_at: string
          fees_total: number
          generated_date: string
          growth: number
          id: string
          opening_value: number
          payload: Json | null
          period_end: string
          period_start: string
          statement_type: string
          status: string
          withdrawals_total: number
        }
        Insert: {
          account_id?: string | null
          client_id: string
          closing_value?: number
          contributions_total?: number
          created_at?: string
          fees_total?: number
          generated_date?: string
          growth?: number
          id?: string
          opening_value?: number
          payload?: Json | null
          period_end: string
          period_start: string
          statement_type?: string
          status?: string
          withdrawals_total?: number
        }
        Update: {
          account_id?: string | null
          client_id?: string
          closing_value?: number
          contributions_total?: number
          created_at?: string
          fees_total?: number
          generated_date?: string
          growth?: number
          id?: string
          opening_value?: number
          payload?: Json | null
          period_end?: string
          period_start?: string
          statement_type?: string
          status?: string
          withdrawals_total?: number
        }
        Relationships: []
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
      transfers_in: {
        Row: {
          account_id: string | null
          ceding_provider: string | null
          ceding_scheme_name: string
          ceding_scheme_ref: string | null
          client_id: string
          completed_date: string | null
          contains_protected_tax_free_cash: boolean
          contains_safeguarded_benefits: boolean
          created_at: string
          estimated_value: number
          id: string
          notes: string | null
          origo_used: boolean
          protected_tax_free_cash_pct: number | null
          received_value: number | null
          request_date: string
          status: string
          transfer_type: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          ceding_provider?: string | null
          ceding_scheme_name: string
          ceding_scheme_ref?: string | null
          client_id: string
          completed_date?: string | null
          contains_protected_tax_free_cash?: boolean
          contains_safeguarded_benefits?: boolean
          created_at?: string
          estimated_value?: number
          id?: string
          notes?: string | null
          origo_used?: boolean
          protected_tax_free_cash_pct?: number | null
          received_value?: number | null
          request_date?: string
          status?: string
          transfer_type?: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          ceding_provider?: string | null
          ceding_scheme_name?: string
          ceding_scheme_ref?: string | null
          client_id?: string
          completed_date?: string | null
          contains_protected_tax_free_cash?: boolean
          contains_safeguarded_benefits?: boolean
          created_at?: string
          estimated_value?: number
          id?: string
          notes?: string | null
          origo_used?: boolean
          protected_tax_free_cash_pct?: number | null
          received_value?: number | null
          request_date?: string
          status?: string
          transfer_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      valuations: {
        Row: {
          account_id: string
          cash_balance: number
          client_id: string
          created_at: string
          id: string
          investments_value: number
          notes: string | null
          source: string
          total_value: number
          valuation_date: string
        }
        Insert: {
          account_id: string
          cash_balance?: number
          client_id: string
          created_at?: string
          id?: string
          investments_value?: number
          notes?: string | null
          source?: string
          total_value?: number
          valuation_date?: string
        }
        Update: {
          account_id?: string
          cash_balance?: number
          client_id?: string
          created_at?: string
          id?: string
          investments_value?: number
          notes?: string | null
          source?: string
          total_value?: number
          valuation_date?: string
        }
        Relationships: []
      }
      workflow_definitions: {
        Row: {
          action: string
          active: boolean
          assign_to: string
          created_at: string
          days_before_due: number
          frequency: string
          id: string
          last_triggered: string | null
          name: string
          times_triggered: number
          trigger: string
          updated_at: string
        }
        Insert: {
          action: string
          active?: boolean
          assign_to?: string
          created_at?: string
          days_before_due?: number
          frequency?: string
          id?: string
          last_triggered?: string | null
          name: string
          times_triggered?: number
          trigger: string
          updated_at?: string
        }
        Update: {
          action?: string
          active?: boolean
          assign_to?: string
          created_at?: string
          days_before_due?: number
          frequency?: string
          id?: string
          last_triggered?: string | null
          name?: string
          times_triggered?: number
          trigger?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      invoke_edge_function: {
        Args: { body?: Json; fn_name: string }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "adviser" | "client" | "demo"
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
      app_role: ["admin", "adviser", "client", "demo"],
    },
  },
} as const

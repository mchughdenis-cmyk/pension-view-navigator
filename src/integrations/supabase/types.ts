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
      aa_carry_forward: {
        Row: {
          annual_allowance: number
          carried_forward: number
          client_id: string
          created_at: string
          id: string
          notes: string | null
          tax_year: string
          used_this_year: number
        }
        Insert: {
          annual_allowance?: number
          carried_forward?: number
          client_id: string
          created_at?: string
          id?: string
          notes?: string | null
          tax_year: string
          used_this_year?: number
        }
        Update: {
          annual_allowance?: number
          carried_forward?: number
          client_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          tax_year?: string
          used_this_year?: number
        }
        Relationships: []
      }
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
      advisers: {
        Row: {
          created_at: string
          email: string | null
          fca_individual_ref: string | null
          firm_id: string | null
          id: string
          name: string
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          fca_individual_ref?: string | null
          firm_id?: string | null
          id?: string
          name: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          fca_individual_ref?: string | null
          firm_id?: string | null
          id?: string
          name?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advisers_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisers_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "mi_aua_by_firm"
            referencedColumns: ["firm_id"]
          },
        ]
      }
      agency_assignments: {
        Row: {
          adviser_id: string
          assigned_from: string
          assigned_to: string | null
          client_id: string
          created_at: string
          firm_id: string
          id: string
          is_primary: boolean
        }
        Insert: {
          adviser_id: string
          assigned_from?: string
          assigned_to?: string | null
          client_id: string
          created_at?: string
          firm_id: string
          id?: string
          is_primary?: boolean
        }
        Update: {
          adviser_id?: string
          assigned_from?: string
          assigned_to?: string | null
          client_id?: string
          created_at?: string
          firm_id?: string
          id?: string
          is_primary?: boolean
        }
        Relationships: []
      }
      agency_transfers: {
        Row: {
          client_id: string
          created_at: string
          effective_date: string
          from_firm_id: string | null
          id: string
          notes: string | null
          status: string
          to_firm_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          effective_date?: string
          from_firm_id?: string | null
          id?: string
          notes?: string | null
          status?: string
          to_firm_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          effective_date?: string
          from_firm_id?: string | null
          id?: string
          notes?: string | null
          status?: string
          to_firm_id?: string
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          acted_on: boolean
          client_id: string | null
          confidence: number
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          insight_type: string
          raw: Json | null
          severity: string
          summary: string
          title: string
        }
        Insert: {
          acted_on?: boolean
          client_id?: string | null
          confidence?: number
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          insight_type: string
          raw?: Json | null
          severity?: string
          summary: string
          title: string
        }
        Update: {
          acted_on?: boolean
          client_id?: string | null
          confidence?: number
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          insight_type?: string
          raw?: Json | null
          severity?: string
          summary?: string
          title?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          id: string
          key_prefix: string
          last_used_at: string | null
          name: string
          scopes: string[]
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          scopes?: string[]
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          scopes?: string[]
          status?: string
        }
        Relationships: []
      }
      atr_assessments: {
        Row: {
          assessed_at: string
          capacity_for_loss: string | null
          category: string
          client_id: string
          id: string
          questionnaire: Json | null
          score: number
        }
        Insert: {
          assessed_at?: string
          capacity_for_loss?: string | null
          category: string
          client_id: string
          id?: string
          questionnaire?: Json | null
          score: number
        }
        Update: {
          assessed_at?: string
          capacity_for_loss?: string | null
          category?: string
          client_id?: string
          id?: string
          questionnaire?: Json | null
          score?: number
        }
        Relationships: []
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
      cash_forecasts: {
        Row: {
          client_id: string | null
          created_at: string
          expected_inflows: number
          expected_outflows: number
          forecast_date: string
          id: string
          net: number | null
          notes: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          expected_inflows?: number
          expected_outflows?: number
          forecast_date: string
          id?: string
          net?: number | null
          notes?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          expected_inflows?: number
          expected_outflows?: number
          forecast_date?: string
          id?: string
          net?: number | null
          notes?: string | null
        }
        Relationships: []
      }
      cash_sweeps: {
        Row: {
          account_id: string
          amount: number
          client_id: string
          created_at: string
          from_account: string
          id: string
          status: string
          sweep_date: string
          to_account: string
        }
        Insert: {
          account_id: string
          amount?: number
          client_id: string
          created_at?: string
          from_account: string
          id?: string
          status?: string
          sweep_date?: string
          to_account: string
        }
        Update: {
          account_id?: string
          amount?: number
          client_id?: string
          created_at?: string
          from_account?: string
          id?: string
          status?: string
          sweep_date?: string
          to_account?: string
        }
        Relationships: []
      }
      cass_breaches: {
        Row: {
          amount: number | null
          breach_date: string
          breach_type: string
          created_at: string
          description: string
          id: string
          recon_id: string | null
          resolved_at: string | null
          severity: string
          status: string
        }
        Insert: {
          amount?: number | null
          breach_date?: string
          breach_type: string
          created_at?: string
          description: string
          id?: string
          recon_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
        }
        Update: {
          amount?: number | null
          breach_date?: string
          breach_type?: string
          created_at?: string
          description?: string
          id?: string
          recon_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
        }
        Relationships: []
      }
      cass_reconciliations: {
        Row: {
          created_at: string
          external_balance: number
          id: string
          internal_balance: number
          performed_by: string | null
          recon_date: string
          recon_type: string
          resolution_notes: string | null
          reviewed_by: string | null
          signed_off_at: string | null
          status: string
          unmatched_count: number
          variance: number | null
        }
        Insert: {
          created_at?: string
          external_balance?: number
          id?: string
          internal_balance?: number
          performed_by?: string | null
          recon_date?: string
          recon_type?: string
          resolution_notes?: string | null
          reviewed_by?: string | null
          signed_off_at?: string | null
          status?: string
          unmatched_count?: number
          variance?: number | null
        }
        Update: {
          created_at?: string
          external_balance?: number
          id?: string
          internal_balance?: number
          performed_by?: string | null
          recon_date?: string
          recon_type?: string
          resolution_notes?: string | null
          reviewed_by?: string | null
          signed_off_at?: string | null
          status?: string
          unmatched_count?: number
          variance?: number | null
        }
        Relationships: []
      }
      cgt_disposals: {
        Row: {
          account_id: string
          client_id: string
          cost_basis: number
          created_at: string
          disposal_date: string
          gain_loss: number | null
          id: string
          matching_rule: string
          proceeds: number
          symbol: string
          tax_year: string
          units: number
        }
        Insert: {
          account_id: string
          client_id: string
          cost_basis?: number
          created_at?: string
          disposal_date: string
          gain_loss?: number | null
          id?: string
          matching_rule?: string
          proceeds?: number
          symbol: string
          tax_year?: string
          units?: number
        }
        Update: {
          account_id?: string
          client_id?: string
          cost_basis?: number
          created_at?: string
          disposal_date?: string
          gain_loss?: number | null
          id?: string
          matching_rule?: string
          proceeds?: number
          symbol?: string
          tax_year?: string
          units?: number
        }
        Relationships: []
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
      consumer_duty_reviews: {
        Row: {
          client_id: string
          created_at: string
          fair_value_score: number
          id: string
          notes: string | null
          outcomes_score: number
          review_date: string
          reviewer: string | null
          vulnerability_flag: boolean
        }
        Insert: {
          client_id: string
          created_at?: string
          fair_value_score?: number
          id?: string
          notes?: string | null
          outcomes_score?: number
          review_date?: string
          reviewer?: string | null
          vulnerability_flag?: boolean
        }
        Update: {
          client_id?: string
          created_at?: string
          fair_value_score?: number
          id?: string
          notes?: string | null
          outcomes_score?: number
          review_date?: string
          reviewer?: string | null
          vulnerability_flag?: boolean
        }
        Relationships: []
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
      corporate_action_elections: {
        Row: {
          account_id: string
          cash_amount: number | null
          client_id: string
          corporate_action_id: string
          created_at: string
          elected_at: string | null
          election: string
          id: string
          settled_at: string | null
          status: string
          units_held: number
          units_received: number | null
        }
        Insert: {
          account_id: string
          cash_amount?: number | null
          client_id: string
          corporate_action_id: string
          created_at?: string
          elected_at?: string | null
          election?: string
          id?: string
          settled_at?: string | null
          status?: string
          units_held?: number
          units_received?: number | null
        }
        Update: {
          account_id?: string
          cash_amount?: number | null
          client_id?: string
          corporate_action_id?: string
          created_at?: string
          elected_at?: string | null
          election?: string
          id?: string
          settled_at?: string | null
          status?: string
          units_held?: number
          units_received?: number | null
        }
        Relationships: []
      }
      corporate_actions: {
        Row: {
          action_type: string
          created_at: string
          currency: string | null
          description: string | null
          election_deadline: string | null
          ex_date: string | null
          id: string
          isin: string | null
          payment_date: string | null
          rate: number | null
          ratio: string | null
          record_date: string | null
          status: string
          symbol: string
          voluntary: boolean
        }
        Insert: {
          action_type: string
          created_at?: string
          currency?: string | null
          description?: string | null
          election_deadline?: string | null
          ex_date?: string | null
          id?: string
          isin?: string | null
          payment_date?: string | null
          rate?: number | null
          ratio?: string | null
          record_date?: string | null
          status?: string
          symbol: string
          voluntary?: boolean
        }
        Update: {
          action_type?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          election_deadline?: string | null
          ex_date?: string | null
          id?: string
          isin?: string | null
          payment_date?: string | null
          rate?: number | null
          ratio?: string | null
          record_date?: string | null
          status?: string
          symbol?: string
          voluntary?: boolean
        }
        Relationships: []
      }
      costs_charges: {
        Row: {
          adviser_charges: number
          client_id: string
          created_at: string
          disclosure_type: string
          fund_charges: number
          id: string
          pct_of_aua: number | null
          period_end: string
          period_start: string
          platform_charges: number
          total_charges: number | null
          transaction_costs: number
        }
        Insert: {
          adviser_charges?: number
          client_id: string
          created_at?: string
          disclosure_type?: string
          fund_charges?: number
          id?: string
          pct_of_aua?: number | null
          period_end: string
          period_start: string
          platform_charges?: number
          total_charges?: number | null
          transaction_costs?: number
        }
        Update: {
          adviser_charges?: number
          client_id?: string
          created_at?: string
          disclosure_type?: string
          fund_charges?: number
          id?: string
          pct_of_aua?: number | null
          period_end?: string
          period_start?: string
          platform_charges?: number
          total_charges?: number | null
          transaction_costs?: number
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
      dd_mandates: {
        Row: {
          account_id: string
          account_number: string
          amount: number
          bank_name: string
          client_id: string
          created_at: string
          frequency: string
          id: string
          next_collection: string | null
          sort_code: string
          status: string
        }
        Insert: {
          account_id: string
          account_number: string
          amount?: number
          bank_name: string
          client_id: string
          created_at?: string
          frequency?: string
          id?: string
          next_collection?: string | null
          sort_code: string
          status?: string
        }
        Update: {
          account_id?: string
          account_number?: string
          amount?: number
          bank_name?: string
          client_id?: string
          created_at?: string
          frequency?: string
          id?: string
          next_collection?: string | null
          sort_code?: string
          status?: string
        }
        Relationships: []
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
      document_versions: {
        Row: {
          created_at: string
          document_id: string
          id: string
          storage_path: string
          uploaded_by: string | null
          version: number
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          storage_path: string
          uploaded_by?: string | null
          version?: number
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          storage_path?: string
          uploaded_by?: string | null
          version?: number
        }
        Relationships: []
      }
      esg_fund_data: {
        Row: {
          as_of_date: string
          carbon_intensity: number | null
          controversies: number
          created_at: string
          esg_score: number | null
          fossil_fuel_pct: number | null
          fund_name: string | null
          id: string
          isin: string | null
          sfdr_article: string | null
          source: string
          symbol: string
        }
        Insert: {
          as_of_date?: string
          carbon_intensity?: number | null
          controversies?: number
          created_at?: string
          esg_score?: number | null
          fossil_fuel_pct?: number | null
          fund_name?: string | null
          id?: string
          isin?: string | null
          sfdr_article?: string | null
          source?: string
          symbol: string
        }
        Update: {
          as_of_date?: string
          carbon_intensity?: number | null
          controversies?: number
          created_at?: string
          esg_score?: number | null
          fossil_fuel_pct?: number | null
          fund_name?: string | null
          id?: string
          isin?: string | null
          sfdr_article?: string | null
          source?: string
          symbol?: string
        }
        Relationships: []
      }
      esign_envelopes: {
        Row: {
          client_id: string
          created_at: string
          document_name: string
          envelope_ref: string | null
          id: string
          provider: string
          sent_at: string
          signed_at: string | null
          status: string
        }
        Insert: {
          client_id: string
          created_at?: string
          document_name: string
          envelope_ref?: string | null
          id?: string
          provider?: string
          sent_at?: string
          signed_at?: string | null
          status?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          document_name?: string
          envelope_ref?: string | null
          id?: string
          provider?: string
          sent_at?: string
          signed_at?: string | null
          status?: string
        }
        Relationships: []
      }
      fact_finds: {
        Row: {
          assets: Json | null
          client_id: string
          completed_at: string | null
          created_at: string
          dependants: number | null
          expenditure_annual: number | null
          id: string
          income_annual: number | null
          liabilities: Json | null
          objectives: string | null
        }
        Insert: {
          assets?: Json | null
          client_id: string
          completed_at?: string | null
          created_at?: string
          dependants?: number | null
          expenditure_annual?: number | null
          id?: string
          income_annual?: number | null
          liabilities?: Json | null
          objectives?: string | null
        }
        Update: {
          assets?: Json | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          dependants?: number | null
          expenditure_annual?: number | null
          id?: string
          income_annual?: number | null
          liabilities?: Json | null
          objectives?: string | null
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
      fee_splits: {
        Row: {
          adviser_id: string | null
          adviser_share_pct: number
          amount_adviser: number
          amount_firm: number
          created_at: string
          fee_charge_id: string | null
          firm_id: string
          firm_share_pct: number
          id: string
          period_end: string
          status: string
        }
        Insert: {
          adviser_id?: string | null
          adviser_share_pct?: number
          amount_adviser?: number
          amount_firm?: number
          created_at?: string
          fee_charge_id?: string | null
          firm_id: string
          firm_share_pct?: number
          id?: string
          period_end?: string
          status?: string
        }
        Update: {
          adviser_id?: string | null
          adviser_share_pct?: number
          amount_adviser?: number
          amount_firm?: number
          created_at?: string
          fee_charge_id?: string | null
          firm_id?: string
          firm_share_pct?: number
          id?: string
          period_end?: string
          status?: string
        }
        Relationships: []
      }
      firms: {
        Row: {
          address_line1: string | null
          city: string | null
          created_at: string
          default_adviser_fee_pct: number
          default_platform_fee_pct: number
          fca_ref: string | null
          id: string
          name: string
          network_id: string | null
          postcode: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          city?: string | null
          created_at?: string
          default_adviser_fee_pct?: number
          default_platform_fee_pct?: number
          fca_ref?: string | null
          id?: string
          name: string
          network_id?: string | null
          postcode?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          city?: string | null
          created_at?: string
          default_adviser_fee_pct?: number
          default_platform_fee_pct?: number
          fca_ref?: string | null
          id?: string
          name?: string
          network_id?: string | null
          postcode?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      four_eyes_approvals: {
        Row: {
          amount: number | null
          approved_at: string | null
          approved_by: string | null
          entity_id: string
          entity_type: string
          id: string
          notes: string | null
          requested_at: string
          requested_by: string
          status: string
        }
        Insert: {
          amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          entity_id: string
          entity_type: string
          id?: string
          notes?: string | null
          requested_at?: string
          requested_by: string
          status?: string
        }
        Update: {
          amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          notes?: string | null
          requested_at?: string
          requested_by?: string
          status?: string
        }
        Relationships: []
      }
      illustrations: {
        Row: {
          client_id: string
          contributions: number
          created_at: string
          fca_rate_high: number
          fca_rate_low: number
          fca_rate_mid: number
          growth_rate: number
          id: string
          inflation_rate: number
          projected_pot: number
          retirement_age: number
          scenario_name: string
        }
        Insert: {
          client_id: string
          contributions?: number
          created_at?: string
          fca_rate_high?: number
          fca_rate_low?: number
          fca_rate_mid?: number
          growth_rate?: number
          id?: string
          inflation_rate?: number
          projected_pot?: number
          retirement_age?: number
          scenario_name: string
        }
        Update: {
          client_id?: string
          contributions?: number
          created_at?: string
          fca_rate_high?: number
          fca_rate_low?: number
          fca_rate_mid?: number
          growth_rate?: number
          id?: string
          inflation_rate?: number
          projected_pot?: number
          retirement_age?: number
          scenario_name?: string
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
      interest_accruals: {
        Row: {
          account_id: string
          accrual_date: string
          client_id: string
          created_at: string
          daily_balance: number
          id: string
          interest: number
          paid_date: string | null
          rate_pct: number
          status: string
        }
        Insert: {
          account_id: string
          accrual_date?: string
          client_id: string
          created_at?: string
          daily_balance?: number
          id?: string
          interest?: number
          paid_date?: string | null
          rate_pct?: number
          status?: string
        }
        Update: {
          account_id?: string
          accrual_date?: string
          client_id?: string
          created_at?: string
          daily_balance?: number
          id?: string
          interest?: number
          paid_date?: string | null
          rate_pct?: number
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
      isa_subscriptions: {
        Row: {
          account_id: string
          amount: number
          client_id: string
          created_at: string
          id: string
          source: string
          subscription_date: string
          tax_year: string
        }
        Insert: {
          account_id: string
          amount?: number
          client_id: string
          created_at?: string
          id?: string
          source?: string
          subscription_date?: string
          tax_year?: string
        }
        Update: {
          account_id?: string
          amount?: number
          client_id?: string
          created_at?: string
          id?: string
          source?: string
          subscription_date?: string
          tax_year?: string
        }
        Relationships: []
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
      mifid_drop_alerts: {
        Row: {
          account_id: string
          alerted_at: string
          client_id: string
          current_value: number
          drop_pct: number
          id: string
          notified: boolean
          reference_value: number
          threshold_pct: number
        }
        Insert: {
          account_id: string
          alerted_at?: string
          client_id: string
          current_value: number
          drop_pct: number
          id?: string
          notified?: boolean
          reference_value: number
          threshold_pct?: number
        }
        Update: {
          account_id?: string
          alerted_at?: string
          client_id?: string
          current_value?: number
          drop_pct?: number
          id?: string
          notified?: boolean
          reference_value?: number
          threshold_pct?: number
        }
        Relationships: []
      }
      model_assignments: {
        Row: {
          account_id: string
          assigned_at: string
          client_id: string
          id: string
          model_id: string
          status: string
        }
        Insert: {
          account_id: string
          assigned_at?: string
          client_id: string
          id?: string
          model_id: string
          status?: string
        }
        Update: {
          account_id?: string
          assigned_at?: string
          client_id?: string
          id?: string
          model_id?: string
          status?: string
        }
        Relationships: []
      }
      model_holdings: {
        Row: {
          asset_class: string | null
          created_at: string
          fund_name: string
          id: string
          isin: string | null
          model_id: string
          region: string | null
          symbol: string
          target_pct: number
        }
        Insert: {
          asset_class?: string | null
          created_at?: string
          fund_name: string
          id?: string
          isin?: string | null
          model_id: string
          region?: string | null
          symbol: string
          target_pct?: number
        }
        Update: {
          asset_class?: string | null
          created_at?: string
          fund_name?: string
          id?: string
          isin?: string | null
          model_id?: string
          region?: string | null
          symbol?: string
          target_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "model_holdings_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "model_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      model_portfolios: {
        Row: {
          benchmark: string | null
          created_at: string
          description: string | null
          drift_tolerance_pct: number
          id: string
          manager: string | null
          name: string
          ocf: number
          rebalance_frequency: string
          risk_level: number
          status: string
          updated_at: string
        }
        Insert: {
          benchmark?: string | null
          created_at?: string
          description?: string | null
          drift_tolerance_pct?: number
          id?: string
          manager?: string | null
          name: string
          ocf?: number
          rebalance_frequency?: string
          risk_level?: number
          status?: string
          updated_at?: string
        }
        Update: {
          benchmark?: string | null
          created_at?: string
          description?: string | null
          drift_tolerance_pct?: number
          id?: string
          manager?: string | null
          name?: string
          ocf?: number
          rebalance_frequency?: string
          risk_level?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      open_banking_links: {
        Row: {
          account_mask: string | null
          bank_name: string | null
          client_id: string
          consent_expiry: string | null
          created_at: string
          id: string
          provider: string
          status: string
        }
        Insert: {
          account_mask?: string | null
          bank_name?: string | null
          client_id: string
          consent_expiry?: string | null
          created_at?: string
          id?: string
          provider?: string
          status?: string
        }
        Update: {
          account_mask?: string | null
          bank_name?: string | null
          client_id?: string
          consent_expiry?: string | null
          created_at?: string
          id?: string
          provider?: string
          status?: string
        }
        Relationships: []
      }
      ops_case_notes: {
        Row: {
          author: string
          case_id: string
          created_at: string
          id: string
          is_internal: boolean
          note: string
        }
        Insert: {
          author?: string
          case_id: string
          created_at?: string
          id?: string
          is_internal?: boolean
          note: string
        }
        Update: {
          author?: string
          case_id?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          note?: string
        }
        Relationships: []
      }
      ops_cases: {
        Row: {
          assigned_to: string | null
          case_ref: string
          case_type: string
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          priority: string
          queue: string
          related_id: string | null
          related_table: string | null
          resolved_at: string | null
          sla_due_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_ref?: string
          case_type: string
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          queue?: string
          related_id?: string | null
          related_table?: string | null
          resolved_at?: string | null
          sla_due_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_ref?: string
          case_type?: string
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          queue?: string
          related_id?: string | null
          related_table?: string | null
          resolved_at?: string | null
          sla_due_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      paye_calculations: {
        Row: {
          client_id: string
          created_at: string
          emergency_basis: boolean
          gross_amount: number
          id: string
          income_tax: number
          net_amount: number
          pay_date: string
          payment_type: string
          tax_code: string
          tax_free_amount: number
          tax_year: string
          taxable_amount: number
        }
        Insert: {
          client_id: string
          created_at?: string
          emergency_basis?: boolean
          gross_amount?: number
          id?: string
          income_tax?: number
          net_amount?: number
          pay_date?: string
          payment_type: string
          tax_code?: string
          tax_free_amount?: number
          tax_year?: string
          taxable_amount?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          emergency_basis?: boolean
          gross_amount?: number
          id?: string
          income_tax?: number
          net_amount?: number
          pay_date?: string
          payment_type?: string
          tax_code?: string
          tax_free_amount?: number
          tax_year?: string
          taxable_amount?: number
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
      push_notifications: {
        Row: {
          body: string
          category: string | null
          client_id: string
          id: string
          read_at: string | null
          sent_at: string
          title: string
        }
        Insert: {
          body: string
          category?: string | null
          client_id: string
          id?: string
          read_at?: string | null
          sent_at?: string
          title: string
        }
        Update: {
          body?: string
          category?: string | null
          client_id?: string
          id?: string
          read_at?: string | null
          sent_at?: string
          title?: string
        }
        Relationships: []
      }
      rebalance_runs: {
        Row: {
          account_id: string
          approved_by: string | null
          client_id: string
          created_at: string
          drift_summary: Json | null
          executed_at: string | null
          id: string
          model_id: string
          status: string
          total_buy_value: number
          total_sell_value: number
          trades_generated: Json | null
          triggered_by: string
        }
        Insert: {
          account_id: string
          approved_by?: string | null
          client_id: string
          created_at?: string
          drift_summary?: Json | null
          executed_at?: string | null
          id?: string
          model_id: string
          status?: string
          total_buy_value?: number
          total_sell_value?: number
          trades_generated?: Json | null
          triggered_by?: string
        }
        Update: {
          account_id?: string
          approved_by?: string | null
          client_id?: string
          created_at?: string
          drift_summary?: Json | null
          executed_at?: string | null
          id?: string
          model_id?: string
          status?: string
          total_buy_value?: number
          total_sell_value?: number
          trades_generated?: Json | null
          triggered_by?: string
        }
        Relationships: []
      }
      retention_policies: {
        Row: {
          doc_type: string
          id: string
          legal_hold: boolean
          notes: string | null
          retention_years: number
        }
        Insert: {
          doc_type: string
          id?: string
          legal_hold?: boolean
          notes?: string | null
          retention_years?: number
        }
        Update: {
          doc_type?: string
          id?: string
          legal_hold?: boolean
          notes?: string | null
          retention_years?: number
        }
        Relationships: []
      }
      rti_submissions: {
        Row: {
          client_count: number
          created_at: string
          hmrc_reference: string | null
          id: string
          payload: Json | null
          period_end: string
          status: string
          submission_type: string
          submitted_at: string | null
          tax_year: string
          total_gross: number
          total_tax: number
        }
        Insert: {
          client_count?: number
          created_at?: string
          hmrc_reference?: string | null
          id?: string
          payload?: Json | null
          period_end?: string
          status?: string
          submission_type?: string
          submitted_at?: string | null
          tax_year?: string
          total_gross?: number
          total_tax?: number
        }
        Update: {
          client_count?: number
          created_at?: string
          hmrc_reference?: string | null
          id?: string
          payload?: Json | null
          period_end?: string
          status?: string
          submission_type?: string
          submitted_at?: string | null
          tax_year?: string
          total_gross?: number
          total_tax?: number
        }
        Relationships: []
      }
      secure_messages: {
        Row: {
          body: string
          client_id: string
          created_at: string
          id: string
          read_at: string | null
          recipient: string
          sender: string
          subject: string | null
          thread_id: string | null
        }
        Insert: {
          body: string
          client_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient: string
          sender: string
          subject?: string | null
          thread_id?: string | null
        }
        Update: {
          body?: string
          client_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient?: string
          sender?: string
          subject?: string | null
          thread_id?: string | null
        }
        Relationships: []
      }
      settlement_instructions: {
        Row: {
          amount: number
          block_id: string | null
          counterparty: string
          created_at: string
          id: string
          reference: string | null
          settlement_date: string
          settlement_type: string
          status: string
        }
        Insert: {
          amount?: number
          block_id?: string | null
          counterparty: string
          created_at?: string
          id?: string
          reference?: string | null
          settlement_date: string
          settlement_type?: string
          status?: string
        }
        Update: {
          amount?: number
          block_id?: string | null
          counterparty?: string
          created_at?: string
          id?: string
          reference?: string | null
          settlement_date?: string
          settlement_type?: string
          status?: string
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
      suitability_reports: {
        Row: {
          client_id: string
          costs_summary: string | null
          created_at: string
          id: string
          rationale: string | null
          recommendation: string
          risk_alignment: string | null
          signed_off_by: string | null
          status: string
        }
        Insert: {
          client_id: string
          costs_summary?: string | null
          created_at?: string
          id?: string
          rationale?: string | null
          recommendation: string
          risk_alignment?: string | null
          signed_off_by?: string | null
          status?: string
        }
        Update: {
          client_id?: string
          costs_summary?: string | null
          created_at?: string
          id?: string
          rationale?: string | null
          recommendation?: string
          risk_alignment?: string | null
          signed_off_by?: string | null
          status?: string
        }
        Relationships: []
      }
      trade_allocations: {
        Row: {
          account_id: string
          block_id: string
          client_id: string
          created_at: string
          id: string
          status: string
          units: number
          value: number
        }
        Insert: {
          account_id: string
          block_id: string
          client_id: string
          created_at?: string
          id?: string
          status?: string
          units?: number
          value?: number
        }
        Update: {
          account_id?: string
          block_id?: string
          client_id?: string
          created_at?: string
          id?: string
          status?: string
          units?: number
          value?: number
        }
        Relationships: []
      }
      trade_blocks: {
        Row: {
          block_ref: string
          created_at: string
          cut_off_at: string | null
          exec_price: number | null
          executed_at: string | null
          id: string
          isin: string | null
          settlement_date: string | null
          side: string
          status: string
          symbol: string
          total_units: number
          total_value: number
          updated_at: string
          venue: string | null
        }
        Insert: {
          block_ref?: string
          created_at?: string
          cut_off_at?: string | null
          exec_price?: number | null
          executed_at?: string | null
          id?: string
          isin?: string | null
          settlement_date?: string | null
          side: string
          status?: string
          symbol: string
          total_units?: number
          total_value?: number
          updated_at?: string
          venue?: string | null
        }
        Update: {
          block_ref?: string
          created_at?: string
          cut_off_at?: string | null
          exec_price?: number | null
          executed_at?: string | null
          id?: string
          isin?: string | null
          settlement_date?: string | null
          side?: string
          status?: string
          symbol?: string
          total_units?: number
          total_value?: number
          updated_at?: string
          venue?: string | null
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
      voting_records: {
        Row: {
          created_at: string
          fund_symbol: string
          id: string
          meeting_date: string
          proposal: string
          rationale: string | null
          vote: string
        }
        Insert: {
          created_at?: string
          fund_symbol: string
          id?: string
          meeting_date: string
          proposal: string
          rationale?: string | null
          vote: string
        }
        Update: {
          created_at?: string
          fund_symbol?: string
          id?: string
          meeting_date?: string
          proposal?: string
          rationale?: string | null
          vote?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          created_at: string
          delivered_at: string | null
          endpoint_id: string
          event: string
          id: string
          payload: Json | null
          response_code: number | null
          status: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          endpoint_id: string
          event: string
          id?: string
          payload?: Json | null
          response_code?: number | null
          status?: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          endpoint_id?: string
          event?: string
          id?: string
          payload?: Json | null
          response_code?: number | null
          status?: string
        }
        Relationships: []
      }
      webhook_endpoints: {
        Row: {
          created_at: string
          events: string[]
          id: string
          secret: string | null
          status: string
          url: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          id?: string
          secret?: string | null
          status?: string
          url: string
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          secret?: string | null
          status?: string
          url?: string
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
      workflow_instances: {
        Row: {
          case_id: string | null
          client_id: string | null
          completed_at: string | null
          context: Json | null
          current_step: number
          due_at: string | null
          id: string
          started_at: string
          status: string
          template_id: string | null
        }
        Insert: {
          case_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          context?: Json | null
          current_step?: number
          due_at?: string | null
          id?: string
          started_at?: string
          status?: string
          template_id?: string | null
        }
        Update: {
          case_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          context?: Json | null
          current_step?: number
          due_at?: string | null
          id?: string
          started_at?: string
          status?: string
          template_id?: string | null
        }
        Relationships: []
      }
      workflow_templates: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          four_eyes_required: boolean
          id: string
          name: string
          sla_minutes: number
          steps: Json
          trigger_event: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          four_eyes_required?: boolean
          id?: string
          name: string
          sla_minutes?: number
          steps?: Json
          trigger_event?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          four_eyes_required?: boolean
          id?: string
          name?: string
          sla_minutes?: number
          steps?: Json
          trigger_event?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      mi_aua_by_firm: {
        Row: {
          aua: number | null
          cash: number | null
          client_count: number | null
          firm_id: string | null
          firm_name: string | null
        }
        Relationships: []
      }
      mi_fee_yield: {
        Row: {
          billed_clients: number | null
          fees_charged: number | null
          month: string | null
        }
        Relationships: []
      }
      mi_net_flows: {
        Row: {
          inflows: number | null
          month: string | null
          net_flow: number | null
          outflows: number | null
          txn_count: number | null
        }
        Relationships: []
      }
      mi_ops_queue_health: {
        Row: {
          case_count: number | null
          priority: string | null
          queue: string | null
          sla_breached: number | null
          status: string | null
        }
        Relationships: []
      }
      mi_persistency: {
        Row: {
          active_clients: number | null
          closed_clients: number | null
          month: string | null
          persistency_pct: number | null
        }
        Relationships: []
      }
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

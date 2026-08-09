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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      cultivar: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          species_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          species_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          species_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cultivar_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "plant_species"
            referencedColumns: ["id"]
          },
        ]
      }
      observation: {
        Row: {
          created_at: string
          id: string
          notes: string
          observed_at: string
          plant_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes: string
          observed_at?: string
          plant_id: string
          type: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string
          observed_at?: string
          plant_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "observation_plant_user_fk"
            columns: ["plant_id", "user_id"]
            isOneToOne: false
            referencedRelation: "plant"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      plant: {
        Row: {
          acquired_at: string | null
          code: string
          container_liters: number | null
          created_at: string
          cultivar_id: string | null
          id: string
          location: string | null
          notes: string | null
          planted_at: string | null
          propagation_method: string | null
          source: string | null
          species_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acquired_at?: string | null
          code: string
          container_liters?: number | null
          created_at?: string
          cultivar_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          planted_at?: string | null
          propagation_method?: string | null
          source?: string | null
          species_id: string
          status: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          acquired_at?: string | null
          code?: string
          container_liters?: number | null
          created_at?: string
          cultivar_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          planted_at?: string | null
          propagation_method?: string | null
          source?: string | null
          species_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plant_cultivar_species_fk"
            columns: ["cultivar_id", "species_id"]
            isOneToOne: false
            referencedRelation: "cultivar"
            referencedColumns: ["id", "species_id"]
          },
          {
            foreignKeyName: "plant_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "plant_species"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_photo: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          observation_id: string | null
          plant_id: string
          storage_path: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          observation_id?: string | null
          plant_id: string
          storage_path: string
          user_id?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          observation_id?: string | null
          plant_id?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plant_photo_observation_plant_fk"
            columns: ["observation_id", "plant_id"]
            isOneToOne: false
            referencedRelation: "observation"
            referencedColumns: ["id", "plant_id"]
          },
          {
            foreignKeyName: "plant_photo_plant_user_fk"
            columns: ["plant_id", "user_id"]
            isOneToOne: false
            referencedRelation: "plant"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      plant_species: {
        Row: {
          common_name: string
          created_at: string
          id: string
          scientific_name: string | null
        }
        Insert: {
          common_name: string
          created_at?: string
          id?: string
          scientific_name?: string | null
        }
        Update: {
          common_name?: string
          created_at?: string
          id?: string
          scientific_name?: string | null
        }
        Relationships: []
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

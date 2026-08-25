export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          id: string
          is_default: boolean
          label: string
          latitude: number | null
          longitude: number | null
          state: string
          street: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_default?: boolean
          label: string
          latitude?: number | null
          longitude?: number | null
          state: string
          street: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
          state?: string
          street?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          id: string
          rating: number
          referral_code: string
          referred_by: string | null
          total_deliveries: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating?: number
          referral_code: string
          referred_by?: string | null
          total_deliveries?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          referral_code?: string
          referred_by?: string | null
          total_deliveries?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          discount_amount: number | null
          discount_percent: number | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          actual_fee: number | null
          city: string
          client_id: string
          created_at: string
          delivered_at: string | null
          delivery_address: string
          delivery_lat: number | null
          delivery_lng: number | null
          estimated_delivery: string | null
          estimated_fee: number
          id: string
          notes: string | null
          package_description: string
          package_weight: number | null
          pickup_address: string
          pickup_lat: number | null
          pickup_lng: number | null
          rider_id: string | null
          status: Database["public"]["Enums"]["delivery_status"]
          tracking_id: string
          updated_at: string
        }
        Insert: {
          actual_fee?: number | null
          city: string
          client_id: string
          created_at?: string
          delivered_at?: string | null
          delivery_address: string
          delivery_lat?: number | null
          delivery_lng?: number | null
          estimated_delivery?: string | null
          estimated_fee: number
          id?: string
          notes?: string | null
          package_description: string
          package_weight?: number | null
          pickup_address: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          rider_id?: string | null
          status?: Database["public"]["Enums"]["delivery_status"]
          tracking_id: string
          updated_at?: string
        }
        Update: {
          actual_fee?: number | null
          city?: string
          client_id?: string
          created_at?: string
          delivered_at?: string | null
          delivery_address?: string
          delivery_lat?: number | null
          delivery_lng?: number | null
          estimated_delivery?: string | null
          estimated_fee?: number
          id?: string
          notes?: string | null
          package_description?: string
          package_weight?: number | null
          pickup_address?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          rider_id?: string | null
          status?: Database["public"]["Enums"]["delivery_status"]
          tracking_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          delivery_id: string
          id: string
          paystack_reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          delivery_id: string
          id?: string
          paystack_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          delivery_id?: string
          id?: string
          paystack_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          is_claimed: boolean
          referred_id: string
          referrer_id: string
          reward_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_claimed?: boolean
          referred_id: string
          referrer_id: string
          reward_amount?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_claimed?: boolean
          referred_id?: string
          referrer_id?: string
          reward_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          delivery_id: string
          id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          delivery_id: string
          id?: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          delivery_id?: string
          id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      riders: {
        Row: {
          created_at: string
          earnings: number
          id: string
          is_available: boolean
          is_verified: boolean
          license_number: string | null
          rating: number
          total_deliveries: number
          user_id: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          earnings?: number
          id?: string
          is_available?: boolean
          is_verified?: boolean
          license_number?: string | null
          rating?: number
          total_deliveries?: number
          user_id: string
          vehicle_type: string
        }
        Update: {
          created_at?: string
          earnings?: number
          id?: string
          is_available?: boolean
          is_verified?: boolean
          license_number?: string | null
          rating?: number
          total_deliveries?: number
          user_id?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "riders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking: {
        Row: {
          created_at: string
          delivery_id: string
          id: string
          latitude: number | null
          longitude: number | null
          note: string | null
          status: Database["public"]["Enums"]["delivery_status"]
        }
        Insert: {
          created_at?: string
          delivery_id: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          note?: string | null
          status: Database["public"]["Enums"]["delivery_status"]
        }
        Update: {
          created_at?: string
          delivery_id?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          note?: string | null
          status?: Database["public"]["Enums"]["delivery_status"]
        }
        Relationships: [
          {
            foreignKeyName: "tracking_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_tracking_id: { Args: never; Returns: string }
      get_delivery_by_tracking: {
        Args: { p_tracking_id: string }
        Returns: {
          city: string
          created_at: string
          delivery_address: string
          estimated_delivery: string
          package_description: string
          pickup_address: string
          status: Database["public"]["Enums"]["delivery_status"]
          tracking_id: string
        }[]
      }
    }
    Enums: {
      delivery_status:
        | "pending"
        | "accepted"
        | "picked_up"
        | "in_transit"
        | "delivered"
        | "cancelled"
      notification_type: "info" | "success" | "warning" | "delivery"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      user_role: "client" | "rider" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]

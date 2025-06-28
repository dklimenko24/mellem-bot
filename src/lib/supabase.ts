import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          telegram_id: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          telegram_id?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          telegram_id?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          service_type: string
          size: string
          material: string
          price: number
          options: Record<string, any>
          photo_urls: string[]
          status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled'
          admin_notes: string | null
          sketch_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_number: string
          service_type: string
          size: string
          material: string
          price: number
          options?: Record<string, any>
          photo_urls?: string[]
          status?: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled'
          admin_notes?: string | null
          sketch_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_number?: string
          service_type?: string
          size?: string
          material?: string
          price?: number
          options?: Record<string, any>
          photo_urls?: string[]
          status?: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled'
          admin_notes?: string | null
          sketch_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
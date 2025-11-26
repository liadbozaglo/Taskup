export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          phone_number: string | null
          profile_photo: string | null
          bio: string
          role: 'poster' | 'tasker' | 'both'
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          city: string | null
          average_rating: number
          total_reviews: number
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          phone_number?: string | null
          profile_photo?: string | null
          bio?: string
          role?: 'poster' | 'tasker' | 'both'
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          city?: string | null
          average_rating?: number
          total_reviews?: number
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          phone_number?: string | null
          profile_photo?: string | null
          bio?: string
          role?: 'poster' | 'tasker' | 'both'
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          city?: string | null
          average_rating?: number
          total_reviews?: number
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          poster_id: string
          title: string
          description: string
          category: string
          budget_amount: number
          location_address: string
          location_lat: number
          location_lng: number
          city: string | null
          status: 'open' | 'assigned' | 'completed' | 'paid'
          due_date: string | null
          images: string[]
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          poster_id: string
          title: string
          description: string
          category: string
          budget_amount: number
          location_address: string
          location_lat: number
          location_lng: number
          city?: string | null
          status?: 'open' | 'assigned' | 'completed' | 'paid'
          due_date?: string | null
          images?: string[]
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          poster_id?: string
          title?: string
          description?: string
          category?: string
          budget_amount?: number
          location_address?: string
          location_lat?: number
          location_lng?: number
          city?: string | null
          status?: 'open' | 'assigned' | 'completed' | 'paid'
          due_date?: string | null
          images?: string[]
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      offers: {
        Row: {
          id: string
          task_id: string
          tasker_id: string
          offer_amount: number
          comment: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          tasker_id: string
          offer_amount: number
          comment: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          tasker_id?: string
          offer_amount?: number
          comment?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          task_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          comment?: string
          created_at?: string
        }
      }
      task_messages: {
        Row: {
          id: string
          task_id: string
          sender_id: string
          recipient_id: string
          offer_id: string | null
          message_type: 'offer' | 'question' | 'answer' | 'system'
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          sender_id: string
          recipient_id: string
          offer_id?: string | null
          message_type: 'offer' | 'question' | 'answer' | 'system'
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          sender_id?: string
          recipient_id?: string
          offer_id?: string | null
          message_type?: 'offer' | 'question' | 'answer' | 'system'
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
  }
}

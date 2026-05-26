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
      activity_log: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_activity_log_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          pinned: boolean
          tenant_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          pinned?: boolean
          tenant_id: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          pinned?: boolean
          tenant_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          tool_calls: Json | null
        }
        Insert: {
          content?: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          tool_calls?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          tool_calls?: Json | null
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
      ai_prompts: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          model: string | null
          slug: string
          system_prompt: string
          temperature: number | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          model?: string | null
          slug: string
          system_prompt: string
          temperature?: number | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          model?: string | null
          slug?: string
          system_prompt?: string
          temperature?: number | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tool_calls: {
        Row: {
          arguments: Json | null
          created_at: string
          id: string
          message_id: string | null
          result_summary: string | null
          tenant_id: string
          tool_name: string
          user_id: string
        }
        Insert: {
          arguments?: Json | null
          created_at?: string
          id?: string
          message_id?: string | null
          result_summary?: string | null
          tenant_id: string
          tool_name: string
          user_id: string
        }
        Update: {
          arguments?: Json | null
          created_at?: string
          id?: string
          message_id?: string | null
          result_summary?: string | null
          tenant_id?: string
          tool_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tool_calls_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "ai_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tool_calls_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_user_memory: {
        Row: {
          brand_voice: string | null
          created_at: string
          custom_notes: string | null
          display_name: string | null
          priorities: string | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_voice?: string | null
          created_at?: string
          custom_notes?: string | null
          display_name?: string | null
          priorities?: string | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_voice?: string | null
          created_at?: string
          custom_notes?: string | null
          display_name?: string | null
          priorities?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_user_memory_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          country: string | null
          device: string
          event_type: string
          id: string
          path: string
          session_id: string
          source: string
          tenant_id: string
          timestamp: string
          variant: string | null
          visitor_id: string
        }
        Insert: {
          country?: string | null
          device: string
          event_type: string
          id?: string
          path: string
          session_id: string
          source?: string
          tenant_id: string
          timestamp?: string
          variant?: string | null
          visitor_id: string
        }
        Update: {
          country?: string | null
          device?: string
          event_type?: string
          id?: string
          path?: string
          session_id?: string
          source?: string
          tenant_id?: string
          timestamp?: string
          variant?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      calendly_events: {
        Row: {
          calendly_event_uri: string
          cancellation: Json | null
          created_at: string | null
          end_time: string
          event_type_name: string | null
          id: string
          invitee_email: string | null
          invitee_name: string | null
          invitee_phone: string | null
          lead_id: string | null
          location_info: Json | null
          person_id: string | null
          questions_and_answers: Json | null
          raw_payload: Json | null
          reschedule_url: string | null
          sales_user_id: string | null
          start_time: string
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          calendly_event_uri: string
          cancellation?: Json | null
          created_at?: string | null
          end_time: string
          event_type_name?: string | null
          id?: string
          invitee_email?: string | null
          invitee_name?: string | null
          invitee_phone?: string | null
          lead_id?: string | null
          location_info?: Json | null
          person_id?: string | null
          questions_and_answers?: Json | null
          raw_payload?: Json | null
          reschedule_url?: string | null
          sales_user_id?: string | null
          start_time: string
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          calendly_event_uri?: string
          cancellation?: Json | null
          created_at?: string | null
          end_time?: string
          event_type_name?: string | null
          id?: string
          invitee_email?: string | null
          invitee_name?: string | null
          invitee_phone?: string | null
          lead_id?: string | null
          location_info?: Json | null
          person_id?: string | null
          questions_and_answers?: Json | null
          raw_payload?: Json | null
          reschedule_url?: string | null
          sales_user_id?: string | null
          start_time?: string
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendly_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendly_events_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "crm_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendly_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          message_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          message_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          message_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_attachments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_mentions: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          mentioned_user_id: string
          message_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          mentioned_user_id: string
          message_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          mentioned_user_id?: string
          message_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_mentions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_mentions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          attachments: Json
          content: string | null
          created_at: string
          forwarded_from_message_id: string | null
          id: string
          is_deleted: boolean
          is_edited: boolean
          is_forwarded: boolean
          mentioned_user_ids: string[] | null
          message_type: string
          reply_to_message_id: string | null
          sender_id: string
          tenant_id: string
          thread_id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json
          content?: string | null
          created_at?: string
          forwarded_from_message_id?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          is_forwarded?: boolean
          mentioned_user_ids?: string[] | null
          message_type?: string
          reply_to_message_id?: string | null
          sender_id: string
          tenant_id: string
          thread_id: string
          updated_at?: string
        }
        Update: {
          attachments?: Json
          content?: string | null
          created_at?: string
          forwarded_from_message_id?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          is_forwarded?: boolean
          mentioned_user_ids?: string[] | null
          message_type?: string
          reply_to_message_id?: string | null
          sender_id?: string
          tenant_id?: string
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_forwarded_from_message_id_fkey"
            columns: ["forwarded_from_message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_mutes: {
        Row: {
          created_at: string
          muted_until: string | null
          notify_on_mention: boolean
          room_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          muted_until?: string | null
          notify_on_mention?: boolean
          room_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          muted_until?: string | null
          notify_on_mention?: boolean
          room_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_mutes_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_mutes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_pinned_messages: {
        Row: {
          created_at: string
          id: string
          message_id: string
          pinned_by: string
          room_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          pinned_by: string
          room_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          pinned_by?: string
          room_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_pinned_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: true
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_pinned_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_pinned_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_reactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_read_receipts: {
        Row: {
          last_read_at: string
          last_read_message_id: string | null
          tenant_id: string
          thread_id: string
          user_id: string
        }
        Insert: {
          last_read_at?: string
          last_read_message_id?: string | null
          tenant_id: string
          thread_id: string
          user_id: string
        }
        Update: {
          last_read_at?: string
          last_read_message_id?: string | null
          tenant_id?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_read_receipts_last_read_message_id_fkey"
            columns: ["last_read_message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_read_receipts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_read_receipts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_room_access_overrides: {
        Row: {
          action: string
          created_at: string
          granted_by: string | null
          id: string
          room_id: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          granted_by?: string | null
          id?: string
          room_id: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          granted_by?: string | null
          id?: string
          room_id?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_access_overrides_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_room_access_overrides_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          name: string | null
          room_type: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          room_type?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          room_type?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          room_id: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          room_id: string
          tenant_id: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          room_id?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_access: {
        Row: {
          client_id: string
          created_at: string
          id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_access_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_access_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_audience_avatars: {
        Row: {
          age_range: string | null
          blockers: string[] | null
          client_id: string
          created_at: string | null
          desires_goals: string[] | null
          emoji: string | null
          fears_pains: string[] | null
          id: string
          income: string | null
          location: string | null
          name: string
          occupation: string | null
          order_index: number
          phrases: string[] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          age_range?: string | null
          blockers?: string[] | null
          client_id: string
          created_at?: string | null
          desires_goals?: string[] | null
          emoji?: string | null
          fears_pains?: string[] | null
          id?: string
          income?: string | null
          location?: string | null
          name?: string
          occupation?: string | null
          order_index?: number
          phrases?: string[] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          age_range?: string | null
          blockers?: string[] | null
          client_id?: string
          created_at?: string | null
          desires_goals?: string[] | null
          emoji?: string | null
          fears_pains?: string[] | null
          id?: string
          income?: string | null
          location?: string | null
          name?: string
          occupation?: string | null
          order_index?: number
          phrases?: string[] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_audience_avatars_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_audience_avatars_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_docs: {
        Row: {
          client_id: string
          content: Json
          created_at: string
          id: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          content?: Json
          created_at?: string
          id?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          content?: Json
          created_at?: string
          id?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_docs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_docs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_foundation: {
        Row: {
          audience_avatars: Json
          bios: Json
          call_transcripts: Json
          client_id: string
          context_dumps: Json
          created_at: string
          foundation: Json
          foundation_ready: boolean
          id: string
          pillars: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          audience_avatars?: Json
          bios?: Json
          call_transcripts?: Json
          client_id: string
          context_dumps?: Json
          created_at?: string
          foundation?: Json
          foundation_ready?: boolean
          id?: string
          pillars?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          audience_avatars?: Json
          bios?: Json
          call_transcripts?: Json
          client_id?: string
          context_dumps?: Json
          created_at?: string
          foundation?: Json
          foundation_ready?: boolean
          id?: string
          pillars?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_foundation_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_foundation_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_invitations: {
        Row: {
          accepted_at: string | null
          client_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          name: string | null
          status: string
          tenant_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          client_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          name?: string | null
          status?: string
          tenant_id: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          client_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          name?: string | null
          status?: string
          tenant_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_invitations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_journey_steps: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
          id: string
          metadata: Json | null
          order_index: number
          status: string | null
          step_key: string
          step_label: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          order_index?: number
          status?: string | null
          step_key: string
          step_label: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          order_index?: number
          status?: string | null
          step_key?: string
          step_label?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_journey_steps_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_journey_steps_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_members: {
        Row: {
          client_id: string
          created_at: string
          email: string | null
          id: string
          is_workspace_owner: boolean | null
          name: string
          role_title: string | null
          tenant_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          email?: string | null
          id?: string
          is_workspace_owner?: boolean | null
          name: string
          role_title?: string | null
          tenant_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          email?: string | null
          id?: string
          is_workspace_owner?: boolean | null
          name?: string
          role_title?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_members_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          author_id: string | null
          body: string
          client_id: string
          created_at: string
          id: string
          tenant_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          client_id: string
          created_at?: string
          id?: string
          tenant_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          client_id?: string
          created_at?: string
          id?: string
          tenant_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_onboarding: {
        Row: {
          answers: Json
          client_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          answers?: Json
          client_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          client_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_onboarding_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_onboarding_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_team_assignments: {
        Row: {
          assigned_by: string | null
          client_id: string
          created_at: string
          id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          client_id: string
          created_at?: string
          id?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          client_id?: string
          created_at?: string
          id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_team_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_team_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          analytics_enabled: boolean | null
          archived_at: string | null
          branding_deck_approved: boolean | null
          branding_deck_url: string | null
          color_palette: string[] | null
          company: string | null
          connected_accounts: Json | null
          created_at: string
          deal_owner_id: string | null
          default_aspect_ratio: string | null
          description: string | null
          email: string | null
          id: string
          industry: string | null
          job_title: string | null
          location: string | null
          logo_url: string | null
          name: string
          notes: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          person_id: string | null
          phone: string | null
          settings: Json | null
          slug: string
          social_links: Json | null
          start_date: string | null
          stripe_customer_id: string | null
          tenant_id: string
          token_created_at: string | null
          token_expires_at: string | null
          token_last_accessed_at: string | null
          updated_at: string
          videos_per_month: number | null
          workspace_token: string | null
          workspace_type: Database["public"]["Enums"]["workspace_type"]
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"]
          analytics_enabled?: boolean | null
          archived_at?: string | null
          branding_deck_approved?: boolean | null
          branding_deck_url?: string | null
          color_palette?: string[] | null
          company?: string | null
          connected_accounts?: Json | null
          created_at?: string
          deal_owner_id?: string | null
          default_aspect_ratio?: string | null
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          notes?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          person_id?: string | null
          phone?: string | null
          settings?: Json | null
          slug: string
          social_links?: Json | null
          start_date?: string | null
          stripe_customer_id?: string | null
          tenant_id: string
          token_created_at?: string | null
          token_expires_at?: string | null
          token_last_accessed_at?: string | null
          updated_at?: string
          videos_per_month?: number | null
          workspace_token?: string | null
          workspace_type?: Database["public"]["Enums"]["workspace_type"]
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          analytics_enabled?: boolean | null
          archived_at?: string | null
          branding_deck_approved?: boolean | null
          branding_deck_url?: string | null
          color_palette?: string[] | null
          company?: string | null
          connected_accounts?: Json | null
          created_at?: string
          deal_owner_id?: string | null
          default_aspect_ratio?: string | null
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          person_id?: string | null
          phone?: string | null
          settings?: Json | null
          slug?: string
          social_links?: Json | null
          start_date?: string | null
          stripe_customer_id?: string | null
          tenant_id?: string
          token_created_at?: string | null
          token_expires_at?: string | null
          token_last_accessed_at?: string | null
          updated_at?: string
          videos_per_month?: number | null
          workspace_token?: string | null
          workspace_type?: Database["public"]["Enums"]["workspace_type"]
        }
        Relationships: [
          {
            foreignKeyName: "clients_deal_owner_id_fkey"
            columns: ["deal_owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "crm_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clients_person"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "crm_people"
            referencedColumns: ["id"]
          },
        ]
      }
      closer_regions: {
        Row: {
          calendar_event_filter: string | null
          calendly_api_key: string | null
          calendly_webhook_uri: string | null
          countries: string[]
          created_at: string
          id: string
          region_name: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calendar_event_filter?: string | null
          calendly_api_key?: string | null
          calendly_webhook_uri?: string | null
          countries?: string[]
          created_at?: string
          id?: string
          region_name: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calendar_event_filter?: string | null
          calendly_api_key?: string | null
          calendly_webhook_uri?: string | null
          countries?: string[]
          created_at?: string
          id?: string
          region_name?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "closer_regions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_attachments: {
        Row: {
          comment_id: string
          content_type: string
          created_at: string
          expires_at: string
          file_name: string
          file_size: number | null
          id: string
          storage_path: string
          tenant_id: string
          uploaded_by: string | null
        }
        Insert: {
          comment_id: string
          content_type: string
          created_at?: string
          expires_at?: string
          file_name: string
          file_size?: number | null
          id?: string
          storage_path: string
          tenant_id: string
          uploaded_by?: string | null
        }
        Update: {
          comment_id?: string
          content_type?: string
          created_at?: string
          expires_at?: string
          file_name?: string
          file_size?: number | null
          id?: string
          storage_path?: string
          tenant_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_attachments_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "video_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_attachments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      content_vault: {
        Row: {
          category: string | null
          client_id: string
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          source_url: string | null
          tags: string[] | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          client_id: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          source_url?: string | null
          tags?: string[] | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          client_id?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          source_url?: string | null
          tags?: string[] | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_vault_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_vault_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      credentials: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          password: string | null
          tenant_id: string
          title: string
          updated_at: string
          url: string | null
          username: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          password?: string | null
          tenant_id: string
          title: string
          updated_at?: string
          url?: string | null
          username?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          password?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
          url?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credentials_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credentials_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_companies: {
        Row: {
          attio_record_id: string | null
          categories: string[] | null
          created_at: string | null
          description: string | null
          domain: string | null
          id: string
          last_interaction_at: string | null
          name: string
          social_links: Json | null
          team_country: string | null
          team_phone: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          attio_record_id?: string | null
          categories?: string[] | null
          created_at?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          last_interaction_at?: string | null
          name: string
          social_links?: Json | null
          team_country?: string | null
          team_phone?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          attio_record_id?: string | null
          categories?: string[] | null
          created_at?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          last_interaction_at?: string | null
          name?: string
          social_links?: Json | null
          team_country?: string | null
          team_phone?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_companies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deal_options: {
        Row: {
          category: string
          color: string | null
          created_at: string
          id: string
          is_active: boolean
          label: string
          order_index: number
          tenant_id: string
          updated_at: string
          value: string
        }
        Insert: {
          category: string
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          order_index?: number
          tenant_id: string
          updated_at?: string
          value: string
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          order_index?: number
          tenant_id?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_deal_options_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          attio_record_id: string | null
          created_at: string | null
          deal_owner: string | null
          id: string
          name: string
          next_due_date: string | null
          notes: string | null
          payment_method: string | null
          person_id: string | null
          plan: string | null
          region: string | null
          stage: string
          stage_id: string | null
          stage_order: number | null
          tenant_id: string
          total_videos: number | null
          updated_at: string | null
        }
        Insert: {
          attio_record_id?: string | null
          created_at?: string | null
          deal_owner?: string | null
          id?: string
          name: string
          next_due_date?: string | null
          notes?: string | null
          payment_method?: string | null
          person_id?: string | null
          plan?: string | null
          region?: string | null
          stage?: string
          stage_id?: string | null
          stage_order?: number | null
          tenant_id: string
          total_videos?: number | null
          updated_at?: string | null
        }
        Update: {
          attio_record_id?: string | null
          created_at?: string | null
          deal_owner?: string | null
          id?: string
          name?: string
          next_due_date?: string | null
          notes?: string | null
          payment_method?: string | null
          person_id?: string | null
          plan?: string | null
          region?: string | null
          stage?: string
          stage_id?: string | null
          stage_order?: number | null
          tenant_id?: string
          total_videos?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "crm_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "deal_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_editors: {
        Row: {
          attio_record_id: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          languages: string[] | null
          location: string | null
          metadata: Json | null
          notes: string | null
          person_id: string | null
          phone: string | null
          portfolio_url: string | null
          resume_url: string | null
          role_applied: string | null
          sample_link_url: string | null
          software_fluency: string[] | null
          submission_date: string | null
          tenant_id: string
          updated_at: string | null
          video_intro_url: string | null
        }
        Insert: {
          attio_record_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          languages?: string[] | null
          location?: string | null
          metadata?: Json | null
          notes?: string | null
          person_id?: string | null
          phone?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          role_applied?: string | null
          sample_link_url?: string | null
          software_fluency?: string[] | null
          submission_date?: string | null
          tenant_id: string
          updated_at?: string | null
          video_intro_url?: string | null
        }
        Update: {
          attio_record_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          languages?: string[] | null
          location?: string | null
          metadata?: Json | null
          notes?: string | null
          person_id?: string | null
          phone?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          role_applied?: string | null
          sample_link_url?: string | null
          software_fluency?: string[] | null
          submission_date?: string | null
          tenant_id?: string
          updated_at?: string | null
          video_intro_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_editors_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "crm_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_editors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_people: {
        Row: {
          active: boolean | null
          assigned_to: string | null
          attio_record_id: string | null
          city: string | null
          client_status: string | null
          company_id: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          deal_stage: string | null
          description: string | null
          email: string | null
          facebook: string | null
          first_calendar_at: string | null
          fit: string | null
          full_name: string
          goal: string | null
          id: string
          income_range: string | null
          instagram: string | null
          interested_in: string | null
          invalid_phone_note: string | null
          job_title: string | null
          last_calendar_at: string | null
          location: string | null
          notes: string | null
          obstacle: string | null
          payment_link: string | null
          phone: string | null
          social_link: string | null
          source: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          assigned_to?: string | null
          attio_record_id?: string | null
          city?: string | null
          client_status?: string | null
          company_id?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          deal_stage?: string | null
          description?: string | null
          email?: string | null
          facebook?: string | null
          first_calendar_at?: string | null
          fit?: string | null
          full_name: string
          goal?: string | null
          id?: string
          income_range?: string | null
          instagram?: string | null
          interested_in?: string | null
          invalid_phone_note?: string | null
          job_title?: string | null
          last_calendar_at?: string | null
          location?: string | null
          notes?: string | null
          obstacle?: string | null
          payment_link?: string | null
          phone?: string | null
          social_link?: string | null
          source?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          assigned_to?: string | null
          attio_record_id?: string | null
          city?: string | null
          client_status?: string | null
          company_id?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          deal_stage?: string | null
          description?: string | null
          email?: string | null
          facebook?: string | null
          first_calendar_at?: string | null
          fit?: string | null
          full_name?: string
          goal?: string | null
          id?: string
          income_range?: string | null
          instagram?: string | null
          interested_in?: string | null
          invalid_phone_note?: string | null
          job_title?: string | null
          last_calendar_at?: string | null
          location?: string | null
          notes?: string | null
          obstacle?: string | null
          payment_link?: string | null
          phone?: string | null
          social_link?: string | null
          source?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_people_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_people_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_column_values: {
        Row: {
          column_id: string
          created_at: string | null
          id: string
          tenant_id: string
          updated_at: string | null
          value: string | null
          video_id: string
        }
        Insert: {
          column_id: string
          created_at?: string | null
          id?: string
          tenant_id: string
          updated_at?: string | null
          value?: string | null
          video_id: string
        }
        Update: {
          column_id?: string
          created_at?: string | null
          id?: string
          tenant_id?: string
          updated_at?: string | null
          value?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_column_values_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "custom_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_column_values_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_column_values_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_columns: {
        Row: {
          allow_inline_edit: boolean | null
          column_name: string
          column_type: string
          created_at: string | null
          default_value: string | null
          description: string | null
          editable_roles: Database["public"]["Enums"]["app_role"][]
          id: string
          is_required: boolean | null
          options: Json | null
          order_index: number | null
          project_id: string | null
          show_in_edit_form: boolean | null
          show_in_new_form: boolean | null
          show_in_table: boolean | null
          tenant_id: string
          updated_at: string | null
          width_px: number | null
        }
        Insert: {
          allow_inline_edit?: boolean | null
          column_name: string
          column_type?: string
          created_at?: string | null
          default_value?: string | null
          description?: string | null
          editable_roles?: Database["public"]["Enums"]["app_role"][]
          id?: string
          is_required?: boolean | null
          options?: Json | null
          order_index?: number | null
          project_id?: string | null
          show_in_edit_form?: boolean | null
          show_in_new_form?: boolean | null
          show_in_table?: boolean | null
          tenant_id: string
          updated_at?: string | null
          width_px?: number | null
        }
        Update: {
          allow_inline_edit?: boolean | null
          column_name?: string
          column_type?: string
          created_at?: string | null
          default_value?: string | null
          description?: string | null
          editable_roles?: Database["public"]["Enums"]["app_role"][]
          id?: string
          is_required?: boolean | null
          options?: Json | null
          order_index?: number | null
          project_id?: string | null
          show_in_edit_form?: boolean | null
          show_in_new_form?: boolean | null
          show_in_table?: boolean | null
          tenant_id?: string
          updated_at?: string | null
          width_px?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_columns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_columns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_journey_steps: {
        Row: {
          calendly_type: string | null
          client_description: string | null
          component_key: string | null
          created_at: string
          created_by: string | null
          default_roles: string[] | null
          default_visibility: string | null
          has_approval: boolean | null
          has_call: boolean | null
          id: string
          name: string
          step_key: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          calendly_type?: string | null
          client_description?: string | null
          component_key?: string | null
          created_at?: string
          created_by?: string | null
          default_roles?: string[] | null
          default_visibility?: string | null
          has_approval?: boolean | null
          has_call?: boolean | null
          id?: string
          name: string
          step_key: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          calendly_type?: string | null
          client_description?: string | null
          component_key?: string | null
          created_at?: string
          created_by?: string | null
          default_roles?: string[] | null
          default_visibility?: string | null
          has_approval?: boolean | null
          has_call?: boolean | null
          id?: string
          name?: string
          step_key?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_journey_steps_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cycles: {
        Row: {
          body_json: Json
          client_id: string
          created_at: string
          cycle_number: number
          end_date: string | null
          id: string
          is_backlog: boolean | null
          name: string
          order_index: number
          project_id: string
          start_date: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          body_json?: Json
          client_id: string
          created_at?: string
          cycle_number?: number
          end_date?: string | null
          id?: string
          is_backlog?: boolean | null
          name: string
          order_index?: number
          project_id: string
          start_date?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          body_json?: Json
          client_id?: string
          created_at?: string
          cycle_number?: number
          end_date?: string | null
          id?: string
          is_backlog?: boolean | null
          name?: string
          order_index?: number
          project_id?: string
          start_date?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cycles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_stages: {
        Row: {
          color: string | null
          created_at: string
          display_name: string
          id: string
          is_auto_trigger: boolean | null
          probability: number | null
          slug: string
          sort_order: number
          tenant_id: string
          trigger_action: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_auto_trigger?: boolean | null
          probability?: number | null
          slug: string
          sort_order?: number
          tenant_id: string
          trigger_action?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_auto_trigger?: boolean | null
          probability?: number | null
          slug?: string
          sort_order?: number
          tenant_id?: string
          trigger_action?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_stages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaign_recipients: {
        Row: {
          campaign_id: string
          created_at: string
          email: string
          error: string | null
          id: string
          name: string | null
          sent_at: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          email: string
          error?: string | null
          id?: string
          name?: string | null
          sent_at?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          email?: string
          error?: string | null
          id?: string
          name?: string | null
          sent_at?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaign_recipients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          audience: string
          body: string
          created_at: string
          created_by: string | null
          cta_text: string | null
          cta_url: string | null
          headline: string | null
          id: string
          recipient_count: number
          rendered_html: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string
          subject: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          audience: string
          body: string
          created_at?: string
          created_by?: string | null
          cta_text?: string | null
          cta_url?: string | null
          headline?: string | null
          id?: string
          recipient_count?: number
          rendered_html?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          audience?: string
          body?: string
          created_at?: string
          created_by?: string | null
          cta_text?: string | null
          cta_url?: string | null
          headline?: string | null
          id?: string
          recipient_count?: number
          rendered_html?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_master_template: {
        Row: {
          accent_color: string
          created_at: string
          footer_html: string
          id: string
          is_active: boolean
          logo_url: string
          tenant_id: string
          updated_at: string
          wrapper_html: string
        }
        Insert: {
          accent_color?: string
          created_at?: string
          footer_html?: string
          id?: string
          is_active?: boolean
          logo_url?: string
          tenant_id: string
          updated_at?: string
          wrapper_html: string
        }
        Update: {
          accent_color?: string
          created_at?: string
          footer_html?: string
          id?: string
          is_active?: boolean
          logo_url?: string
          tenant_id?: string
          updated_at?: string
          wrapper_html?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_master_template_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          body_html: string
          created_at: string
          error: string | null
          id: string
          metadata: Json | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          tenant_id: string
          to_email: string
          to_name: string | null
        }
        Insert: {
          body_html: string
          created_at?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
          tenant_id: string
          to_email: string
          to_name?: string | null
        }
        Update: {
          body_html?: string
          created_at?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          tenant_id?: string
          to_email?: string
          to_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_queue_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string | null
          body_html: string
          category: string | null
          created_at: string
          cta_text: string | null
          cta_url: string | null
          edit_mode: string
          headline: string | null
          id: string
          is_active: boolean | null
          name: string
          preview_text: string | null
          slug: string
          subject: string
          tenant_id: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          body?: string | null
          body_html: string
          category?: string | null
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          edit_mode?: string
          headline?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          preview_text?: string | null
          slug: string
          subject: string
          tenant_id: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          body?: string | null
          body_html?: string
          category?: string | null
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          edit_mode?: string
          headline?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          preview_text?: string | null
          slug?: string
          subject?: string
          tenant_id?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      finance_transactions: {
        Row: {
          amount: number
          category: string | null
          client_id: string | null
          created_at: string
          currency: string
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string
          stripe_payment_id: string | null
          tenant_id: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string | null
          client_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          stripe_payment_id?: string | null
          tenant_id: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          client_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          stripe_payment_id?: string | null
          tenant_id?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          due_at: string
          id: string
          lead_id: string | null
          notes: string | null
          person_id: string | null
          priority: string | null
          status: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          due_at: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          person_id?: string | null
          priority?: string | null
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          due_at?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          person_id?: string | null
          priority?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "crm_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      form_fields: {
        Row: {
          conditional_logic: Json | null
          created_at: string
          crm_field_name: string | null
          field_type: string
          form_id: string
          help_text: string | null
          id: string
          is_required: boolean
          label: string
          options: Json
          placeholder: string | null
          sort_order: number
          step: number
          tenant_id: string
          updated_at: string
          validation: Json
          width: string
        }
        Insert: {
          conditional_logic?: Json | null
          created_at?: string
          crm_field_name?: string | null
          field_type: string
          form_id: string
          help_text?: string | null
          id?: string
          is_required?: boolean
          label: string
          options?: Json
          placeholder?: string | null
          sort_order?: number
          step?: number
          tenant_id: string
          updated_at?: string
          validation?: Json
          width?: string
        }
        Update: {
          conditional_logic?: Json | null
          created_at?: string
          crm_field_name?: string | null
          field_type?: string
          form_id?: string
          help_text?: string | null
          id?: string
          is_required?: boolean
          label?: string
          options?: Json
          placeholder?: string | null
          sort_order?: number
          step?: number
          tenant_id?: string
          updated_at?: string
          validation?: Json
          width?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_fields_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          created_at: string
          crm_person_id: string | null
          data: Json
          form_id: string
          id: string
          referrer: string | null
          source: string | null
          status: string
          submitted_by: string | null
          submitter_email: string | null
          submitter_ip: unknown
          submitter_name: string | null
          tenant_id: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          crm_person_id?: string | null
          data?: Json
          form_id: string
          id?: string
          referrer?: string | null
          source?: string | null
          status?: string
          submitted_by?: string | null
          submitter_email?: string | null
          submitter_ip?: unknown
          submitter_name?: string | null
          tenant_id: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          crm_person_id?: string | null
          data?: Json
          form_id?: string
          id?: string
          referrer?: string | null
          source?: string | null
          status?: string
          submitted_by?: string | null
          submitter_email?: string | null
          submitter_ip?: unknown
          submitter_name?: string | null
          tenant_id?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_crm_person_id_fkey"
            columns: ["crm_person_id"]
            isOneToOne: false
            referencedRelation: "crm_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          form_type: string
          id: string
          is_archived: boolean
          is_published: boolean
          published_at: string | null
          settings: Json
          slug: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          form_type?: string
          id?: string
          is_archived?: boolean
          is_published?: boolean
          published_at?: string | null
          settings?: Json
          slug: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          form_type?: string
          id?: string
          is_archived?: boolean
          is_published?: boolean
          published_at?: string | null
          settings?: Json
          slug?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_review_links: {
        Row: {
          allow_comments: boolean
          allow_download: boolean
          created_at: string
          created_by: string
          cycle_id: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          link_name: string | null
          max_uses: number | null
          password_hash: string | null
          permissions: Json | null
          project_id: string | null
          require_email: boolean
          reviewer_email: string | null
          reviewer_name: string | null
          scope: Database["public"]["Enums"]["share_scope"]
          target_ids: string[]
          tenant_id: string
          token: string
          use_count: number | null
          video_id: string | null
        }
        Insert: {
          allow_comments?: boolean
          allow_download?: boolean
          created_at?: string
          created_by: string
          cycle_id?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          link_name?: string | null
          max_uses?: number | null
          password_hash?: string | null
          permissions?: Json | null
          project_id?: string | null
          require_email?: boolean
          reviewer_email?: string | null
          reviewer_name?: string | null
          scope?: Database["public"]["Enums"]["share_scope"]
          target_ids?: string[]
          tenant_id: string
          token?: string
          use_count?: number | null
          video_id?: string | null
        }
        Update: {
          allow_comments?: boolean
          allow_download?: boolean
          created_at?: string
          created_by?: string
          cycle_id?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          link_name?: string | null
          max_uses?: number | null
          password_hash?: string | null
          permissions?: Json | null
          project_id?: string | null
          require_email?: boolean
          reviewer_email?: string | null
          reviewer_name?: string | null
          scope?: Database["public"]["Enums"]["share_scope"]
          target_ids?: string[]
          tenant_id?: string
          token?: string
          use_count?: number | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_review_links_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_review_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_review_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_review_links_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          business_type: string | null
          call_attendance_confirmation: boolean
          content_language: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string
          follow_up_at: string | null
          goals_objectives: string | null
          id: string
          is_qualified: boolean
          last_name: string
          monthly_income_range: string | null
          notes: string | null
          obstacles: string | null
          person_id: string | null
          phone: string | null
          raw_payload: Json
          social_username: string | null
          status: string
          tenant_id: string
          ticket_size: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          business_type?: string | null
          call_attendance_confirmation?: boolean
          content_language?: string | null
          country?: string | null
          created_at?: string
          email: string
          first_name: string
          follow_up_at?: string | null
          goals_objectives?: string | null
          id?: string
          is_qualified?: boolean
          last_name: string
          monthly_income_range?: string | null
          notes?: string | null
          obstacles?: string | null
          person_id?: string | null
          phone?: string | null
          raw_payload?: Json
          social_username?: string | null
          status?: string
          tenant_id: string
          ticket_size?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          business_type?: string | null
          call_attendance_confirmation?: boolean
          content_language?: string | null
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string
          follow_up_at?: string | null
          goals_objectives?: string | null
          id?: string
          is_qualified?: boolean
          last_name?: string
          monthly_income_range?: string | null
          notes?: string | null
          obstacles?: string | null
          person_id?: string | null
          phone?: string | null
          raw_payload?: Json
          social_username?: string | null
          status?: string
          tenant_id?: string
          ticket_size?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "crm_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_custom_columns: {
        Row: {
          column_name: string
          column_type: string
          created_at: string
          created_by: string
          id: string
          order_index: number
          tenant_id: string
        }
        Insert: {
          column_name: string
          column_type?: string
          created_at?: string
          created_by: string
          id?: string
          order_index?: number
          tenant_id: string
        }
        Update: {
          column_name?: string
          column_type?: string
          created_at?: string
          created_by?: string
          id?: string
          order_index?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_custom_columns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_saved_views: {
        Row: {
          column_config: Json
          created_at: string
          id: string
          is_default: boolean
          tenant_id: string
          updated_at: string
          user_id: string
          view_name: string
        }
        Insert: {
          column_config?: Json
          created_at?: string
          id?: string
          is_default?: boolean
          tenant_id: string
          updated_at?: string
          user_id: string
          view_name: string
        }
        Update: {
          column_config?: Json
          created_at?: string
          id?: string
          is_default?: boolean
          tenant_id?: string
          updated_at?: string
          user_id?: string
          view_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_saved_views_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          id: string
          in_app_enabled: boolean
          notification_type: string
          push_enabled: boolean
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          notification_type: string
          push_enabled?: boolean
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          notification_type?: string
          push_enabled?: boolean
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["notification_priority"]
          read: boolean
          tenant_id: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          read?: boolean
          tenant_id: string
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          read?: boolean
          tenant_id?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_costs: {
        Row: {
          amount: number
          category: string
          created_at: string
          credentials_email: string | null
          credentials_password_hint: string | null
          currency: string
          id: string
          is_active: boolean
          is_recurring: boolean
          name: string
          next_payment_date: string | null
          notes: string | null
          recurrence_interval: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          credentials_email?: string | null
          credentials_password_hint?: string | null
          currency?: string
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          name: string
          next_payment_date?: string | null
          notes?: string | null
          recurrence_interval?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          credentials_email?: string | null
          credentials_password_hint?: string | null
          currency?: string
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          name?: string
          next_payment_date?: string | null
          notes?: string | null
          recurrence_interval?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operating_costs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      partnership_applications: {
        Row: {
          best_pieces: string | null
          client_accounts: string | null
          created_at: string
          email: string
          experience_years: string | null
          has_paying_clients: boolean | null
          has_sold_service: boolean | null
          id: string
          languages: string | null
          location: string | null
          name: string
          person_id: string | null
          phone: string | null
          portfolio_link: string | null
          role: string | null
          sold_service_explanation: string | null
          status: string
          target_audience: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          best_pieces?: string | null
          client_accounts?: string | null
          created_at?: string
          email: string
          experience_years?: string | null
          has_paying_clients?: boolean | null
          has_sold_service?: boolean | null
          id?: string
          languages?: string | null
          location?: string | null
          name: string
          person_id?: string | null
          phone?: string | null
          portfolio_link?: string | null
          role?: string | null
          sold_service_explanation?: string | null
          status?: string
          target_audience?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          best_pieces?: string | null
          client_accounts?: string | null
          created_at?: string
          email?: string
          experience_years?: string | null
          has_paying_clients?: boolean | null
          has_sold_service?: boolean | null
          id?: string
          languages?: string | null
          location?: string | null
          name?: string
          person_id?: string | null
          phone?: string | null
          portfolio_link?: string | null
          role?: string | null
          sold_service_explanation?: string | null
          status?: string
          target_audience?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partnership_applications_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "crm_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnership_applications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          is_active: boolean
          is_popular: boolean
          max_clients: number
          max_users: number
          name: string
          period: string
          price_cents: number
          slug: string
          sort_order: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          is_popular?: boolean
          max_clients?: number
          max_users?: number
          name: string
          period?: string
          price_cents?: number
          slug: string
          sort_order?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          is_popular?: boolean
          max_clients?: number
          max_users?: number
          name?: string
          period?: string
          price_cents?: number
          slug?: string
          sort_order?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          last_seen_at: string | null
          onboarding_completed: boolean | null
          phone: string | null
          preferences: Json | null
          requires_password_change: boolean
          tenant_id: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_seen_at?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          preferences?: Json | null
          requires_password_change?: boolean
          tenant_id?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_seen_at?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          preferences?: Json | null
          requires_password_change?: boolean
          tenant_id?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      project_type_templates: {
        Row: {
          config: Json | null
          created_at: string
          default_cadence: Database["public"]["Enums"]["project_cadence"] | null
          default_posting_days: string[] | null
          default_video_count: number | null
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_active: boolean | null
          slug: string
          sort_order: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          default_cadence?:
            | Database["public"]["Enums"]["project_cadence"]
            | null
          default_posting_days?: string[] | null
          default_video_count?: number | null
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          slug: string
          sort_order?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          default_cadence?:
            | Database["public"]["Enums"]["project_cadence"]
            | null
          default_posting_days?: string[] | null
          default_video_count?: number | null
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          slug?: string
          sort_order?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_type_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          archived_at: string | null
          cadence: Database["public"]["Enums"]["project_cadence"]
          client_id: string
          created_at: string
          current_cycle: number
          cycle_completed_at: string | null
          end_date: string | null
          id: string
          notes: string | null
          posting_days: string[] | null
          progress: number | null
          project_name: string
          project_type_template_id: string | null
          raw_footage_notes: string | null
          settings: Json | null
          sort_preference: string | null
          start_date: string
          status: Database["public"]["Enums"]["project_status"]
          tenant_id: string
          updated_at: string
          video_count: number
          videos_completed: number
        }
        Insert: {
          archived_at?: string | null
          cadence?: Database["public"]["Enums"]["project_cadence"]
          client_id: string
          created_at?: string
          current_cycle?: number
          cycle_completed_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          posting_days?: string[] | null
          progress?: number | null
          project_name: string
          project_type_template_id?: string | null
          raw_footage_notes?: string | null
          settings?: Json | null
          sort_preference?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["project_status"]
          tenant_id: string
          updated_at?: string
          video_count?: number
          videos_completed?: number
        }
        Update: {
          archived_at?: string | null
          cadence?: Database["public"]["Enums"]["project_cadence"]
          client_id?: string
          created_at?: string
          current_cycle?: number
          cycle_completed_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          posting_days?: string[] | null
          progress?: number | null
          project_name?: string
          project_type_template_id?: string | null
          raw_footage_notes?: string | null
          settings?: Json | null
          sort_preference?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["project_status"]
          tenant_id?: string
          updated_at?: string
          video_count?: number
          videos_completed?: number
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_project_type_template_id_fkey"
            columns: ["project_type_template_id"]
            isOneToOne: false
            referencedRelation: "project_type_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          created_at: string | null
          device_label: string | null
          endpoint: string
          id: string
          last_push_at: string | null
          last_push_status: string | null
          last_seen_at: string | null
          subscription: Json
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_label?: string | null
          endpoint: string
          id?: string
          last_push_at?: string | null
          last_push_status?: string | null
          last_seen_at?: string | null
          subscription: Json
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_label?: string | null
          endpoint?: string
          id?: string
          last_push_at?: string | null
          last_push_status?: string | null
          last_seen_at?: string | null
          subscription?: Json
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_filter_views: {
        Row: {
          created_at: string
          filters: Json
          id: string
          is_default: boolean
          is_shared: boolean
          name: string
          page: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          is_default?: boolean
          is_shared?: boolean
          name: string
          page: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          is_default?: boolean
          is_shared?: boolean
          name?: string
          page?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_filter_views_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      status_role_permissions: {
        Row: {
          can_set: boolean | null
          can_transition_from: boolean | null
          can_transition_to: boolean | null
          can_view: boolean | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          status_id: string
          tenant_id: string
        }
        Insert: {
          can_set?: boolean | null
          can_transition_from?: boolean | null
          can_transition_to?: boolean | null
          can_view?: boolean | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          status_id: string
          tenant_id: string
        }
        Update: {
          can_set?: boolean | null
          can_transition_from?: boolean | null
          can_transition_to?: boolean | null
          can_view?: boolean | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_role_permissions_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_role_permissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      statuses: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_client_visible: boolean | null
          is_default: boolean | null
          slug: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_client_visible?: boolean | null
          is_default?: boolean | null
          slug: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_client_visible?: boolean | null
          is_default?: boolean | null
          slug?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "statuses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_charges: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          currency: string
          customer_email: string | null
          description: string | null
          fee: number
          id: string
          net: number
          receipt_url: string | null
          status: string
          stripe_charge_id: string
          stripe_created_at: string | null
          stripe_customer_id: string | null
          synced_at: string
          tenant_id: string
        }
        Insert: {
          amount?: number
          client_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          description?: string | null
          fee?: number
          id?: string
          net?: number
          receipt_url?: string | null
          status?: string
          stripe_charge_id: string
          stripe_created_at?: string | null
          stripe_customer_id?: string | null
          synced_at?: string
          tenant_id: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          description?: string | null
          fee?: number
          id?: string
          net?: number
          receipt_url?: string | null
          status?: string
          stripe_charge_id?: string
          stripe_created_at?: string | null
          stripe_customer_id?: string | null
          synced_at?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_charges_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_charges_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_events_log: {
        Row: {
          event_type: string
          id: string
          processed_at: string
          stripe_event_id: string
          tenant_id: string
        }
        Insert: {
          event_type: string
          id?: string
          processed_at?: string
          stripe_event_id: string
          tenant_id: string
        }
        Update: {
          event_type?: string
          id?: string
          processed_at?: string
          stripe_event_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_events_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_subscriptions: {
        Row: {
          amount: number
          canceled_at: string | null
          client_id: string | null
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          customer_email: string | null
          id: string
          interval: string
          plan_name: string | null
          status: string
          stripe_created_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string
          synced_at: string
          tenant_id: string
        }
        Insert: {
          amount?: number
          canceled_at?: string | null
          client_id?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_email?: string | null
          id?: string
          interval?: string
          plan_name?: string | null
          status?: string
          stripe_created_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id: string
          synced_at?: string
          tenant_id: string
        }
        Update: {
          amount?: number
          canceled_at?: string | null
          client_id?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_email?: string | null
          id?: string
          interval?: string
          plan_name?: string | null
          status?: string
          stripe_created_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string
          synced_at?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_hooks: {
        Row: {
          category: string | null
          client_id: string
          created_at: string
          created_by: string | null
          hook_text: string
          id: string
          source: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          hook_text: string
          id?: string
          source?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          hook_text?: string
          id?: string
          source?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_hooks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_hooks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_scripts: {
        Row: {
          body: string | null
          body_json: Json | null
          client_id: string
          created_at: string
          created_by: string | null
          cycle_id: string | null
          filmed: boolean
          id: string
          on_camera: string | null
          order_index: number
          script_type: string | null
          status: string | null
          tenant_id: string
          title: string
          updated_at: string
          video_type: string | null
        }
        Insert: {
          body?: string | null
          body_json?: Json | null
          client_id: string
          created_at?: string
          created_by?: string | null
          cycle_id?: string | null
          filmed?: boolean
          id?: string
          on_camera?: string | null
          order_index?: number
          script_type?: string | null
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string
          video_type?: string | null
        }
        Update: {
          body?: string | null
          body_json?: Json | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          cycle_id?: string | null
          filmed?: boolean
          id?: string
          on_camera?: string | null
          order_index?: number
          script_type?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
          video_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "studio_scripts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_scripts_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_scripts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_templates: {
        Row: {
          created_at: string
          emoji: string
          id: string
          name: string
          questions: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          id?: string
          name: string
          questions?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          name?: string
          questions?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          linked_entity_id: string | null
          linked_entity_type: string | null
          priority: string | null
          status: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          priority?: string | null
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          priority?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      team_chat_members: {
        Row: {
          joined_at: string
          room_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          room_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          room_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_chat_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "team_chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_chat_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      team_chat_rooms: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_chat_rooms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          archived_at: string | null
          brand_colors: Json | null
          created_at: string
          domain: string | null
          id: string
          is_platform_tenant: boolean
          logo_url: string | null
          max_clients: number | null
          max_users: number | null
          name: string
          owner_email: string | null
          plan: string | null
          settings: Json | null
          slug: string
          status: string
          trial_ends_at: string | null
          updated_at: string
          video_column_labels: Json
        }
        Insert: {
          archived_at?: string | null
          brand_colors?: Json | null
          created_at?: string
          domain?: string | null
          id?: string
          is_platform_tenant?: boolean
          logo_url?: string | null
          max_clients?: number | null
          max_users?: number | null
          name: string
          owner_email?: string | null
          plan?: string | null
          settings?: Json | null
          slug: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          video_column_labels?: Json
        }
        Update: {
          archived_at?: string | null
          brand_colors?: Json | null
          created_at?: string
          domain?: string | null
          id?: string
          is_platform_tenant?: boolean
          logo_url?: string | null
          max_clients?: number | null
          max_users?: number | null
          name?: string
          owner_email?: string | null
          plan?: string | null
          settings?: Json | null
          slug?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          video_column_labels?: Json
        }
        Relationships: []
      }
      thumbnail_versions: {
        Row: {
          created_at: string
          id: string
          is_current: boolean | null
          tenant_id: string
          thumbnail_storage_path: string
          thumbnail_url: string
          uploaded_at: string | null
          uploaded_by: string | null
          version_notes: string | null
          version_number: number
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_current?: boolean | null
          tenant_id: string
          thumbnail_storage_path: string
          thumbnail_url: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          version_notes?: string | null
          version_number?: number
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_current?: boolean | null
          tenant_id?: string
          thumbnail_storage_path?: string
          thumbnail_url?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          version_notes?: string | null
          version_number?: number
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thumbnail_versions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thumbnail_versions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_reels: {
        Row: {
          created_at: string
          created_by: string | null
          hook_cloudflare_id: string | null
          hook_description: string | null
          hook_duration: number | null
          hook_file_name: string | null
          hook_file_size: number | null
          hook_playback_url: string | null
          hook_thumbnail_url: string | null
          hook_upload_status:
            | Database["public"]["Enums"]["upload_status"]
            | null
          id: string
          is_active: boolean | null
          is_winner: boolean | null
          tenant_id: string
          trial_date: string | null
          trial_number: number
          updated_at: string
          version_id: string | null
          video_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          hook_cloudflare_id?: string | null
          hook_description?: string | null
          hook_duration?: number | null
          hook_file_name?: string | null
          hook_file_size?: number | null
          hook_playback_url?: string | null
          hook_thumbnail_url?: string | null
          hook_upload_status?:
            | Database["public"]["Enums"]["upload_status"]
            | null
          id?: string
          is_active?: boolean | null
          is_winner?: boolean | null
          tenant_id: string
          trial_date?: string | null
          trial_number?: number
          updated_at?: string
          version_id?: string | null
          video_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          hook_cloudflare_id?: string | null
          hook_description?: string | null
          hook_duration?: number | null
          hook_file_name?: string | null
          hook_file_size?: number | null
          hook_playback_url?: string | null
          hook_thumbnail_url?: string | null
          hook_upload_status?:
            | Database["public"]["Enums"]["upload_status"]
            | null
          id?: string
          is_active?: boolean | null
          is_winner?: boolean | null
          tenant_id?: string
          trial_date?: string | null
          trial_number?: number
          updated_at?: string
          version_id?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trial_reels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_reels_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "video_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_reels_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          file_name: string
          file_size: number
          id: string
          mime_type: string
          overall_status: string
          r2_error: string | null
          r2_key: string | null
          r2_parts_completed: number
          r2_parts_total: number
          r2_progress: number
          r2_status: string
          r2_upload_id: string | null
          started_at: string | null
          stream_error: string | null
          stream_media_id: string | null
          stream_progress: number
          stream_status: string
          stream_upload_url: string | null
          tenant_id: string
          updated_at: string
          version_id: string
          video_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          file_name: string
          file_size: number
          id?: string
          mime_type: string
          overall_status?: string
          r2_error?: string | null
          r2_key?: string | null
          r2_parts_completed?: number
          r2_parts_total?: number
          r2_progress?: number
          r2_status?: string
          r2_upload_id?: string | null
          started_at?: string | null
          stream_error?: string | null
          stream_media_id?: string | null
          stream_progress?: number
          stream_status?: string
          stream_upload_url?: string | null
          tenant_id: string
          updated_at?: string
          version_id: string
          video_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          file_name?: string
          file_size?: number
          id?: string
          mime_type?: string
          overall_status?: string
          r2_error?: string | null
          r2_key?: string | null
          r2_parts_completed?: number
          r2_parts_total?: number
          r2_progress?: number
          r2_status?: string
          r2_upload_id?: string | null
          started_at?: string | null
          stream_error?: string | null
          stream_media_id?: string | null
          stream_progress?: number
          stream_status?: string
          stream_upload_url?: string | null
          tenant_id?: string
          updated_at?: string
          version_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upload_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upload_sessions_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "video_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upload_sessions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_annotations: {
        Row: {
          annotation_data: Json
          comment_id: string | null
          created_at: string
          frame_thumbnail: string | null
          frame_timestamp: number
          id: string
          tenant_id: string
          updated_at: string
          version_id: string | null
          video_id: string
        }
        Insert: {
          annotation_data: Json
          comment_id?: string | null
          created_at?: string
          frame_thumbnail?: string | null
          frame_timestamp: number
          id?: string
          tenant_id: string
          updated_at?: string
          version_id?: string | null
          video_id: string
        }
        Update: {
          annotation_data?: Json
          comment_id?: string | null
          created_at?: string
          frame_thumbnail?: string | null
          frame_timestamp?: number
          id?: string
          tenant_id?: string
          updated_at?: string
          version_id?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_annotations_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "video_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_annotations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_annotations_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "video_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_annotations_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_comments: {
        Row: {
          comment: string
          comment_type: string | null
          created_at: string
          guest_email: string | null
          guest_name: string | null
          id: string
          is_internal: boolean | null
          mentioned_user_ids: string[]
          parent_comment_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          tenant_id: string
          timestamp_end_seconds: number | null
          timestamp_seconds: number | null
          updated_at: string
          user_id: string | null
          version_id: string | null
          video_id: string
        }
        Insert: {
          comment: string
          comment_type?: string | null
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          is_internal?: boolean | null
          mentioned_user_ids?: string[]
          parent_comment_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          tenant_id: string
          timestamp_end_seconds?: number | null
          timestamp_seconds?: number | null
          updated_at?: string
          user_id?: string | null
          version_id?: string | null
          video_id: string
        }
        Update: {
          comment?: string
          comment_type?: string | null
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          is_internal?: boolean | null
          mentioned_user_ids?: string[]
          parent_comment_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          tenant_id?: string
          timestamp_end_seconds?: number | null
          timestamp_seconds?: number | null
          updated_at?: string
          user_id?: string | null
          version_id?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "video_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_comments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_comments_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "video_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_editors: {
        Row: {
          assigned_by: string | null
          client_id: string | null
          created_at: string
          editor_id: string
          id: string
          project_id: string | null
          tenant_id: string
          video_id: string | null
        }
        Insert: {
          assigned_by?: string | null
          client_id?: string | null
          created_at?: string
          editor_id: string
          id?: string
          project_id?: string | null
          tenant_id: string
          video_id?: string | null
        }
        Update: {
          assigned_by?: string | null
          client_id?: string | null
          created_at?: string
          editor_id?: string
          id?: string
          project_id?: string | null
          tenant_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_editors_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_editors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_editors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_editors_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          new_status: string
          old_status: string | null
          tenant_id: string
          video_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status: string
          old_status?: string | null
          tenant_id: string
          video_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status?: string
          old_status?: string | null
          tenant_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_status_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_status_history_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_types: {
        Row: {
          created_at: string
          display_name: string
          icon: string | null
          id: string
          is_active: boolean | null
          slug: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          slug: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          slug?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      video_versions: {
        Row: {
          created_at: string
          custom_version_label: string | null
          id: string
          is_current: boolean | null
          r2_file_size: number | null
          r2_storage_key: string | null
          r2_storage_url: string | null
          stream_ready: boolean
          tenant_id: string
          transcript: string | null
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string | null
          version_notes: string | null
          version_number: number
          version_type: string
          video_cloudflare_id: string | null
          video_duration: number | null
          video_file_name: string | null
          video_file_size: number | null
          video_height: number | null
          video_id: string
          video_original_storage_path: string | null
          video_original_url: string | null
          video_playback_url: string | null
          video_thumbnail_url: string | null
          video_upload_progress: number | null
          video_upload_status:
            | Database["public"]["Enums"]["upload_status"]
            | null
          video_width: number | null
        }
        Insert: {
          created_at?: string
          custom_version_label?: string | null
          id?: string
          is_current?: boolean | null
          r2_file_size?: number | null
          r2_storage_key?: string | null
          r2_storage_url?: string | null
          stream_ready?: boolean
          tenant_id: string
          transcript?: string | null
          updated_at?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          version_notes?: string | null
          version_number?: number
          version_type?: string
          video_cloudflare_id?: string | null
          video_duration?: number | null
          video_file_name?: string | null
          video_file_size?: number | null
          video_height?: number | null
          video_id: string
          video_original_storage_path?: string | null
          video_original_url?: string | null
          video_playback_url?: string | null
          video_thumbnail_url?: string | null
          video_upload_progress?: number | null
          video_upload_status?:
            | Database["public"]["Enums"]["upload_status"]
            | null
          video_width?: number | null
        }
        Update: {
          created_at?: string
          custom_version_label?: string | null
          id?: string
          is_current?: boolean | null
          r2_file_size?: number | null
          r2_storage_key?: string | null
          r2_storage_url?: string | null
          stream_ready?: boolean
          tenant_id?: string
          transcript?: string | null
          updated_at?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          version_notes?: string | null
          version_number?: number
          version_type?: string
          video_cloudflare_id?: string | null
          video_duration?: number | null
          video_file_name?: string | null
          video_file_size?: number | null
          video_height?: number | null
          video_id?: string
          video_original_storage_path?: string | null
          video_original_url?: string | null
          video_playback_url?: string | null
          video_thumbnail_url?: string | null
          video_upload_progress?: number | null
          video_upload_status?:
            | Database["public"]["Enums"]["upload_status"]
            | null
          video_width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_versions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_versions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          archived_at: string | null
          aspect_ratio: string | null
          caption: string | null
          caption_approved: boolean | null
          caption_context: string | null
          client_id: string
          created_at: string
          created_by: string | null
          cycle_id: string | null
          detected_language: string | null
          freebie_content: string | null
          freebie_word: string | null
          id: string
          notes: string | null
          order_index: number | null
          post_date: string | null
          priority: Database["public"]["Enums"]["content_priority"]
          project_id: string | null
          status_id: string | null
          tenant_id: string
          text_hook: string | null
          thumbnail_storage_path: string | null
          thumbnail_text: string | null
          transcript: string | null
          transcription_status: string | null
          trial_date: string | null
          updated_at: string
          video_cloudflare_id: string | null
          video_duration: number | null
          video_error_message: string | null
          video_file_name: string | null
          video_file_size: number | null
          video_height: number | null
          video_original_storage_path: string | null
          video_original_url: string | null
          video_playback_url: string | null
          video_thumbnail_url: string | null
          video_title: string
          video_type_id: string | null
          video_upload_progress: number | null
          video_upload_status:
            | Database["public"]["Enums"]["upload_status"]
            | null
          video_uploaded_at: string | null
          video_uploaded_by: string | null
          video_width: number | null
        }
        Insert: {
          archived_at?: string | null
          aspect_ratio?: string | null
          caption?: string | null
          caption_approved?: boolean | null
          caption_context?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          cycle_id?: string | null
          detected_language?: string | null
          freebie_content?: string | null
          freebie_word?: string | null
          id?: string
          notes?: string | null
          order_index?: number | null
          post_date?: string | null
          priority?: Database["public"]["Enums"]["content_priority"]
          project_id?: string | null
          status_id?: string | null
          tenant_id: string
          text_hook?: string | null
          thumbnail_storage_path?: string | null
          thumbnail_text?: string | null
          transcript?: string | null
          transcription_status?: string | null
          trial_date?: string | null
          updated_at?: string
          video_cloudflare_id?: string | null
          video_duration?: number | null
          video_error_message?: string | null
          video_file_name?: string | null
          video_file_size?: number | null
          video_height?: number | null
          video_original_storage_path?: string | null
          video_original_url?: string | null
          video_playback_url?: string | null
          video_thumbnail_url?: string | null
          video_title: string
          video_type_id?: string | null
          video_upload_progress?: number | null
          video_upload_status?:
            | Database["public"]["Enums"]["upload_status"]
            | null
          video_uploaded_at?: string | null
          video_uploaded_by?: string | null
          video_width?: number | null
        }
        Update: {
          archived_at?: string | null
          aspect_ratio?: string | null
          caption?: string | null
          caption_approved?: boolean | null
          caption_context?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          cycle_id?: string | null
          detected_language?: string | null
          freebie_content?: string | null
          freebie_word?: string | null
          id?: string
          notes?: string | null
          order_index?: number | null
          post_date?: string | null
          priority?: Database["public"]["Enums"]["content_priority"]
          project_id?: string | null
          status_id?: string | null
          tenant_id?: string
          text_hook?: string | null
          thumbnail_storage_path?: string | null
          thumbnail_text?: string | null
          transcript?: string | null
          transcription_status?: string | null
          trial_date?: string | null
          updated_at?: string
          video_cloudflare_id?: string | null
          video_duration?: number | null
          video_error_message?: string | null
          video_file_name?: string | null
          video_file_size?: number | null
          video_height?: number | null
          video_original_storage_path?: string | null
          video_original_url?: string | null
          video_playback_url?: string | null
          video_thumbnail_url?: string | null
          video_title?: string
          video_type_id?: string | null
          video_upload_progress?: number | null
          video_upload_status?:
            | Database["public"]["Enums"]["upload_status"]
            | null
          video_uploaded_at?: string | null
          video_uploaded_by?: string | null
          video_width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_video_type_id_fkey"
            columns: ["video_type_id"]
            isOneToOne: false
            referencedRelation: "video_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_role: {
        Args: { _manager_id: string; _target_id: string }
        Returns: boolean
      }
      cleanup_stale_upload_sessions: { Args: never; Returns: undefined }
      delete_chat_room: { Args: { _room_id: string }; Returns: undefined }
      exec_sql: { Args: { query: string }; Returns: undefined }
      generate_client_slug: { Args: { input_name: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_owner_or_manager: { Args: { _user_id: string }; Returns: boolean }
      is_platform_admin: { Args: { uid: string }; Returns: boolean }
      role_hierarchy_level: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: number
      }
      seed_tenant_defaults: { Args: { _tenant_id: string }; Returns: undefined }
      submit_public_form: {
        Args: {
          p_data: Json
          p_form_id: string
          p_submitter_email?: string
          p_submitter_name?: string
          p_tenant_id: string
        }
        Returns: string
      }
      tenant_id_for_user: { Args: { _user_id: string }; Returns: string }
      user_can_access_chat_room: {
        Args: { _room_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      account_status: "active" | "paused" | "churned" | "trial" | "onboarding"
      app_role:
        | "owner"
        | "manager"
        | "senior_editor"
        | "content_creator"
        | "editor"
        | "moderator"
        | "closer"
        | "client"
      content_priority: "low" | "medium" | "high" | "urgent"
      notification_priority: "low" | "normal" | "high" | "urgent"
      notification_type:
        | "info"
        | "success"
        | "warning"
        | "error"
        | "mention"
        | "comment"
        | "status_change"
        | "assignment"
        | "approval"
        | "chat"
        | "task"
        | "payment"
      project_cadence:
        | "one_time"
        | "weekly"
        | "bi_weekly"
        | "monthly"
        | "custom"
        | "quarterly"
      project_status:
        | "not_started"
        | "in_progress"
        | "completed"
        | "on_hold"
        | "cancelled"
        | "review"
      share_scope: "video" | "videos" | "cycle"
      upload_status: "pending" | "uploading" | "processing" | "ready" | "error"
      workspace_type:
        | "individual"
        | "company"
        | "team"
        | "agency"
        | "enterprise"
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
      account_status: ["active", "paused", "churned", "trial", "onboarding"],
      app_role: [
        "owner",
        "manager",
        "senior_editor",
        "content_creator",
        "editor",
        "moderator",
        "closer",
        "client",
      ],
      content_priority: ["low", "medium", "high", "urgent"],
      notification_priority: ["low", "normal", "high", "urgent"],
      notification_type: [
        "info",
        "success",
        "warning",
        "error",
        "mention",
        "comment",
        "status_change",
        "assignment",
        "approval",
        "chat",
        "task",
        "payment",
      ],
      project_cadence: [
        "one_time",
        "weekly",
        "bi_weekly",
        "monthly",
        "custom",
        "quarterly",
      ],
      project_status: [
        "not_started",
        "in_progress",
        "completed",
        "on_hold",
        "cancelled",
        "review",
      ],
      share_scope: ["video", "videos", "cycle"],
      upload_status: ["pending", "uploading", "processing", "ready", "error"],
      workspace_type: ["individual", "company", "team", "agency", "enterprise"],
    },
  },
} as const

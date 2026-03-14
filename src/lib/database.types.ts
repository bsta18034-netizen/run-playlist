export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      playlist_history: {
        Row: {
          id: string;
          created_at: string;
          duration_minutes: number;
          bpm_mode: string;
          bpm_value: number;
          genre: string;
          mood: string;
          favorite_artist: string;
          tracks: Json;
          total_seconds: number;
          target_seconds: number;
          comment: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          duration_minutes: number;
          bpm_mode: string;
          bpm_value: number;
          genre: string;
          mood: string;
          favorite_artist?: string;
          tracks: Json;
          total_seconds: number;
          target_seconds: number;
          comment?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          duration_minutes?: number;
          bpm_mode?: string;
          bpm_value?: number;
          genre?: string;
          mood?: string;
          favorite_artist?: string;
          tracks?: Json;
          total_seconds?: number;
          target_seconds?: number;
          comment?: string;
          user_id?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

/**
 * Supabase Database Types
 *
 * This file contains TypeScript type definitions for the Supabase database schema.
 * Regenerate using: npm run db:generate
 *
 * Note: This is a minimal placeholder. Run the generate script to get full types:
 * npm run db:generate (requires SUPABASE_PROJECT_ID env var)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Database schema type definition
 *
 * This is a minimal placeholder that allows the application to build.
 * For full type safety, generate types from your Supabase project:
 *
 * 1. Set SUPABASE_PROJECT_ID environment variable
 * 2. Run: npm run db:generate
 */
export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: string;
    };
    CompositeTypes: {
      [key: string]: Record<string, unknown>;
    };
  };
}

import { createClient } from './client';

// Create a typed client for admin operations
// This helps avoid TypeScript issues with Supabase's generic types
export function createAdminClient() {
  return createClient() as any;
}
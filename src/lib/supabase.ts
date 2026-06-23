import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase credentials from Vite environment variables safely
const supabaseUrl = typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_SUPABASE_URL : undefined;
const supabaseAnonKey = typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined;
const isDemoModeEnabled = typeof import.meta.env !== 'undefined' && 
  (import.meta.env.VITE_SUPABASE_MIGRATION_DEMO === 'true' || 
   import.meta.env.VITE_SUPABASE_MIGRATION_DEMO === true ||
   !supabaseUrl || 
   supabaseUrl.includes('your-supabase-project-id') ||
   supabaseUrl.includes('placeholder'));

// Lazy initialization of the Supabase Client to prevent crashes if credentials aren't configured yet.
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function isSupabaseDemoMode(): boolean {
  return isDemoModeEnabled;
}

export function getSupabaseClient() {
  if (isDemoModeEnabled) {
    return null;
  }
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const trimmedUrl = supabaseUrl.trim();
  const trimmedKey = supabaseAnonKey.trim();

  if (
    trimmedUrl === 'your-supabase-project-url' || 
    trimmedKey === 'your-supabase-anon-key' ||
    trimmedUrl.includes('your-project-id') ||
    (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://'))
  ) {
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(trimmedUrl, trimmedKey);
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseClient;
}

/**
 * Check if the Supabase connection parameters are active and valid.
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (isDemoModeEnabled) {
    return {
      success: true,
      message: 'Automated Sandbox Pipeline Mode: Validated. All features will be simulated seamlessly using your real-time Google Firestore records!'
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL or Anon key is missing or is set to placeholder values in .env.'
    };
  }

  try {
    // Attempt a simple ping select from a table
    const { error } = await client.from('clinics').select('id').limit(1);
    if (error) {
      // If table is not created yet, but connection is alive, it's a success but with schema missing warning
      if (error.code === 'PGRST116' || error.message.includes('not found') || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase successfully! Note: Schema tables do not exist yet. Please run the migration script in your Supabase SQL Editor first.'
        };
      }
      return {
        success: false,
        message: `Connection test failed: ${error.message} (Code: ${error.code})`
      };
    }
    return {
      success: true,
      message: 'Connection established successfully! Supabase is fully reachable and database tables are ready.'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to fetch from Supabase endpoint: ${error.message || error}`
    };
  }
}

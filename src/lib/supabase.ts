import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client (API Routes 専用)
 * 環境変数が未設定の場合は null を返す。
 */
export function createServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

/**
 * Browser-side Supabase client (Client Components 専用)
 * anon key を使用。RLS で保護すること。
 */
let browserClient: ReturnType<typeof createClient> | null = null;
export function createBrowserClient() {
  if (browserClient) return browserClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  browserClient = createClient(url, key);
  return browserClient;
}

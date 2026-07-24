import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getAuthConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.startsWith("PUT_YOUR") || anonKey.startsWith("PUT_YOUR")) {
    throw new Error(
      "Supabase Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return { url, anonKey };
}

/** Reads the authenticated Supabase user from the secure session cookie. */
export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const { url, anonKey } = getAuthConfig();
  const client = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {
        // Route handlers refresh cookies. Server components only need to read them.
      },
    },
  });

  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  return user;
}

export function getSupabaseAuthConfig() {
  return getAuthConfig();
}

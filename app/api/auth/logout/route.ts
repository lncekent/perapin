import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAuthConfig } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { url, anonKey } = getSupabaseAuthConfig();
  const response = NextResponse.json({ success: true });
  const client = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) =>
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });
  await client.auth.signOut();
  return response;
}

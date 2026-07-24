import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAuthConfig } from "@/lib/auth";
import { dbGetUserById, dbUpdateLastLogin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();
    if (!email || !/^\d{6}$/.test(token || "")) {
      return NextResponse.json(
        { error: "Enter the six-digit verification code." },
        { status: 400 },
      );
    }

    const { url, anonKey } = getSupabaseAuthConfig();
    const response = NextResponse.json({ success: true });
    const client = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) =>
          cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    });
    const { data, error } = await client.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: "email",
    });
    if (error || !data.user)
      return NextResponse.json(
        { error: error?.message || "Verification failed." },
        { status: 400 },
      );

    const profile = await dbGetUserById(data.user.id);
    if (profile) await dbUpdateLastLogin(profile.id);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to verify code." },
      { status: 500 },
    );
  }
}

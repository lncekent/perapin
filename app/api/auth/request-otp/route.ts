import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAuthConfig } from "@/lib/auth";
import { dbGetUserByEmail } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email, createUser = false } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Registration intent (createUser=true): block emails that already have a
    // PeraPin profile so a duplicate account can't be started. This must happen
    // before sending an OTP — otherwise an existing user is silently signed in
    // instead of being told the email is taken. Login (createUser=false) is
    // unaffected and still allows existing users through.
    if (createUser) {
      const existing = await dbGetUserByEmail(normalizedEmail);
      if (existing) {
        return NextResponse.json(
          {
            error: "This email is already registered. Please sign in instead.",
            code: "EMAIL_TAKEN",
          },
          { status: 409 },
        );
      }
    }

    const { url, anonKey } = getSupabaseAuthConfig();
    const client = createClient(url, anonKey, { auth: { persistSession: false } });
    const { error } = await client.auth.signInWithOtp({
      email: normalizedEmail,
      options: { shouldCreateUser: Boolean(createUser) },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send verification code." },
      { status: 500 },
    );
  }
}

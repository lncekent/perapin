import { NextRequest, NextResponse } from "next/server";
import { dbMarkOnboardingCompleted } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * POST /api/user/onboarding
 * Marks the current user's onboarding as completed in the database.
 * This ensures the onboarding modal never shows again across devices/sessions.
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

    await dbMarkOnboardingCompleted(authUser.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update onboarding status: " + error.message },
      { status: 500 },
    );
  }
}

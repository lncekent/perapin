import { NextRequest, NextResponse } from "next/server";
import { dbGetUserById } from "@/lib/supabase";
import { getWalletBalanceXlm, checkIsLockedOnChain } from "@/lib/stellar";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * Returns only the signed-in user's profile, current XLM balance, and lockout status.
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    const user = await dbGetUserById(authUser.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch live Horizon balance and contract lockout state
    const balanceXlm = await getWalletBalanceXlm(user.stellar_public_key);
    const isLocked = await checkIsLockedOnChain(user.stellar_public_key);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        businessName: user.business_name,
        stellarPublicKey: user.stellar_public_key,
        createdAt: user.created_at,
      },
      balanceXlm,
      isLocked,
      pinSetupRequired: user.role === "consumer" && !user.pin_registered_at,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch user profile: " + error.message },
      { status: 500 },
    );
  }
}

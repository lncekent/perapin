import { NextRequest, NextResponse } from "next/server";
import { dbGetUserByPublicKey, dbGetUserByEmail } from "@/lib/supabase";
import { getWalletBalanceXlm, checkIsLockedOnChain } from "@/lib/stellar";

/**
 * GET /api/user/me?publicKey=... OR ?email=...
 * Returns user profile, current XLM balance from Stellar Horizon, and on-chain lockout status.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publicKey = searchParams.get("publicKey");
    const email = searchParams.get("email");

    if (!publicKey && !email) {
      return NextResponse.json(
        { error: "Provide either publicKey or email search param" },
        { status: 400 }
      );
    }

    let user = publicKey
      ? await dbGetUserByPublicKey(publicKey)
      : await dbGetUserByEmail(email!);

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
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch user profile: " + error.message },
      { status: 500 }
    );
  }
}

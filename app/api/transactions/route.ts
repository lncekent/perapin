import { NextRequest, NextResponse } from "next/server";
import { dbGetTransactionsForUser, dbGetUserById } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * Returns transaction history only for the signed-in user's wallet.
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    const user = await dbGetUserById(authUser.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const txs = await dbGetTransactionsForUser(user.stellar_public_key);

    return NextResponse.json({
      success: true,
      transactions: txs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch transaction history: " + error.message },
      { status: 500 },
    );
  }
}

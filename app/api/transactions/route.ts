import { NextRequest, NextResponse } from "next/server";
import { dbGetTransactionsForUser } from "@/lib/supabase";

/**
 * GET /api/transactions?publicKey=...
 * Returns transaction history for a user wallet.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publicKey = searchParams.get("publicKey");

    if (!publicKey) {
      return NextResponse.json(
        { error: "Missing required query parameter: publicKey" },
        { status: 400 }
      );
    }

    const txs = await dbGetTransactionsForUser(publicKey);

    return NextResponse.json({
      success: true,
      transactions: txs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch transaction history: " + error.message },
      { status: 500 }
    );
  }
}

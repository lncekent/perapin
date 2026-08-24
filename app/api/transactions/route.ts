import { NextRequest, NextResponse } from "next/server";
import { dbGetTransactionsForUser, dbGetUserById, dbGetUsersByIds } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * Returns enriched transaction history for the signed-in user.
 * Each transaction includes counterparty info (name, email, wallet)
 * and direction (sent/received) relative to the current user.
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    const user = await dbGetUserById(authUser.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const txs = await dbGetTransactionsForUser(user.stellar_public_key);

    // Collect all unique counterparty user IDs for batch resolution
    const counterpartyIds = new Set<string>();
    for (const tx of txs) {
      if (tx.from_user_id && tx.from_user_id !== user.id) counterpartyIds.add(tx.from_user_id);
      if (tx.to_user_id && tx.to_user_id !== user.id) counterpartyIds.add(tx.to_user_id);
    }

    // Batch fetch all counterparty users in one query
    const counterpartyUsers = await dbGetUsersByIds(Array.from(counterpartyIds));
    const userMap = new Map(counterpartyUsers.map((u) => [u.id, u]));

    // Enrich transactions with counterparty info and direction
    const enrichedTxs = txs.map((tx) => {
      const isReceived = tx.to_public_key === user.stellar_public_key;
      const counterpartyId = isReceived ? tx.from_user_id : tx.to_user_id;
      const counterpartyUser = counterpartyId ? userMap.get(counterpartyId) : null;

      return {
        id: tx.id,
        stellar_tx_hash: tx.stellar_tx_hash,
        amount_xlm: tx.amount_xlm,
        status: tx.status,
        created_at: tx.created_at,
        from_public_key: tx.from_public_key,
        to_public_key: tx.to_public_key,
        direction: isReceived ? "received" : "sent",
        counterparty: counterpartyUser
          ? {
              name: counterpartyUser.full_name || null,
              email: counterpartyUser.email,
              wallet: isReceived ? tx.from_public_key : tx.to_public_key,
            }
          : {
              name: null,
              email: null,
              wallet: isReceived ? tx.from_public_key : tx.to_public_key,
            },
      };
    });

    return NextResponse.json({
      success: true,
      transactions: enrichedTxs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch transaction history: " + error.message },
      { status: 500 },
    );
  }
}

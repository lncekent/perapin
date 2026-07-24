import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { decryptPrivateKey } from "@/lib/crypto";
import { dbGetUserById } from "@/lib/supabase";
import { invokeChangePinOnChain } from "@/lib/stellar";

export async function PATCH(request: NextRequest) {
  let secretKey: string | null = null;
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    const { oldPinHash, newPinHash } = await request.json();
    if (
      ![oldPinHash, newPinHash].every(
        (hash) => typeof hash === "string" && /^[a-f0-9]{64}$/i.test(hash),
      )
    ) {
      return NextResponse.json(
        { error: "Both PIN hashes must be SHA-256 hex values." },
        { status: 400 },
      );
    }
    const user = await dbGetUserById(authUser.id);
    if (!user || user.role !== "consumer" || !user.pin_registered_at)
      return NextResponse.json({ error: "CONSUMER_NOT_READY" }, { status: 400 });
    secretKey = decryptPrivateKey(user.stellar_private_key_enc);
    const result = await invokeChangePinOnChain(secretKey, oldPinHash, newPinHash);
    if (!result.success)
      return NextResponse.json(
        { error: "PIN_CHANGE_FAILED", message: result.error },
        { status: 400 },
      );
    return NextResponse.json({ success: true, txHash: result.txHash });
  } catch (error) {
    return NextResponse.json(
      {
        error: "PIN change failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  } finally {
    secretKey = null;
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { decryptPrivateKey } from "@/lib/crypto";
import { dbGetUserById, dbMarkPinRegistered } from "@/lib/supabase";
import { invokeRegisterOnChain } from "@/lib/stellar";

/** Finalizes consumer onboarding with a browser-computed SHA-256 PIN hash. */
export async function POST(request: NextRequest) {
  let secretKey: string | null = null;
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    const { pinHash } = await request.json();
    if (typeof pinHash !== "string" || !/^[a-f0-9]{64}$/i.test(pinHash)) {
      return NextResponse.json(
        { error: "pinHash must be a 64-character SHA-256 hex value." },
        { status: 400 },
      );
    }

    const user = await dbGetUserById(authUser.id);
    if (!user || user.role !== "consumer")
      return NextResponse.json({ error: "CONSUMER_NOT_FOUND" }, { status: 404 });
    if (user.pin_registered_at)
      return NextResponse.json({ error: "PIN_ALREADY_REGISTERED" }, { status: 409 });

    secretKey = decryptPrivateKey(user.stellar_private_key_enc);
    const result = await invokeRegisterOnChain(secretKey, pinHash);
    if (!result.success)
      return NextResponse.json(
        { error: "ON_CHAIN_REGISTRATION_FAILED", message: result.error },
        { status: 400 },
      );

    await dbMarkPinRegistered(user.id);
    return NextResponse.json({
      success: true,
      txHash: result.hash,
      stellarPublicKey: user.stellar_public_key,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Registration failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  } finally {
    secretKey = null;
  }
}

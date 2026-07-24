import { NextRequest, NextResponse } from "next/server";
import { dbGetUserById, dbCreateUser } from "@/lib/supabase";
import { generateStellarKeyPair, fundTestnetWallet } from "@/lib/stellar";
import { encryptPrivateKey } from "@/lib/crypto";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * POST /api/user/register
 * Starts authenticated onboarding. The wallet is created first so the browser can
 * compute SHA-256(PIN + actual_wallet_public_key) without exposing the raw PIN.
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser?.email) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

    const body = await req.json();
    const { role, businessName } = body;

    if (!role) {
      return NextResponse.json({ error: "Missing required field: role" }, { status: 400 });
    }

    if (role !== "consumer" && role !== "merchant") {
      return NextResponse.json({ error: "Role must be 'consumer' or 'merchant'" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await dbGetUserById(authUser.id);
    if (existing) {
      return NextResponse.json(
        { error: "USER_EXISTS", message: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // 1. Generate keypair for the user
    const { publicKey, secretKey } = generateStellarKeyPair();

    // 2. Encrypt private key with AES-256-GCM
    const encryptedSecretKey = encryptPrivateKey(secretKey);

    // 3. Fund testnet wallet via Friendbot
    const funded = await fundTestnetWallet(publicKey);
    if (!funded) throw new Error("Unable to fund the new Testnet wallet. Please try again.");

    // 4. Save encrypted custodial key. Consumers must still complete PIN registration.
    const newUser = await dbCreateUser({
      id: authUser.id,
      email: authUser.email,
      role,
      business_name: businessName || null,
      stellar_public_key: publicKey,
      stellar_private_key_enc: encryptedSecretKey,
      pin_registered_at: null,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        businessName: newUser.business_name,
        stellarPublicKey: newUser.stellar_public_key,
        createdAt: newUser.created_at,
      },
      setupRequired: role === "consumer",
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Registration failed: " + error.message }, { status: 500 });
  }
}

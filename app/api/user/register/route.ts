import { NextRequest, NextResponse } from "next/server";
import { dbGetUserByEmail, dbCreateUser } from "@/lib/supabase";
import { generateStellarKeyPair, fundTestnetWallet, invokeRegisterOnChain } from "@/lib/stellar";
import { encryptPrivateKey } from "@/lib/crypto";

/**
 * POST /api/user/register
 * Creates a user profile, generates a Stellar wallet, encrypts the private key,
 * funds it via Friendbot on Testnet, and registers the pin_hash on the Soroban contract.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, role, businessName, pinHash } = body;

    if (!email || !role || (role === "consumer" && !pinHash)) {
      return NextResponse.json(
        { error: "Missing required fields: email, role (and pinHash for consumers)" },
        { status: 400 }
      );
    }

    if (role !== "consumer" && role !== "merchant") {
      return NextResponse.json(
        { error: "Role must be 'consumer' or 'merchant'" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await dbGetUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "USER_EXISTS", message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // 1. Generate keypair for the user
    const { publicKey, secretKey } = generateStellarKeyPair();

    // 2. Encrypt private key with AES-256-GCM
    const encryptedSecretKey = encryptPrivateKey(secretKey);

    // 3. Fund testnet wallet via Friendbot
    await fundTestnetWallet(publicKey);

    // 4. If consumer, register PIN hash on the Soroban Smart Contract
    let onChainTxHash: string | undefined = undefined;
    if (role === "consumer" && pinHash) {
      const regResult = await invokeRegisterOnChain(secretKey, pinHash);
      if (regResult.success) {
        onChainTxHash = regResult.hash;
      }
    }

    // 5. Save to database
    const newUser = await dbCreateUser({
      email,
      role,
      business_name: businessName || null,
      stellar_public_key: publicKey,
      stellar_private_key_enc: encryptedSecretKey,
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
      onChainTxHash,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Registration failed: " + error.message },
      { status: 500 }
    );
  }
}

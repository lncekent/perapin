import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, kycType, kycId } = body;

    if (!name || !phone || !kycType || !kycId) {
      return NextResponse.json(
        { error: "Missing required signup fields" },
        { status: 400 }
      );
    }

    // Generate a simulated Stellar Address & PeraPin ID
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const customerId = `PP-${phone.slice(-4)}-${randomSuffix}`;
    
    // Generate simulated 56-character Stellar public key (starting with 'G')
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let simulatedPubKey = "G";
    for (let i = 0; i < 55; i++) {
      simulatedPubKey += chars[Math.floor(Math.random() * chars.length)];
    }

    // Return structured payload matching Stellar/Soroban ledger expectations
    return NextResponse.json({
      success: true,
      customerId,
      stellarPublicKey: simulatedPubKey,
      initialBalance: 500.0, // PHP equivalent
      registrationLedger: Math.floor(6420000 + Math.random() * 10000),
      timestamp: new Date().toISOString(),
      message: "Customer account indexed successfully on-chain."
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to process signup: " + error.message },
      { status: 500 }
    );
  }
}

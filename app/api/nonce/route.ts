import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required to fetch nonce" },
        { status: 400 }
      );
    }

    // Generate a secure simulated cryptographic nonce
    // In a real contract, this is the current sequence count of the public key or a random salt
    const nonce = Math.floor(100000 + Math.random() * 900000).toString();

    return NextResponse.json({
      success: true,
      customerId,
      nonce,
      expirySeconds: 300, // Nonce is valid for 5 minutes
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate transaction nonce: " + error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { dbGetUserByPublicKey } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/auth";

/** Merchant-only QR lookup. It deliberately exposes no consumer PII. */
export async function GET(request: NextRequest) {
  const authUser = await getAuthenticatedUser();
  if (!authUser) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  const wallet = new URL(request.url).searchParams.get("wallet")?.trim();
  if (!wallet || !/^G[A-Z2-7]{55}$/.test(wallet))
    return NextResponse.json({ error: "Invalid Stellar public key." }, { status: 400 });
  const user = await dbGetUserByPublicKey(wallet);
  if (!user || user.role !== "consumer" || !user.pin_registered_at)
    return NextResponse.json({ error: "CONSUMER_NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ consumerPublicKey: user.stellar_public_key });
}

import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { dbGetUserById } from "@/lib/supabase";
import { getWalletBalanceXlm } from "@/lib/stellar";

export async function GET() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  const user = await dbGetUserById(authUser.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ balanceXlm: await getWalletBalanceXlm(user.stellar_public_key) });
}

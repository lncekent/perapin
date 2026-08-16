import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

    const { fullName } = await req.json();
    if (typeof fullName !== "string") {
      return NextResponse.json({ error: "Full name must be a string" }, { status: 400 });
    }
    if (fullName.trim().length > 100) {
      return NextResponse.json({ error: "Full name must be 100 characters or less" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error } = await supabase
      .from("users")
      .update({ full_name: fullName.trim() || null })
      .eq("id", authUser.id);

    if (error) throw error;

    return NextResponse.json({ success: true, fullName: fullName.trim() });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update full name: " + error.message },
      { status: 500 },
    );
  }
}

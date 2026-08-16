import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

    const { businessName } = await req.json();
    if (!businessName || typeof businessName !== "string" || businessName.trim().length === 0) {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 });
    }
    if (businessName.trim().length > 50) {
      return NextResponse.json({ error: "Business name must be 50 characters or less" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error } = await supabase
      .from("users")
      .update({ business_name: businessName.trim() })
      .eq("id", authUser.id);

    if (error) throw error;

    return NextResponse.json({ success: true, businessName: businessName.trim() });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update business name: " + error.message },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { dbGetUserById, dbRecordFeedback } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    const user = await dbGetUserById(authUser.id);
    if (!user) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    const { rating, comments } = await request.json();
    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      typeof comments !== "string" ||
      !comments.trim() ||
      comments.length > 2000
    ) {
      return NextResponse.json(
        { error: "Provide a rating from 1 to 5 and a comment up to 2,000 characters." },
        { status: 400 },
      );
    }
    await dbRecordFeedback({
      user_id: user.id,
      role: user.role,
      rating,
      comments: comments.trim(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save feedback." },
      { status: 500 },
    );
  }
}

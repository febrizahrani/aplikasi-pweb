import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  // Supabase handles signout via client-side
  // This route just redirects after signout
  return NextResponse.redirect(`${origin}/login`);
}

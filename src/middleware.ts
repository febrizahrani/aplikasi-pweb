import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip middleware for now - just pass through
  return undefined;
}

export const config = {
  matcher: [],
};

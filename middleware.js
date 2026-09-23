import { NextResponse } from "next/server";

export function middleware(request) {
  return NextResponse.rewrite(
    new URL("/maintenance", request.url)
  );
}

export const config = {
  matcher: [
    "/((?!maintenance|_next/static|_next/image|favicon.ico).*)",
  ],
};

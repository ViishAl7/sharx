import { NextResponse } from "next/server";

export function middleware(request) {
  const hostname = request.nextUrl.hostname;

  // LOCAL → normal SHARX website
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.")
  ) {
    return NextResponse.next();
  }

  // LIVE → maintenance page
  return NextResponse.rewrite(
    new URL("/maintenance", request.url)
  );
}

export const config = {
  matcher: [
    "/((?!maintenance|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
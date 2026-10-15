import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAccessToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? verifyAccessToken(token) : null;
  const destination = session ? "/admin" : "/admin/login";
  return NextResponse.redirect(new URL(destination, request.url));
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? verifyAccessToken(token) : null;
  const destination = session ? "/admin" : "/admin/login";
  return NextResponse.redirect(new URL(destination, request.url), 303);
}

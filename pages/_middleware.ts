import type { NextRequest, NextFetchEvent } from 'next/server';
import { NextResponse as Response } from 'next/server';
import { getToken } from "next-auth/jwt"

export default function middleware(req: NextRequest, ev: NextFetchEvent) {

  if (req.nextUrl.pathname === "/") {
    return Response.redirect("/develop");

  }
}
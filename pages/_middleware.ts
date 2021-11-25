import type { NextRequest, NextFetchEvent } from 'next/server';
import { NextResponse as Response } from 'next/server';

export default function middleware(req: NextRequest, ev: NextFetchEvent) {

  if (req.nextUrl.pathname === "/") {
    return Response.redirect("/develop");

  }
}
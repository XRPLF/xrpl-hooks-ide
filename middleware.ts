import type { NextRequest } from 'next/server'
import { NextResponse as Response } from 'next/server'

export default function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/') {
    const url = req.nextUrl.clone()
    url.pathname = '/develop'
    return Response.redirect(url)
  }
}

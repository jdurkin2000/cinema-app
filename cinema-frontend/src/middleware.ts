// middleware.ts (Next.js root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {me} from '@/libs/authApi'
import User from './models/user';

export async function middleware(req: NextRequest) {
  try {
    if (req.nextUrl.pathname.startsWith('/system-admin')){
      const token = req.cookies.get('authToken')?.value;
      if (!token)
        throw new Error("User not authorized");

      const user: User = await me(token);
      if (user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/system-admin/:path*'],
};


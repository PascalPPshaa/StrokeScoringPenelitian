// import { NextResponse } from 'next/server';
// import { jwtVerify } from 'jose';

// const PUBLIC_FILE = /\.(.*)$/;

// export async function middleware(req) {
//   const { pathname } = req.nextUrl;

//   if (
//     pathname.startsWith('/api/auth/login') ||
//     pathname === '/login' ||
//     pathname.startsWith('/_next') ||
//     pathname.startsWith('/favicon.ico') ||
//     PUBLIC_FILE.test(pathname)
//   ) {
//     return NextResponse.next();
//   }

//   // Protect route /admin
//   if (pathname.startsWith('/admin')) {
//     const token = req.cookies.get('token')?.value;
//     if (!token) {
//       return NextResponse.redirect(new URL('/login', req.url));
//     }
//     try {
//       await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
//       // token valid → izinkan
//       return NextResponse.next();
//     } catch (e) {
//       return NextResponse.redirect(new URL('/login', req.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/admin/:path*', '/admin'],
// };

import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === '/login';
  const isPublic = pathname.startsWith('/api/auth');

  if (isLoginPage || isPublic) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin/login', '/api/auth/:path*'],
};

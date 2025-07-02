import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  console.log(`Middleware processing: ${req.nextUrl.pathname}`);
  
  // Skip auth check for login page
  if (req.nextUrl.pathname === '/admin/login') {
    console.log('Skipping auth check for login page');
    return res;
  }
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error.message);
  }
  
  console.log('Session exists:', !!session);
  
  // Redirect to login if accessing protected route without session
  if (req.nextUrl.pathname.startsWith('/admin') && !session) {
    console.log('Redirecting to login - no session found');
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
  
  console.log('Allowing access to protected route');
  return res
}

export const config = {
  matcher: ['/admin/:path*'],
}
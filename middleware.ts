// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth_session');
  const { pathname } = request.nextUrl;

  // Si el usuario no está logueado, redirigir a /login,
  // a menos que ya esté en la página de login.
  if (!sessionCookie && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si el usuario está logueado y va a /login, redirigir al panel.
  if (sessionCookie && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configuración para que el middleware se aplique a todas las rutas
// excepto las de la API y las estáticas de Next.js.
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
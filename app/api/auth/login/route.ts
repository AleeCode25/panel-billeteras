// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (username === 'admin' && password === 'reysanto') {
    // Credenciales correctas: creamos la cookie
    await cookies().set('auth_session', 'logged_in', { httpOnly: true, path: '/' });
    return NextResponse.json({ message: 'Login exitoso' });
  }

  // Credenciales incorrectas
  return NextResponse.json({ message: 'Usuario o contraseña incorrectos' }, { status: 401 });
}
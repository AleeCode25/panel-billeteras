import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username === 'admin' && password === 'reysanto') {
      // La forma correcta y más clara:
      const cookieStore = await cookies();
      cookieStore.set('auth_session', 'logged_in', { httpOnly: true, path: '/' });

      return NextResponse.json({ message: 'Login exitoso' });
    } else {
      return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error en el servidor' }, { status: 500 });
  }
}
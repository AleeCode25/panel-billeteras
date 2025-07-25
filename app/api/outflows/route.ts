// app/api/outflows/route.ts
import { NextResponse } from 'next/server';
import { wallets } from '@/lib/wallet.config';

export async function POST(request: Request) {
  try {
    // Leemos el 'shift' del cuerpo de la petición, además de los otros datos
    const { walletId, date, shift } = await request.json();
    const wallet = wallets.find(w => w.id === walletId);

    if (!wallet) {
      return NextResponse.json({ message: 'Billetera no encontrada' }, { status: 404 });
    }

    // Pasamos ambos argumentos, 'date' y 'shift', a la función
    const data = await wallet.fetchOutflows(date, shift);
    return NextResponse.json(data);
    
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error interno' }, { status: 500 });
  }
}
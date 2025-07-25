// app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import { wallets } from '@/lib/wallet.config';

export async function POST(request: Request) {
  try {
    // Leemos el 'shift' del cuerpo de la petición, además de los otros datos
    const { walletId, date, page, shift } = await request.json();

    const wallet = wallets.find(w => w.id === walletId);

    if (!wallet) {
      return NextResponse.json({ message: 'Billetera no encontrada' }, { status: 404 });
    }
    
    // Pasamos los 3 argumentos: 'date', 'page' y 'shift'
    const data = await wallet.fetchIncoming(date, page, shift);
    
    return NextResponse.json(data);
    
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error interno' }, { status: 500 });
  }
}
// app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import { wallets } from '@/lib/wallet.config';

export async function POST(request: Request) {
  try {
    const { walletId, date, page } = await request.json();

    const wallet = wallets.find(w => w.id === walletId);

    if (!wallet) {
      return NextResponse.json({ message: 'Billetera no encontrada' }, { status: 404 });
    }
    
    // --- CORRECCIÓN ---
    // ANTES: const data = await wallet.fetchTransactions(date, page);
    // AHORA: Usamos el nombre correcto de la función: fetchIncoming
    const data = await wallet.fetchIncoming(date, page);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error(error);
    // Para dar más detalles en el error del frontend
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
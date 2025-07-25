// app/api/outflows/route.ts
import { NextResponse } from 'next/server';
import { wallets } from '@/lib/wallet.config';

export async function POST(request: Request) {
  try {
    const { walletId, date } = await request.json();
    const wallet = wallets.find(w => w.id === walletId);

    if (!wallet) {
      return NextResponse.json({ message: 'Billetera no encontrada' }, { status: 404 });
    }

    const data = await wallet.fetchOutflows(date);
    return NextResponse.json(data);
    
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error interno' }, { status: 500 });
  }
}
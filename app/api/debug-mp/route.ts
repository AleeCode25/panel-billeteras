// app/api/debug-mp/route.ts

import { NextResponse } from 'next/server';
import type { WalletConfig } from '@/lib/wallet.config';
import { wallets } from '@/lib/wallet.config';

const fetchMercadoPagoLogic = async (accessToken: string, date: string): Promise<any> => {
  const apiLimit = 200;
  const begin_date = new Date(`${date}T00:00:00.000-03:00`);
  const end_date = new Date(begin_date);
  end_date.setDate(begin_date.getDate() + 1);

  const params = new URLSearchParams({
    sort: 'date_created',
    criteria: 'desc',
    limit: apiLimit.toString(),
    offset: '0',
    begin_date: begin_date.toISOString(),
    end_date: end_date.toISOString(),
  });

  const url = `https://api.mercadopago.com/v1/payments/search?${params.toString()}`;
  const response = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Error en la API de depuración de MP:`, errorText);
    // Devolvemos el error como JSON para verlo en el frontend
    return { error: 'Error al buscar en la API de Mercado Pago', details: errorText };
  }
  return response.json();
};

export async function POST(request: Request) {
  try {
    // Ahora recibimos también el ID de la billetera a depurar
    const { date, walletId } = await request.json();
    
    const walletToDebug = wallets.find(w => w.id === walletId);

    if (!walletToDebug) {
      return NextResponse.json({ error: 'No se encontró la billetera especificada' }, { status: 404 });
    }

    const rawData = await fetchMercadoPagoLogic(walletToDebug.accessToken, date);
    
    // Si la función de lógica devolvió un error, lo pasamos al frontend
    if (rawData.error) {
        return NextResponse.json(rawData, { status: 500 });
    }
    
    return NextResponse.json(rawData);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
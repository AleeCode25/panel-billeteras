// lib/wallet.config.ts

// --- INTERFACES ---
export interface Transaction {
  id: string;
  nombre: string;
  monto: number;
  cuil: string;
  hora: string | null;
}
export interface FetchTransactionsResponse {
  transactions: Transaction[];
  totalPages: number;
}
export interface FetchOutflowsResponse {
  outflows: Transaction[];
  totalAmount: number;
}
export interface WalletConfig {
  id: string;
  name: string;
  accessToken: string;
  userId: string;
  shifts: ('mañana' | 'tarde' | 'noche')[];
  fetchIncoming: (date: string, page: number, shift: string) => Promise<FetchTransactionsResponse>;
  fetchOutflows: (date: string, shift: string) => Promise<FetchOutflowsResponse>;
}

// --- LÓGICA DE FECHAS POR TURNO ---
const getShiftDateRange = (date: string, shift: string) => {
  const timeZone = '-03:00';
  let begin_date: Date;
  let end_date: Date;
  const selectedDate = new Date(`${date}T00:00:00.000${timeZone}`);

  switch (shift) {
    case 'mañana':
      begin_date = new Date(`${date}T06:00:00.000${timeZone}`);
      end_date = new Date(`${date}T14:00:00.000${timeZone}`);
      break;
    case 'tarde':
      begin_date = new Date(`${date}T14:00:00.000${timeZone}`);
      end_date = new Date(`${date}T22:00:00.000${timeZone}`);
      break;
    case 'noche':
      begin_date = new Date(`${date}T22:00:00.000${timeZone}`);
      end_date = new Date(selectedDate);
      end_date.setDate(selectedDate.getDate() + 1);
      end_date = new Date(`${end_date.toISOString().split('T')[0]}T06:00:00.000${timeZone}`);
      break;
    default:
      begin_date = new Date(`${date}T00:00:00.000${timeZone}`);
      end_date = new Date(begin_date);
      end_date.setDate(begin_date.getDate() + 1);
      break;
  }
  return { begin_date: begin_date.toISOString(), end_date: end_date.toISOString() };
};

// --- LÓGICA DE MERCADO PAGO ---
const fetchMercadoPagoLogic = async (accessToken: string, date: string, shift: string): Promise<any> => {
  const apiLimit = 200;
  const { begin_date, end_date } = getShiftDateRange(date, shift);

  const params = new URLSearchParams({
    sort: 'date_created',
    criteria: 'desc',
    limit: apiLimit.toString(),
    offset: '0',
    begin_date,
    end_date,
  });

  const url = `https://api.mercadopago.com/v1/payments/search?${params.toString()}`;
  const response = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });

  if (!response.ok) {
    console.error(`Error en MP con token que termina en ...${accessToken.slice(-4)}:`, await response.text());
    throw new Error('Error al buscar transacciones en Mercado Pago');
  }
  return response.json();
};

// --- FUNCIONES ESPECIALIZADAS ---

const getMercadoPagoIncoming = (accessToken: string, userId: string) => async (date: string, page: number, shift: string): Promise<FetchTransactionsResponse> => {
    const data = await fetchMercadoPagoLogic(accessToken, date, shift);
    const myUserId = parseInt(userId, 10);
    const filtered = data.results.filter((p: any) => p.status === 'approved' && p.collector_id === myUserId && p.transaction_details?.net_received_amount > 0);
    const limitPerPage = 10;
    const totalPages = Math.ceil(filtered.length / limitPerPage);
    const offset = (page - 1) * limitPerPage;
    const paginated = filtered.slice(offset, offset + limitPerPage);
    const transactions = paginated.map((p: any) => ({
      id: p.id,
      nombre: p.payer?.nickname || p.payer?.email || 'Ingreso sin remitente',
      monto: p.transaction_amount,
      cuil: p.payer?.identification?.number || 'N/A',
      hora: p.date_approved || p.date_created,
    }));
    return { transactions, totalPages };
};

const getMercadoPagoOutflows = (accessToken: string, userId: string) => async (date: string, shift: string): Promise<FetchOutflowsResponse> => {
    const data = await fetchMercadoPagoLogic(accessToken, date, shift);
    const myUserId = parseInt(userId, 10);
    
    // Añadimos el tipo explícito a la constante 'outflows'
    const outflows: Transaction[] = data.results
      .filter((p: any) => {
        const isPayer = (p.payer?.id === myUserId) || (p.payer_id === myUserId);
        return (p.status === 'approved' && isPayer && p.collector_id !== myUserId);
      })
      .map((p: any) => ({
        id: p.id,
        nombre: p.collector?.nickname || p.description || 'Salida sin destinatario',
        monto: p.transaction_amount,
        cuil: p.collector?.identification?.number || 'N/A',
        hora: p.date_approved || p.date_created,
      }));
      
    // AÑADIMOS LOS TIPOS A LOS PARÁMETROS DE REDUCE
    const totalAmount = outflows.reduce((sum: number, outflow: Transaction) => sum + outflow.monto, 0);

    return { outflows, totalAmount };
};


// --- CONFIGURACIÓN CENTRAL DE BILLETERAS ---
export const wallets: WalletConfig[] = [
  {
    id: 'cuenta_fernando_scatturice',
    name: 'MP Cuenta Fernando Scatturice',
    shifts: ['noche'],
    accessToken: process.env.MP_TOKEN_CUENTA_FERNANDO_SCATTURICE || '',
    userId: process.env.MP_CLIENT_ID_CUENTA_FERNANDO_SCATTURICE || '0',
    fetchIncoming: getMercadoPagoIncoming(process.env.MP_TOKEN_CUENTA_FERNANDO_SCATTURICE || '', process.env.MP_CLIENT_ID_CUENTA_FERNANDO_SCATTURICE || '0'),
    fetchOutflows: getMercadoPagoOutflows(process.env.MP_TOKEN_CUENTA_FERNANDO_SCATTURICE || '', process.env.MP_CLIENT_ID_CUENTA_FERNANDO_SCATTURICE || '0'),
  },
  {
    id: 'cuenta_matias_parco',
    name: 'MP Cuenta Matías Parco',
    shifts: ['noche'],
    accessToken: process.env.MP_TOKEN_CUENTA_MATIAS_PARCO || '',
    userId: process.env.MP_CLIENT_ID_CUENTA_MATIAS_PARCO || '0',
    fetchIncoming: getMercadoPagoIncoming(process.env.MP_TOKEN_CUENTA_MATIAS_PARCO || '', process.env.MP_CLIENT_ID_CUENTA_MATIAS_PARCO || '0'),
    fetchOutflows: getMercadoPagoOutflows(process.env.MP_TOKEN_CUENTA_MATIAS_PARCO || '', process.env.MP_CLIENT_ID_CUENTA_MATIAS_PARCO || '0'),
  },
  {
    id: 'cuenta_alejandro_rossi',
    name: 'MP Cuenta Alejandro Rossi',
    shifts: ['noche'],
    accessToken: process.env.MP_TOKEN_CUENTA_ALEJANDRO_ROSSI || '',
    userId: process.env.MP_CLIENT_ID_CUENTA_ALEJANDRO_ROSSI || '0',
    fetchIncoming: getMercadoPagoIncoming(process.env.MP_TOKEN_CUENTA_ALEJANDRO_ROSSI || '', process.env.MP_CLIENT_ID_CUENTA_ALEJANDRO_ROSSI || '0'),
    fetchOutflows: getMercadoPagoOutflows(process.env.MP_TOKEN_CUENTA_ALEJANDRO_ROSSI || '', process.env.MP_CLIENT_ID_CUENTA_ALEJANDRO_ROSSI || '0'),
  },
  {
    id: 'cuenta_nicolas_zorzenon',
    name: 'MP Cuenta Nicolás Zorzenon',
    shifts: ['mañana', 'tarde'],
    accessToken: process.env.MP_TOKEN_CUENTA_NICOLAS_ZORZENON || '',
    userId: process.env.MP_CLIENT_ID_CUENTA_NICOLAS_ZORZENON || '0',
    fetchIncoming: getMercadoPagoIncoming(process.env.MP_TOKEN_CUENTA_NICOLAS_ZORZENON || '', process.env.MP_CLIENT_ID_CUENTA_NICOLAS_ZORZENON || '0'),
    fetchOutflows: getMercadoPagoOutflows(process.env.MP_TOKEN_CUENTA_NICOLAS_ZORZENON || '', process.env.MP_CLIENT_ID_CUENTA_NICOLAS_ZORZENON || '0'),
  },
  {
    id: 'cuenta_mariana_crucci',
    name: 'MP Cuenta Mariana Crucci',
    shifts: ['mañana', 'tarde'],
    accessToken: process.env.MP_TOKEN_CUENTA_MARIANA_CRUCCI || '',
    userId: process.env.MP_CLIENT_ID_CUENTA_MARIANA_CRUCCI || '0',
    fetchIncoming: getMercadoPagoIncoming(process.env.MP_TOKEN_CUENTA_MARIANA_CRUCCI || '', process.env.MP_CLIENT_ID_CUENTA_MARIANA_CRUCCI || '0'),
    fetchOutflows: getMercadoPagoOutflows(process.env.MP_TOKEN_CUENTA_MARIANA_CRUCCI || '', process.env.MP_CLIENT_ID_CUENTA_MARIANA_CRUCCI || '0'),
  },
  {
    id: 'cuenta_cristian_eduardo',
    name: 'MP Cuenta Cristian Eduardo',
    shifts: ['mañana', 'tarde'],
    accessToken: process.env.MP_TOKEN_CUENTA_CRISTIAN_EDUARDO || '',
    userId: process.env.MP_CLIENT_ID_CRISTIAN_EDUARDO || '0',
    fetchIncoming: getMercadoPagoIncoming(process.env.MP_TOKEN_CUENTA_CRISTIAN_EDUARDO || '', process.env.MP_CLIENT_ID_CUENTA_CRISTIAN_EDUARDO || '0'),
    fetchOutflows: getMercadoPagoOutflows(process.env.MP_TOKEN_CUENTA_CRISTIAN_EDUARDO || '', process.env.MP_CLIENT_ID_CUENTA_CRISTIAN_EDUARDO || '0'),
  },
];
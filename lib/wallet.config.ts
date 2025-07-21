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
// <-- AÑADIDO: Interfaz para la respuesta del saldo
export interface FetchBalanceResponse {
  total_amount: number;
  available_balance: number;
  unavailable_balance: number;
}
export interface WalletConfig {
  id: string;
  name: string;
  accessToken: string;
  fetchIncoming: (date: string, page: number) => Promise<FetchTransactionsResponse>;
  fetchOutflows: (date: string) => Promise<FetchOutflowsResponse>;
  // <-- AÑADIDO: El método que faltaba
  fetchBalance: () => Promise<FetchBalanceResponse>;
}

// --- LÓGICA DE MERCADO PAGO (Transacciones) ---
const fetchMercadoPagoLogic = async (accessToken: string, date: string): Promise<any> => {
  const apiLimit = 200;
  // Usamos la hora actual para definir el día en el huso horario de Argentina
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
    console.error(`Error en MP (transacciones) con token que termina en ...${accessToken.slice(-4)}:`, await response.text());
    throw new Error('Error al buscar transacciones en Mercado Pago');
  }
  return response.json();
};

// --- FUNCIONES ESPECIALIZADAS ---

const getMercadoPagoIncoming = (accessToken: string, userId: string) => async (date: string, page: number): Promise<FetchTransactionsResponse> => {
    const data = await fetchMercadoPagoLogic(accessToken, date);
    const myUserId = parseInt(userId, 10);

    const filtered = data.results.filter((p: any) =>
      p.status === 'approved' &&
      p.collector_id === myUserId &&
      p.transaction_details?.net_received_amount > 0
    );

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

const getMercadoPagoOutflows = (accessToken: string, userId: string) => async (date: string): Promise<FetchOutflowsResponse> => {
    const data = await fetchMercadoPagoLogic(accessToken, date);
    const myUserId = parseInt(userId, 10);

    const outflows = data.results
      .filter((p: any) => {
        const isPayer = (p.payer?.id === myUserId) || (p.payer_id === myUserId);
        return (
          p.status === 'approved' &&
          isPayer &&
          p.collector_id !== myUserId
        );
      })
      .map((p: any) => ({
        id: p.id,
        nombre: p.collector?.nickname || p.description || 'Salida sin destinatario',
        monto: p.transaction_amount,
        cuil: p.collector?.identification?.number || 'N/A',
        hora: p.date_approved || p.date_created,
      }));
      
    const totalAmount = outflows.reduce((sum, outflow) => sum + outflow.monto, 0);

    return { outflows, totalAmount };
};

// <-- AÑADIDO: Nueva función para obtener el saldo de la cuenta
const getMercadoPagoBalance = (accessToken: string, userId: string) => async (): Promise<FetchBalanceResponse> => {
    if (!userId || userId === '0') {
        throw new Error('El User ID es inválido o no está configurado para obtener el saldo.');
    }
    const url = `https://api.mercadopago.com/users/${userId}/mercadopago_account/balance`;
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });

    if (!response.ok) {
        console.error(`Error en MP (saldo) con token que termina en ...${accessToken.slice(-4)}:`, await response.text());
        throw new Error('Error al obtener el saldo de Mercado Pago');
    }
    return response.json();
};


// --- CONFIGURACIÓN CENTRAL DE BILLETERAS ---
export const wallets: WalletConfig[] = [
  {
    id: 'cuenta_fernando_scatturice',
    name: 'MP Cuenta Fernando Scatturice',
    accessToken: process.env.MP_TOKEN_CUENTA_FERNANDO_SCATTURICE || '',
    fetchIncoming: getMercadoPagoIncoming(process.env.MP_TOKEN_CUENTA_FERNANDO_SCATTURICE || '', process.env.MP_CLIENT_ID_CUENTA_FERNANDO_SCATTURICE || '0'),
    fetchOutflows: getMercadoPagoOutflows(process.env.MP_TOKEN_CUENTA_FERNANDO_SCATTURICE || '', process.env.MP_CLIENT_ID_CUENTA_FERNANDO_SCATTURICE || '0'),
    fetchBalance: getMercadoPagoBalance(process.env.MP_TOKEN_CUENTA_FERNANDO_SCATTURICE || '', process.env.MP_CLIENT_ID_CUENTA_FERNANDO_SCATTURICE || '0'),
  },
  {
    id: 'cuenta_matias_parco',
    name: 'MP Cuenta Matías Parco',
    accessToken: process.env.MP_TOKEN_CUENTA_MATIAS_PARCO || '',
    fetchIncoming: getMercadoPagoIncoming(process.env.MP_TOKEN_CUENTA_MATIAS_PARCO || '', process.env.MP_CLIENT_ID_CUENTA_MATIAS_PARCO || '0'),
    fetchOutflows: getMercadoPagoOutflows(process.env.MP_TOKEN_CUENTA_MATIAS_PARCO || '', process.env.MP_CLIENT_ID_CUENTA_MATIAS_PARCO || '0'),
    fetchBalance: getMercadoPagoBalance(process.env.MP_TOKEN_CUENTA_MATIAS_PARCO || '', process.env.MP_CLIENT_ID_CUENTA_MATIAS_PARCO || '0'),
  },
  {
    id: 'cuenta_alejandro_rossi',
    name: 'MP Cuenta Alejandro Rossi',
    accessToken: process.env.MP_TOKEN_CUENTA_ALEJANDRO_ROSSI || '',
    fetchIncoming: getMercadoPagoIncoming(process.env.MP_TOKEN_CUENTA_ALEJANDRO_ROSSI || '', process.env.MP_CLIENT_ID_CUENTA_ALEJANDRO_ROSSI || '0'),
    fetchOutflows: getMercadoPagoOutflows(process.env.MP_TOKEN_CUENTA_ALEJANDRO_ROSSI || '', process.env.MP_CLIENT_ID_CUENTA_ALEJANDRO_ROSSI || '0'),
    fetchBalance: getMercadoPagoBalance(process.env.MP_TOKEN_CUENTA_ALEJANDRO_ROSSI || '', process.env.MP_CLIENT_ID_CUENTA_ALEJANDRO_ROSSI || '0'),
  },
  {
    id: 'cuenta_nicolas_zorzenon',
    name: 'MP Cuenta Nicolás Zorzenon',
    accessToken: process.env.MP_TOKEN_CUENTA_NICOLAS_ZORZENON || '',
    fetchIncoming: getMercadoPagoIncoming(process.env.MP_TOKEN_CUENTA_NICOLAS_ZORZENON || '', process.env.MP_CLIENT_ID_CUENTA_NICOLAS_ZORZENON || '0'),
    fetchOutflows: getMercadoPagoOutflows(process.env.MP_TOKEN_CUENTA_NICOLAS_ZORZENON || '', process.env.MP_CLIENT_ID_CUENTA_NICOLAS_ZORZENON || '0'),
    fetchBalance: getMercadoPagoBalance(process.env.MP_TOKEN_CUENTA_NICOLAS_ZORZENON || '', process.env.MP_CLIENT_ID_CUENTA_NICOLAS_ZORZENON || '0'),
  },
  {
    id: 'cuenta_mariana_crucci',
    name: 'MP Cuenta Mariana Crucci',
    accessToken: process.env.MP_TOKEN_CUENTA_MARIANA_CRUCCI || '',
    fetchIncoming: getMercadoPagoIncoming(process.env.MP_TOKEN_CUENTA_MARIANA_CRUCCI || '', process.env.MP_CLIENT_ID_CUENTA_MARIANA_CRUCCI || '0'),
    fetchOutflows: getMercadoPagoOutflows(process.env.MP_TOKEN_CUENTA_MARIANA_CRUCCI || '', process.env.MP_CLIENT_ID_CUENTA_MARIANA_CRUCCI || '0'),
    fetchBalance: getMercadoPagoBalance(process.env.MP_TOKEN_CUENTA_MARIANA_CRUCCI || '', process.env.MP_CLIENT_ID_CUENTA_MARIANA_CRUCCI || '0'),
  },
];
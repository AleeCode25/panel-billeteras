// app/debug/page.tsx
'use client';

import { useState } from 'react';
import { wallets } from '@/lib/wallet.config'; // Importamos la configuración de billeteras

export default function DebugPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id || ''); // Seleccionamos la primera por defecto
  const [rawData, setRawData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setIsLoading(true);
    setError(null);
    setRawData(null);
    try {
      const response = await fetch('/api/debug-mp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Enviamos el ID de la billetera seleccionada
        body: JSON.stringify({ date, walletId: selectedWalletId }),
      });

      const data = await response.json();
      if (!response.ok) {
        // Si la respuesta no es OK, mostramos el error que viene de la API
        throw new Error(data.error || `Error: ${response.statusText}`);
      }
      setRawData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Herramienta de Depuración de Mercado Pago</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-end space-x-4">
        <div>
          <label htmlFor="wallet-selector" className="block text-sm font-medium text-gray-300 mb-1">
            Seleccionar Billetera:
          </label>
          <select
            id="wallet-selector"
            value={selectedWalletId}
            onChange={(e) => setSelectedWalletId(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500"
          >
            {wallets.map(wallet => (
              <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date-picker" className="block text-sm font-medium text-gray-300 mb-1">
            Seleccionar Fecha:
          </label>
          <input
            id="date-picker"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleFetch}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-wait"
        >
          {isLoading ? 'Buscando...' : 'Buscar Datos Crudos'}
        </button>
      </div>

      <div className="mt-8">
        {error && <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-md"><strong>Error:</strong> {error}</div>}
        
        {rawData && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Respuesta de la API (JSON Crudo)</h2>
            <pre className="bg-black p-4 rounded-md text-sm text-green-400 overflow-x-auto">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
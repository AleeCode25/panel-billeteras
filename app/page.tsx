// app/page.tsx
'use client';

import { wallets } from '@/lib/wallet.config';
import WalletBlock from '@/components/WalletBlock';
import { useDashboard } from '@/context/DashboardContext'; // Usamos nuestro hook

export default function Dashboard() {
  // Obtenemos el estado y las funciones del contexto
  const { selectedDate, setSelectedDate, triggerRefresh } = useDashboard();

  return (
    <main className="bg-gray-900 min-h-screen text-white p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">📈 Panel de Billeteras</h1>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div>
            <label htmlFor="date-picker" className="mr-2 text-gray-400">Seleccionar Fecha:</label>
            <input
              type="date"
              id="date-picker"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded p-2 text-white"
            />
          </div>
          {/* BOTÓN DE ACTUALIZAR */}
          <button
            onClick={triggerRefresh}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all"
          >
            Actualizar Billeteras
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {wallets.map(wallet => (
          // Ya no necesitamos pasar la fecha como prop
          <WalletBlock key={wallet.id} wallet={wallet} />
        ))}
      </div>
    </main>
  );
}
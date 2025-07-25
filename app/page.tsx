// app/page.tsx
'use client';

import { wallets } from '@/lib/wallet.config';
import WalletBlock from '@/components/WalletBlock';
import { useDashboard } from '@/context/DashboardContext';

type Shift = 'todos' | 'mañana' | 'tarde' | 'noche';

export default function Dashboard() {
  const { selectedDate, setSelectedDate, selectedShift, setSelectedShift, triggerRefresh } = useDashboard();
  
  const filteredWallets = wallets.filter(wallet => 
    selectedShift === 'todos' || wallet.shifts.includes(selectedShift)
  );

  const shiftButtons: { key: Shift; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'mañana', label: 'Turno Mañana' },
    { key: 'tarde', label: 'Turno Tarde' },
    { key: 'noche', label: 'Turno Noche' },
  ];

  return (
    <main className="bg-gray-900 min-h-screen text-white p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">📈 Panel de Billeteras</h1>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div>
            <label htmlFor="date-picker" className="mr-2 text-gray-400">Fecha:</label>
            <input type="date" id="date-picker" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-gray-700 border border-gray-600 rounded p-2 text-white" />
          </div>
          <button onClick={triggerRefresh} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Actualizar Billeteras</button>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {shiftButtons.map(({ key, label }) => (
            <button 
              key={key} 
              onClick={() => setSelectedShift(key)}
              className={`font-bold py-2 px-4 rounded-lg transition-colors ${selectedShift === key ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
        {filteredWallets.map(wallet => (
          <WalletBlock key={wallet.id} wallet={wallet} />
        ))}
      </div>
    </main>
  );
}
// components/OutflowsPopup.tsx
'use client';

import { useState, useEffect } from 'react';
import type { Transaction } from '@/lib/wallet.config';
import { useDashboard } from '@/context/DashboardContext';

interface Props {
  walletId: string;
  walletName: string;
  onClose: () => void;
}

export default function OutflowsPopup({ walletId, walletName, onClose }: Props) {
  const { selectedDate, selectedShift } = useDashboard();
  
  const [outflows, setOutflows] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOutflows = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/outflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletId, date: selectedDate, shift: selectedShift }),
        });
        const data = await response.json();
        setOutflows(data.outflows);
        setTotal(data.totalAmount);
      } catch (error) {
        console.error("Error fetching outflows:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOutflows();
  }, [walletId, selectedDate, selectedShift]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">&times;</button>
        <h2 className="text-2xl font-bold mb-2">Salidas de {walletName}</h2>
        <p className="text-gray-400 mb-4">Fecha: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-AR')} - Turno {selectedShift}</p>
        
        <div className="bg-red-900 bg-opacity-50 p-4 rounded-lg mb-4 text-center">
            <p className="text-lg text-gray-300">Total de Salidas del Turno</p>
            <p className="text-3xl font-bold text-red-400">- ${total.toLocaleString('es-AR')}</p>
        </div>

        <div className="max-h-[40vh] overflow-y-auto pr-2">
          {isLoading ? ( <p className="text-center text-gray-400">Cargando salidas...</p>
          ) : outflows.length === 0 ? ( <p className="text-center text-gray-400">No hubo salidas en este turno.</p>
          ) : (
            <ul className="space-y-3">
              {outflows.map((tx) => (
                <li key={tx.id} className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{tx.nombre}</p>
                    <p className="text-sm text-gray-400">Hora: {tx.hora ? new Date(tx.hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'} hs</p>
                  </div>
                  <span className="text-lg font-mono text-red-400">- ${tx.monto.toLocaleString('es-AR')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
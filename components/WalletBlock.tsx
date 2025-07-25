// components/WalletBlock.tsx
'use client';

import { useState, useEffect } from 'react';
import type { WalletConfig } from '@/lib/wallet.config';
import { useDashboard } from '@/context/DashboardContext';
import OutflowsPopup from './OutflowsPopup';

interface Transaction {
  id: string;
  nombre: string;
  monto: number;
  cuil: string;
  hora: string | null; 
}

interface Props {
  wallet: WalletConfig;
}

export default function WalletBlock({ wallet }: Props) {
  const { selectedDate, selectedShift, refreshKey } = useDashboard();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
    setError(null);
  }, [selectedDate, selectedShift, refreshKey]);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletId: wallet.id, date: selectedDate, page: currentPage, shift: selectedShift }),
        });

        if (!response.ok) {
          throw new Error(`Error al cargar transacciones: ${response.statusText}`);
        }
        const data = await response.json();
        
        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
          setTotalPages(data.totalPages || 0);
        } else {
          throw new Error("La respuesta de la API no es válida.");
        }
      } catch (err: any) {
        setError(err.message || 'Ocurrió un error');
        setTransactions([]);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (selectedDate) {
      fetchTransactions();
    }
  }, [wallet.id, selectedDate, currentPage, selectedShift, refreshKey]);

  return (
    <>
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col min-h-[450px]">
        <h2 className="text-xl font-semibold mb-4 truncate" title={wallet.name}>{wallet.name}</h2>
        
        <div className="mb-4">
            <button 
              onClick={() => setIsPopupOpen(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Ver Salidas del Día
            </button>
        </div>
        
        <h3 className="font-bold text-lg mb-2 text-gray-300 border-t border-gray-700 pt-4">Ingresos del Turno</h3>
        
        {isLoading ? (
          <div className="flex-grow flex items-center justify-center"><p className="text-gray-400 animate-pulse">Cargando...</p></div>
        ) : error ? (
          <div className="flex-grow flex items-center justify-center text-center"><p className="text-red-400">⚠️<br/>{error}</p></div>
        ) : transactions.length === 0 ? (
          <div className="flex-grow flex items-center justify-center"><p className="text-gray-500">No hay ingresos.</p></div>
        ) : (
          <ul className="space-y-3 flex-grow overflow-y-auto pr-2">
            {transactions.map((tx) => (
              <li key={tx.id} className="bg-gray-700 p-3 rounded-md flex justify-between items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base truncate" title={tx.nombre}>{tx.nombre}</p>
                  {tx.cuil && <p className="text-xs text-gray-400">CUIL: {tx.cuil}</p>}
                  <p className="text-xs text-gray-400">
                    Hora: {tx.hora ? new Date(tx.hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'} hs
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-base font-mono text-green-400">+ ${tx.monto.toLocaleString('es-AR')}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage <= 1 || isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">Anterior</button>
          <span className="text-gray-400">Pág {currentPage} de {totalPages || 1}</span>
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages || isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">Siguiente</button>
        </div>
      </div>

      {isPopupOpen && (
        <OutflowsPopup 
          walletId={wallet.id} 
          walletName={wallet.name}
          // date={selectedDate}  <-- ELIMINAMOS ESTA LÍNEA
          onClose={() => setIsPopupOpen(false)} 
        />
      )}
    </>
  );
}
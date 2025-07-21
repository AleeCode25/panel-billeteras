'use client';

import { createContext, useState, useContext, ReactNode } from 'react';

// Definimos la forma de nuestro contexto
interface DashboardContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  refreshKey: number; // Una clave que cambia para forzar la actualización
  triggerRefresh: () => void;
}

// Creamos el contexto
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Creamos el "Proveedor" que envolverá nuestra aplicación
export function DashboardProvider({ children }: { children: ReactNode }) {
  const today = new Date().toLocaleDateString('en-CA');
  const [selectedDate, setSelectedDate] = useState(today);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    // Simplemente incrementamos la clave para disparar el efecto en los hijos
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <DashboardContext.Provider value={{ selectedDate, setSelectedDate, refreshKey, triggerRefresh }}>
      {children}
    </DashboardContext.Provider>
  );
}

// Creamos un "Hook" personalizado para usar el contexto fácilmente
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
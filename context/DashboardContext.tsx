'use client';

import { createContext, useState, useContext, ReactNode } from 'react';

type Shift = 'todos' | 'mañana' | 'tarde' | 'noche';

interface DashboardContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedShift: Shift;
  setSelectedShift: (shift: Shift) => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const today = new Date().toLocaleDateString('en-CA');
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedShift, setSelectedShift] = useState<Shift>('todos');
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <DashboardContext.Provider value={{ selectedDate, setSelectedDate, selectedShift, setSelectedShift, refreshKey, triggerRefresh }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
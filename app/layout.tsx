// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DashboardProvider } from '@/context/DashboardContext'; // Importamos el proveedor

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Panel de Billeteras',
  description: 'Panel de control de transacciones',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Envolvemos la app con el proveedor */}
        <DashboardProvider>
          {children}
        </DashboardProvider>
      </body>
    </html>
  );
}
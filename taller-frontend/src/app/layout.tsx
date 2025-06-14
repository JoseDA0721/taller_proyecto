import './globals.css';
import React from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Taller Mecánico',
  description: 'Sistema de gestión de clientes, vehículos y órdenes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gray-100">
          {/* Sidebar */}
          <aside className="w-64 bg-blue-800 text-white p-4">
            <h1 className="text-2xl font-bold mb-6">Taller</h1>
            <nav className="flex flex-col gap-2">
              <a href="/clientes" className="hover:bg-blue-700 p-2 rounded">Clientes</a>
              <a href="/vehiculos" className="hover:bg-blue-700 p-2 rounded">Vehículos</a>
              <a href="/ordenes" className="hover:bg-blue-700 p-2 rounded">Órdenes</a>
              <a href="/catalogo" className="hover:bg-blue-700 p-2 rounded">Catálogo</a>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}

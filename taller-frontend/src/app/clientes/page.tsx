'use client';

import React, { useEffect, useState } from 'react';
import { getClientes } from '@/services/clienteService';
import { FaPlus } from 'react-icons/fa';
import ClienteFormModal from '@/components/ClienteFormModal';


interface Cliente {
  cedula: string;
  nombre: string;
  telefono?: string;
  correo?: string;
  ciudad_id?: number;
}

const [showModal, setShowModal] = useState(false);


const ciudades = [
  { id: 1, nombre: 'Quito' },
  { id: 2, nombre: 'Guayaquil' },
  { id: 3, nombre: 'Cuenca' },
];

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ciudad, setCiudad] = useState<string | undefined>('quito');

  useEffect(() => {
    async function fetchData() {
      const data = await getClientes(ciudad);
      setClientes(data);
    }
    fetchData();
  }, [ciudad]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-[#001A30]">Clientes</h2>
        <button
  onClick={() => setShowModal(true)}
  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
>
  <FaPlus />
  Nuevo Cliente
</button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-[#001A30]">Ciudad:</label>
        <select
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          {ciudades.map((c) => (
            <option key={c.id} value={c.nombre.toLowerCase()}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="p-3 text-left">Cédula</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Teléfono</th>
              <th className="p-3 text-left">Correo</th>
              <th className="p-3 text-left">Ciudad</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.cedula} className="border-b hover:bg-gray-50">
                <td className="p-3">{cliente.cedula}</td>
                <td className="p-3">{cliente.nombre}</td>
                <td className="p-3">{cliente.telefono || '-'}</td>
                <td className="p-3">{cliente.correo || '-'}</td>
                <td className="p-3">
                  {cliente.ciudad_id === 1
                    ? 'Quito'
                    : cliente.ciudad_id === 2
                    ? 'Guayaquil'
                    : cliente.ciudad_id === 3
                    ? 'Cuenca'
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal de creación */}
    {showModal && (
      <ClienteFormModal
        onClose={() => setShowModal(false)}
        onCreated={() => getClientes(ciudad).then(setClientes)}
      />
    )}
    </div>
  );
  
}

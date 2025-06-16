'use client'

import React, { useEffect, useState } from 'react'
import { getClientes } from '@/services/clienteService'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import ClienteFormModal from '@/components/ClienteFormModal'

interface Cliente {
  cedula: string
  nombre: string
  telefono?: string
  correo?: string
  ciudad_id?: number
}

const ciudades = [
  { id: 1, nombre: 'Quito' },
  { id: 2, nombre: 'Guayaquil' },
  { id: 3, nombre: 'Cuenca' },
]

export default function ClientesPage() {
  const [showModal, setShowModal] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [ciudad, setCiudad] = useState<string | undefined>('quito')

  useEffect(() => {
    async function fetchData() {
      const data = await getClientes(ciudad)
      setClientes(data)
    }
    fetchData()
  }, [ciudad])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#001A30]">Listado de Clientes (Global)</h2>
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
          className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <th className="p-3 text-left">Correo</th>
              <th className="p-3 text-left">Teléfono</th>
              <th className="p-3 text-left">Ciudad</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.cedula} className="border-b hover:bg-gray-50">
                <td className="p-3 text-gray-900 font-medium">{cliente.cedula}</td>
                <td className="p-3 text-gray-900">{cliente.nombre}</td>
                <td className="p-3 text-gray-900">{cliente.correo || '-'}</td>
                <td className="p-3 text-gray-900">{cliente.telefono || '-'}</td>
                <td className="p-3">
                  <span className="px-2 py-1 text-xs rounded bg-gray-300 text-gray-800 font-semibold">
                    {cliente.ciudad_id === 1
                      ? 'Quito'
                      : cliente.ciudad_id === 2
                      ? 'Guayaquil'
                      : cliente.ciudad_id === 3
                      ? 'Cuenca'
                      : '-'}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button className="text-blue-600 hover:text-blue-800" title="Editar">
                    <FaEdit />
                  </button>
                  <button className="text-red-600 hover:text-red-800" title="Eliminar">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de creación */}
      {showModal && (
        <ClienteFormModal
        ciudadIdSeleccionada={
    ciudades.find((c) => c.nombre.toLowerCase() === ciudad)?.id || 1
  }
          onClose={() => setShowModal(false)}
          onCreated={() => getClientes(ciudad).then(setClientes)}
        />
      )}
    </div>
  )
}

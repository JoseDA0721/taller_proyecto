'use client'

import React, { useEffect, useState } from 'react'

interface Orden {
  orden_id: number
  fecha: string
  cliente: string
  placa: string
  estado: string
  ciudad_id: number
  total: number
}

const ciudades = [
  { id: 1, nombre: 'Quito' },
  { id: 2, nombre: 'Guayaquil' },
  { id: 3, nombre: 'Cuenca' }
]

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [ciudad, setCiudad] = useState<string>('')

  useEffect(() => {
    async function fetchOrdenes() {
      try {
        const url = ciudad
          ? `http://localhost:5000/api/ordenes?ciudad=${ciudad}`
          : 'http://localhost:5000/api/ordenes'

        const res = await fetch(url)
        const data = await res.json()
        if (Array.isArray(data)) {
          setOrdenes(data)
        } else {
          setOrdenes([])
        }
      } catch (error) {
        console.error('Error al cargar órdenes:', error)
      }
    }

    fetchOrdenes()
  }, [ciudad])

  const ciudadNombre = (id: number) =>
    id === 1 ? 'Quito' : id === 2 ? 'Guayaquil' : 'Cuenca'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#001A30]">
          Listado de Órdenes de Trabajo (Global)
        </h2>
      </div>

      {/* Filtro por ciudad */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-[#001A30]">Ciudad:</label>
        <select
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          className="border rounded px-2 py-1 text-sm text-black"
        >
          <option value="">Todas</option>
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
              <th className="p-3 text-left">ID Orden</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Placa</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Ciudad</th>
              <th className="p-3 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden) => (
              <tr key={orden.orden_id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-gray-900 font-medium">{orden.orden_id}</td>
                <td className="p-3 text-gray-900">{orden.fecha}</td>
                <td className="p-3 text-gray-900">{orden.cliente}</td>
                <td className="p-3 text-gray-900">{orden.placa}</td>
                <td className="p-3">
                  <span className="bg-cyan-400 text-white text-xs px-2 py-1 rounded font-semibold">
                    {orden.estado}
                  </span>
                </td>
                <td className="p-3">
                  <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded font-semibold">
                    {ciudadNombre(orden.ciudad_id)}
                  </span>
                </td>
                <td className="p-3 text-gray-900 font-semibold">
                  ${orden.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

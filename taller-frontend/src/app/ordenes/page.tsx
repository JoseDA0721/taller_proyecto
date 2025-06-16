'use client'

import React, { useEffect, useState } from 'react'

interface Orden {
  orden_id: string
  cliente_cedula: string
  placa: string
  fecha: string
  estado: string
  ciudad_id: number
  empleado_cedula: string
  form_pago_id: number
  total: number
}

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [resultadoBusqueda, setResultadoBusqueda] = useState<Orden | Orden[] | null>(null)
  const [busquedaId, setBusquedaId] = useState('')
  const [busquedaCedula, setBusquedaCedula] = useState('')

  const getOrdenById = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/orden/id/${busquedaId}`)
      const data = await res.json()
      console.log('Orden encontrada:', data)
      setResultadoBusqueda(data)
    } catch (error) {
      console.error('Error al obtener orden por ID:', error)
    }
  }

  const getOrdenesByCedula = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/orden/cliente/${busquedaCedula}`)
      const data = await res.json()
      console.log('Órdenes del cliente:', data)
      setResultadoBusqueda(data)
    } catch (error) {
      console.error('Error al obtener órdenes del cliente:', error)
    }
  }

  const crearOrden = async () => {
    try {
      const nuevaOrden = {
        fecha: new Date().toISOString(),
        total: 150.0,
        estado: 'En Proceso',
        cliente_cedula: '0102030405',
        ciudad_id: 3,
        placa: 'ABA-9999',
        empleado_cedula: '0100000001',
        form_pago_id: 1,
      }
      const res = await fetch('http://localhost:5000/api/orden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaOrden),
      })
      const data = await res.json()
      console.log('Orden creada:', data)
    } catch (error) {
      console.error('Error al crear orden:', error)
    }
  }

  const actualizarOrden = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/orden/${busquedaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: 'Finalizada'
        })
      })
      const data = await res.json()
      console.log('Orden actualizada:', data)
    } catch (error) {
      console.error('Error al actualizar orden:', error)
    }
  }

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/ordenes')
        const data = await res.json()
        setOrdenes(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error al obtener órdenes:', err)
      }
    }
    fetchOrdenes()
  }, [])

  const renderTabla = (data: Orden[]) => (
    <table className="min-w-full text-sm">
      <thead className="bg-blue-100 text-blue-800 font-medium">
        <tr>
          <th className="p-3 text-left">ID</th>
          <th className="p-3 text-left">Cédula</th>
          <th className="p-3 text-left">Placa</th>
          <th className="p-3 text-left">Fecha</th>
          <th className="p-3 text-left">Estado</th>
          <th className="p-3 text-left">Ciudad</th>
          <th className="p-3 text-left">Empleado</th>
          <th className="p-3 text-left">Pago</th>
          <th className="p-3 text-left">Total</th>
        </tr>
      </thead>
      <tbody>
        {data.map((orden) => (
          <tr key={orden.orden_id} className="border-b hover:bg-gray-50">
            <td className="p-3 text-[#001A30]">{orden.orden_id}</td>
            <td className="p-3 text-[#001A30]">{orden.cliente_cedula}</td>
            <td className="p-3 text-[#001A30]">{orden.placa}</td>
            <td className="p-3 text-[#001A30]">{new Date(orden.fecha).toLocaleDateString()}</td>
            <td className="p-3 text-[#001A30]">{orden.estado}</td>
            <td className="p-3 text-[#001A30]">{orden.ciudad_id}</td>
            <td className="p-3 text-[#001A30]">{orden.empleado_cedula}</td>
            <td className="p-3 text-[#001A30]">{orden.form_pago_id}</td>
            <td className="p-3 text-[#001A30]">${orden.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#001A30]">Órdenes de Compra</h2>
      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="ID"
            value={busquedaId}
            onChange={(e) => setBusquedaId(e.target.value)}
            className="border p-2 rounded text-sm"
          />
          <input
            type="text"
            placeholder="Cédula"
            value={busquedaCedula}
            onChange={(e) => setBusquedaCedula(e.target.value)}
            className="border p-2 rounded text-sm"
          />
          <button onClick={getOrdenById} className="bg-gray-200 px-3 py-1 rounded">Buscar por ID</button>
          <button onClick={getOrdenesByCedula} className="bg-gray-200 px-3 py-1 rounded">Buscar por Cédula</button>
          <button onClick={crearOrden} className="bg-green-500 text-white px-3 py-1 rounded">Crear Orden</button>
          <button onClick={actualizarOrden} className="bg-blue-500 text-white px-3 py-1 rounded">Actualizar Orden</button>
        </div>

        {resultadoBusqueda && (
          <div className="mt-6">
            <h3 className="text-xl font-bold text-[#001A30] mb-2">Resultado de Búsqueda</h3>
            {renderTabla(Array.isArray(resultadoBusqueda) ? resultadoBusqueda : [resultadoBusqueda])}
          </div>
        )}

        {renderTabla(ordenes)}
      </div>
    </div>
  )
}

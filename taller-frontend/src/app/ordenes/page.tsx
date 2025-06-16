'use client'

import React, { useEffect, useState } from 'react'
import CrearOrdenModal from './CrearOrdenModal' // ajusta la ruta si tu carpeta se llama diferente

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

  const [nuevaOrden, setNuevaOrden] = useState({
  cliente_cedula: '',
  placa: '',
  fecha: new Date().toISOString().slice(0, 10),
  estado: 'En Proceso',
  ciudad_id: 3,
  empleado_cedula: '',
  form_pago_id: 1,
  total: 0
})

const [mostrarFormulario, setMostrarFormulario] = useState(false)


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
    const res = await fetch('http://localhost:5000/api/orden', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaOrden)
    })
    const data = await res.json()
    console.log('Orden creada:', data)
    setMostrarFormulario(false)
    // Recargar lista
    const updated = await fetch('http://localhost:5000/api/ordenes')
    const ordenesActualizadas = await updated.json()
    setOrdenes(Array.isArray(ordenesActualizadas) ? ordenesActualizadas : [])
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
            <td className="p-3">
              <span className="px-2 py-1 text-xs rounded bg-gray-300 text-gray-800 font-semibold">
                {getNombreCiudad(orden.ciudad_id)}
              </span>
            </td>
            <td className="p-3 text-[#001A30]">{orden.empleado_cedula}</td>
            <td className="p-3 text-[#001A30]">{getNombrePago(orden.form_pago_id)}</td>
            <td className="p-3 text-[#001A30]">${orden.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  const getNombreCiudad = (id: number) => {
  switch (id) {
    case 1: return 'Quito'
    case 2: return 'Guayaquil'
    case 3: return 'Cuenca'
    default: return 'Desconocida'
  }
}

const getNombrePago = (id: number) => {
  switch (id) {
    case 1: return 'Efectivo'
    case 2: return 'Crédito'
    case 3: return 'Transferencia'
    default: return 'Otro'
  }
}


  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#001A30]">Órdenes de Compra</h2>
      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <input
            type="text"
            placeholder="ID"
            value={busquedaId}
            onChange={(e) => setBusquedaId(e.target.value)}
            className="border border-gray-300 p-2 rounded text-sm text-gray-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Cédula"
            value={busquedaCedula}
            onChange={(e) => setBusquedaCedula(e.target.value)}
            className="border border-gray-300 p-2 rounded text-sm text-gray-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={getOrdenById}
            className="bg-gray-300 hover:bg-gray-400 text-[#001A30] px-4 py-2 rounded font-medium transition"
          >
            Buscar por ID
          </button>
          <button
            onClick={getOrdenesByCedula}
            className="bg-gray-300 hover:bg-gray-400 text-[#001A30] px-4 py-2 rounded font-medium transition"
          >
            Buscar por Cédula
          </button>
          <CrearOrdenModal onSuccess={() => window.location.reload()} />
          <button
            onClick={actualizarOrden}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition"
          >
            Actualizar Orden
          </button>
        </div>

    {mostrarFormulario && (
  <div className="bg-gray-50 border rounded p-4 mt-4 space-y-3">
    <h3 className="text-lg font-semibold">Nueva Orden</h3>
    <div className="grid grid-cols-2 gap-4">
      <input type="text" placeholder="Cédula del Cliente"
        value={nuevaOrden.cliente_cedula}
        onChange={(e) => setNuevaOrden({ ...nuevaOrden, cliente_cedula: e.target.value })}
        className="border p-2 rounded" />
      
      <input type="text" placeholder="Placa"
        value={nuevaOrden.placa}
        onChange={(e) => setNuevaOrden({ ...nuevaOrden, placa: e.target.value })}
        className="border p-2 rounded" />

      <input type="date" placeholder="Fecha"
        value={nuevaOrden.fecha}
        onChange={(e) => setNuevaOrden({ ...nuevaOrden, fecha: e.target.value })}
        className="border p-2 rounded" />

      <select value={nuevaOrden.estado}
        onChange={(e) => setNuevaOrden({ ...nuevaOrden, estado: e.target.value })}
        className="border p-2 rounded">
        <option value="En Proceso">En Proceso</option>
        <option value="Finalizada">Finalizada</option>
        <option value="Recibida">Recibida</option>
      </select>

      <input type="number" placeholder="Ciudad ID"
        value={nuevaOrden.ciudad_id}
        onChange={(e) => setNuevaOrden({ ...nuevaOrden, ciudad_id: Number(e.target.value) })}
        className="border p-2 rounded" />

      <input type="text" placeholder="Cédula del Empleado"
        value={nuevaOrden.empleado_cedula}
        onChange={(e) => setNuevaOrden({ ...nuevaOrden, empleado_cedula: e.target.value })}
        className="border p-2 rounded" />

      <input type="number" placeholder="Forma de Pago ID"
        value={nuevaOrden.form_pago_id}
        onChange={(e) => setNuevaOrden({ ...nuevaOrden, form_pago_id: Number(e.target.value) })}
        className="border p-2 rounded" />

      <input type="number" placeholder="Total ($)"
        value={nuevaOrden.total}
        onChange={(e) => setNuevaOrden({ ...nuevaOrden, total: Number(e.target.value) })}
        className="border p-2 rounded" />
    </div>

    <div className="flex gap-3 mt-4">
      <button onClick={crearOrden} className="bg-green-600 text-white px-4 py-1 rounded">Guardar</button>
      <button onClick={() => setMostrarFormulario(false)} className="bg-red-500 text-white px-4 py-1 rounded">Cancelar</button>
    </div>
  </div>
)}


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
